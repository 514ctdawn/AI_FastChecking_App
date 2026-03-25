import 'dotenv/config'
import { appendFileSync, mkdirSync } from 'node:fs'
import { join } from 'node:path'
import cors from 'cors'
import express from 'express'
import { analyzeContent } from './ai.js'
import { extractMentionPayload } from './webhookPayload.js'
import type { ParentContentResult, SocialPlatform } from './platforms.js'
import { buildThreadsPostUrl, fetchParentContent } from './platforms.js'
import { extractThreadsID } from './threads.js'
import { insertPending, listVerifications, setComplete, setError } from './store.js'
import { isVeriSeniorVerificationRequest } from './verificationRequest.js'

const PORT = Number(process.env.PORT) || 3001
const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'verisenior-dev-token'

const app = express()
app.use(cors({ origin: true }))
// Debug: log incoming API requests so we can confirm webhooks reach this server.
// IMPORTANT: place before `express.json()` so we still log when JSON parsing fails.
const WEBHOOK_DEBUG_DIR = join(process.cwd(), 'data')
const WEBHOOK_DEBUG_LOG = join(WEBHOOK_DEBUG_DIR, 'webhook-debug.log')
try {
  mkdirSync(WEBHOOK_DEBUG_DIR, { recursive: true })
  // Ensure the file exists so you can confirm it was/wasn't written.
  appendFileSync(WEBHOOK_DEBUG_LOG, '')
} catch {
  // ignore
}
function logWebhookDebug(line: Record<string, unknown>): void {
  try {
    appendFileSync(WEBHOOK_DEBUG_LOG, `${JSON.stringify({ ts: new Date().toISOString(), ...line })}\n`)
  } catch {
    // ignore
  }
}

app.use((req, _res, next) => {
  if (req.path.startsWith('/api/')) {
    // Do not access `req.body` here (body may not be parsed yet / parsing can fail).
    const contentType = req.headers['content-type']
    console.log('[webhook-debug] incoming', req.method, req.originalUrl, 'content-type=', contentType)
    logWebhookDebug({
      level: 'incoming',
      method: req.method,
      path: req.originalUrl,
      contentType: String(contentType ?? ''),
    })
  }
  next()
})

app.use(express.json({ limit: '2mb' }))

app.get('/api/health', (_req, res) => {
  res.json({ ok: true })
})

app.get('/api/verifications', (_req, res) => {
  const rows = listVerifications().map((r) => ({
    ...r,
    analysis: r.explanation,
  }))
  res.json(rows)
})

async function processThreadsUrlVerification(rowId: string, postId: string): Promise<void> {
  try {
    const content: ParentContentResult = await fetchParentContent({
      platform: 'threads',
      parentId: postId,
      userHandleHint: null,
    })

    const combinedText = [content.text, content.imageUrl ? `(圖片: ${content.imageUrl})` : '']
      .filter(Boolean)
      .join('\n')

    const ai = await analyzeContent(combinedText)

    setComplete(rowId, {
      original_content: content.text || combinedText,
      image_url: content.imageUrl,
      status: ai.status,
      explanation: ai.explanation,
      confidence: ai.confidence,
      source_url: content.sourceUrl,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    setError(rowId, msg.length < 120 ? msg : '處理時發生錯誤，請稍後再試。')
  }
}

/**
 * Deep link: create a verification row from a Threads post URL.
 * Returns immediately with `id`, and performs analysis asynchronously.
 */
app.post('/api/verify/threads/from-url', (req, res) => {
  const raw = req.body as Record<string, unknown>
  const url = typeof raw?.url === 'string' ? raw.url : ''
  const postId = url ? extractThreadsID(url) : null

  if (!postId) {
    res.status(400).json({ error: 'Invalid Threads URL' })
    return
  }

  const row = insertPending({
    platform_source: 'threads',
    user_handle: null,
    user_id: null,
    original_content: `[Threads] ${postId}`,
  })

  res.status(202).json({ accepted: true, id: row.id })
  setImmediate(() => {
    void processThreadsUrlVerification(row.id, postId)
  })
})

function hubChallenge(req: express.Request, res: express.Response): void {
  const mode = req.query['hub.mode'] as string | undefined
  const token = req.query['hub.verify_token'] as string | undefined
  const challenge = req.query['hub.challenge'] as string | undefined
  if (mode === 'subscribe' && token === VERIFY_TOKEN && challenge) {
    res.status(200).send(challenge)
    return
  }
  res.sendStatus(403)
}

/** Meta subscription verify (legacy + Threads callback) */
app.get('/api/webhooks/social', hubChallenge)
app.get('/api/webhook/threads', hubChallenge)
/** Primary URL for Meta Dashboard: `https://<host>/api/webhook` */
app.get('/api/webhook', hubChallenge)
/** Meta Graph / Page webhooks: `https://<host>/api/webhook/meta` */
app.get('/api/webhook/meta', hubChallenge)

function resolveFetchPlatform(payload: ReturnType<typeof extractMentionPayload>, forceThreads: boolean): SocialPlatform {
  if (forceThreads) return 'threads'
  switch (payload.platform) {
    case 'twitter':
      return 'twitter'
    case 'threads':
      return 'threads'
    case 'meta':
      return 'meta'
    default:
      return 'meta'
  }
}

function normalizeThreadsWebhookBody(body: Record<string, unknown>): Record<string, unknown> {
  const postIdRaw = body.post_id ?? body.postId ?? body.parent_post_id
  if (typeof postIdRaw !== 'string' || !postIdRaw.trim()) return body
  const postId = postIdRaw.trim()
  const existingEntry = body.entry
  const entryObj =
    existingEntry && typeof existingEntry === 'object' && !Array.isArray(existingEntry)
      ? (existingEntry as Record<string, unknown>)
      : {}
  return {
    ...body,
    object: body.object ?? 'threads',
    platform: body.platform ?? 'threads',
    parent_post_text: body.parent_post_text ?? body.post_text ?? null,
    entry: {
      ...entryObj,
      parent_id: postId,
      post_id: postId,
      comment_text:
        body.comment_text ?? body.reply_text ?? (entryObj.comment_text as string) ?? null,
    },
  }
}

/** Flat `{ post_id, text }` / `{ parent_post_id }` payloads get a normalized shape. */
function mergeWebhookBody(raw: Record<string, unknown>, forceThreads: boolean): Record<string, unknown> {
  if (forceThreads) return normalizeThreadsWebhookBody(raw)
  if (typeof raw.post_id === 'string' && raw.post_id.trim()) return normalizeThreadsWebhookBody(raw)
  if (typeof raw.parent_post_id === 'string' && raw.parent_post_id.trim()) {
    return normalizeThreadsWebhookBody({ ...raw, post_id: raw.parent_post_id })
  }
  return raw
}

async function processMentionRow(
  rowId: string,
  payload: ReturnType<typeof extractMentionPayload>,
  fetchPlatform: SocialPlatform
): Promise<void> {
  try {
    let content: ParentContentResult
    if (payload.parentPostText?.trim()) {
      const pid = payload.parentId || payload.replyToId || ''
      content = {
        text: payload.parentPostText.trim(),
        imageUrl: null,
        userHandle: payload.userHandle,
        sourceUrl: payload.sourceUrlHint ?? (pid ? buildThreadsPostUrl(pid) : null),
      }
    } else {
      content = await fetchParentContent({
        platform: fetchPlatform,
        parentId: payload.parentId,
        replyToId: payload.replyToId,
        userHandleHint: payload.userHandle,
      })
    }
    const combinedText = [content.text, content.imageUrl ? `(圖片: ${content.imageUrl})` : '']
      .filter(Boolean)
      .join('\n')
    const ai = await analyzeContent(combinedText)
    const sourceUrl = content.sourceUrl ?? payload.sourceUrlHint ?? null
    setComplete(rowId, {
      original_content: content.text || combinedText,
      image_url: content.imageUrl,
      status: ai.status,
      explanation: ai.explanation,
      confidence: ai.confidence,
      source_url: sourceUrl,
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    if (msg === 'PRIVATE_OR_UNAVAILABLE') {
      setError(rowId, '無法查核：貼文設為不公開')
    } else if (msg.startsWith('OPENAI_') || msg.startsWith('GEMINI_')) {
      setError(rowId, 'AI 分析暫時無法使用，請稍後再試。')
    } else {
      setError(rowId, msg.length < 120 ? msg : '處理時發生錯誤，請稍後再試。')
    }
  }
}

function handleMentionWebhook(
  req: express.Request,
  res: express.Response,
  opts: { forceThreads: boolean; platformSource?: string }
): void {
  const raw = req.body as Record<string, unknown>
  if (!raw || typeof raw !== 'object') {
    res.status(400).json({ error: 'Invalid JSON' })
    return
  }

  const body = mergeWebhookBody(raw, opts.forceThreads)
  const payload = extractMentionPayload(body)
  if (!isVeriSeniorVerificationRequest(payload.commentText)) {
    res.status(200).json({ ignored: true, reason: 'not_verification_request' })
    return
  }

  const fetchPlatform = resolveFetchPlatform(payload, opts.forceThreads)
  const platformSource =
    opts.platformSource ??
    (payload.platform === 'twitter'
      ? 'twitter'
      : payload.platform === 'threads'
        ? 'threads'
        : payload.platform === 'meta'
          ? 'meta'
          : String(body.platform_source || body.platform || 'unknown'))

  const row = insertPending({
    platform_source: platformSource,
    user_handle: payload.userHandle,
    user_id: payload.userId,
  })

  res.status(202).json({ accepted: true, id: row.id })

  setImmediate(() => {
    void processMentionRow(row.id, payload, fetchPlatform)
  })
}

/** Legacy unified social webhook */
app.post('/api/webhooks/social', (req, res) => {
  handleMentionWebhook(req, res, { forceThreads: false })
})

/** Threads: `https://<your-host>/api/webhook/threads` */
app.post('/api/webhook/threads', (req, res) => {
  handleMentionWebhook(req, res, { forceThreads: true, platformSource: 'threads' })
})

/** Meta 後台 Webhook 建議填：`https://<your-host>/api/webhook` */
app.post('/api/webhook', (req, res) => {
  handleMentionWebhook(req, res, { forceThreads: true, platformSource: 'threads' })
})

/**
 * Meta Graph（Facebook / Instagram 等）— 使用 `META_ACCESS_TOKEN` 拉 parent 貼文。
 * Threads 亦可使用 `/api/webhook`；此路由明確標示 Meta 產品線。
 */
app.post('/api/webhook/meta', (req, res) => {
  handleMentionWebhook(req, res, { forceThreads: false, platformSource: 'facebook' })
})

app.use(
  (
    err: unknown,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error(err)
    res.status(500).json({ error: 'Internal server error' })
  }
)

app.listen(PORT, () => {
  console.log(`VeriSenior API listening on http://localhost:${PORT}`)
  console.log(`GET  /api/verifications`)
  console.log(`GET  /api/webhook  (Meta verify)`)
  console.log(`POST /api/webhook  (Threads mentions → dashboard)`)
  console.log(`POST /api/webhooks/social`)
  console.log(`POST /api/webhook/threads`)
  console.log(`GET  /api/webhook/meta  (Meta verify)`)
  console.log(`POST /api/webhook/meta  (Meta Graph mentions)`)
})
