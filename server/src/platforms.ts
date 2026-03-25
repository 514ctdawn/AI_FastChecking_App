/**
 * Fetches parent post content from Threads (Graph), Meta (FB), or Twitter/X.
 * Set THREADS_ACCESS_TOKEN / META_ACCESS_TOKEN / TWITTER_BEARER_TOKEN for live data.
 */

export interface ParentContentResult {
  text: string
  imageUrl: string | null
  userHandle: string | null
  /** Web URL to open the original post (Threads permalink when available) */
  sourceUrl: string | null
}

export type SocialPlatform = 'threads' | 'meta' | 'twitter' | 'unknown'

export function detectPlatform(body: Record<string, unknown>): SocialPlatform {
  const obj = String(body.object || '').toLowerCase()
  if (body.platform === 'threads' || obj.includes('thread')) return 'threads'
  if (obj.includes('instagram') || body.platform === 'meta') return 'meta'
  if (body.platform === 'twitter' || body.tweet_create_events) return 'twitter'
  return 'unknown'
}

/** Public URL for opening a Threads post in the browser (fallback when Graph omits permalink). */
export function buildThreadsPostUrl(mediaId: string): string {
  return `https://www.threads.net/post/${encodeURIComponent(mediaId)}`
}

/** Threads Graph API (graph.threads.net) — requires Threads app + token with threads scopes */
async function fetchThreadsGraphMedia(mediaId: string): Promise<ParentContentResult> {
  const token = process.env.THREADS_ACCESS_TOKEN || process.env.META_ACCESS_TOKEN
  if (!token) {
    return {
      text: `[示範模式] 請設定 THREADS_ACCESS_TOKEN（或 META_ACCESS_TOKEN）與有效 parent media id 以取得真實 Threads 貼文。id=${mediaId}`,
      imageUrl: null,
      userHandle: null,
      sourceUrl: buildThreadsPostUrl(mediaId),
    }
  }
  const fields = encodeURIComponent('id,text,media_type,media_url,permalink,thumbnail_url')
  const url = `https://graph.threads.net/v1.0/${encodeURIComponent(mediaId)}?fields=${fields}&access_token=${encodeURIComponent(token)}`
  const res = await fetch(url)
  if (res.status === 400 || res.status === 403 || res.status === 404) {
    throw new Error('PRIVATE_OR_UNAVAILABLE')
  }
  if (!res.ok) throw new Error(`THREADS_API_${res.status}`)
  const data = (await res.json()) as {
    text?: string
    media_url?: string
    thumbnail_url?: string
    permalink?: string
  }
  const text = data.text ?? ''
  const imageUrl =
    data.media_url && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(data.media_url)
      ? data.media_url
      : data.thumbnail_url && /\.(jpg|jpeg|png|gif|webp)(\?|$)/i.test(data.thumbnail_url)
        ? data.thumbnail_url
        : null
  const sourceUrl =
    typeof data.permalink === 'string' && /^https?:\/\//i.test(data.permalink)
      ? data.permalink
      : buildThreadsPostUrl(mediaId)
  return { text, imageUrl, userHandle: null, sourceUrl }
}

export async function fetchParentContent(params: {
  platform: SocialPlatform
  parentId?: string
  replyToId?: string
  userHandleHint?: string | null
}): Promise<ParentContentResult> {
  const { platform, parentId, replyToId } = params
  const targetId = parentId || replyToId

  if (platform === 'threads' && targetId) {
    return fetchThreadsGraphMedia(targetId)
  }

  if (platform === 'twitter' && process.env.TWITTER_BEARER_TOKEN && targetId) {
    const url = `https://api.twitter.com/2/tweets/${encodeURIComponent(targetId)}?tweet.fields=attachments&expansions=attachments.media_keys&media.fields=url`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${process.env.TWITTER_BEARER_TOKEN}` },
    })
    if (res.status === 403 || res.status === 404) {
      throw new Error('PRIVATE_OR_UNAVAILABLE')
    }
    if (!res.ok) throw new Error(`TWITTER_API_${res.status}`)
    const data = (await res.json()) as {
      data?: { text?: string; attachments?: { media_keys?: string[] } }
      includes?: { media?: Array<{ url?: string }> }
    }
    const text = data.data?.text ?? ''
    const media = data.includes?.media?.[0]
    const imageUrl = media?.url && media.url.match(/\.(jpg|jpeg|png|gif|webp)/i) ? media.url : null
    const sourceUrl = `https://twitter.com/i/web/status/${encodeURIComponent(targetId)}`
    return { text, imageUrl, userHandle: params.userHandleHint ?? null, sourceUrl }
  }

  if (platform === 'meta' && process.env.META_ACCESS_TOKEN && targetId) {
    const url = `https://graph.facebook.com/v21.0/${encodeURIComponent(targetId)}?fields=message,full_picture,permalink_url,from&access_token=${encodeURIComponent(process.env.META_ACCESS_TOKEN)}`
    const res = await fetch(url)
    if (res.status === 400 || res.status === 403 || res.status === 404) {
      throw new Error('PRIVATE_OR_UNAVAILABLE')
    }
    if (!res.ok) throw new Error(`META_API_${res.status}`)
    const data = (await res.json()) as {
      message?: string
      full_picture?: string
      permalink_url?: string
      from?: { name?: string }
    }
    const sourceUrl =
      typeof data.permalink_url === 'string' && /^https?:\/\//i.test(data.permalink_url)
        ? data.permalink_url
        : null
    return {
      text: data.message ?? '',
      imageUrl: data.full_picture ?? null,
      userHandle: params.userHandleHint ?? null,
      sourceUrl,
    }
  }

  if (!targetId && !params.userHandleHint) {
    throw new Error('PRIVATE_OR_UNAVAILABLE')
  }

  const fallbackSource = targetId ? buildThreadsPostUrl(targetId) : null
  return {
    text: `[示範模式] 無法連線至平台 API 時的模擬原文。parent=${targetId ?? 'n/a'}。請設定 THREADS_ACCESS_TOKEN、META_ACCESS_TOKEN 或 TWITTER_BEARER_TOKEN 以取得真實貼文。`,
    imageUrl: null,
    userHandle: params.userHandleHint ?? null,
    sourceUrl: fallbackSource,
  }
}
