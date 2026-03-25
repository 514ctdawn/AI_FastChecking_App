import type { SocialPlatform } from './platforms.js'
import { detectPlatform } from './platforms.js'

export interface MentionPayload {
  platform: SocialPlatform
  parentId?: string
  replyToId?: string
  userHandle: string | null
  userId: string | null
  /** Comment / reply text (e.g. "@VeriSenior 幫我查證") */
  commentText: string | null
  /** Optional permalink from webhook payload */
  sourceUrlHint: string | null
  /** Parent post body text when provided directly (flat or Meta payload) */
  parentPostText: string | null
}

function asRecord(v: unknown): Record<string, unknown> | null {
  return v && typeof v === 'object' && !Array.isArray(v) ? (v as Record<string, unknown>) : null
}

/** Handles Mention webhooks (e.g. comment with @VeriSenior 幫我查證). */
export function extractMentionPayload(body: Record<string, unknown>): MentionPayload {
  const platform = detectPlatform(body)

  let parentId: string | undefined
  let replyToId: string | undefined
  let userHandle: string | null = null
  let userId: string | null = null
  let commentText: string | null = null
  let sourceUrlHint: string | null = null
  let parentPostText: string | null = null

  const rawEntry = body.entry
  const entry = Array.isArray(rawEntry)
    ? asRecord(rawEntry[0])
    : asRecord(rawEntry)
  if (entry) {
    parentId =
      (entry.parent_id as string) ||
      (entry.parentId as string) ||
      (entry.parent_post_id as string) ||
      undefined
    replyToId = (entry.reply_to_id as string) || (entry.replyToId as string)
    userHandle = (entry.user_handle as string) || (entry.userHandle as string) || null
    userId = (entry.user_id as string) || (entry.userId as string) || null
    commentText =
      (entry.comment_text as string) || (entry.text as string) || (entry.message as string) || null
    sourceUrlHint = (entry.permalink as string) || (entry.permalink_url as string) || null
    const ep = entry.parent_post_text ?? entry.post_text
    if (typeof ep === 'string' && ep.trim()) parentPostText = ep.trim()
  }

  const mention = asRecord(body.mention)
  if (mention) {
    parentId =
      parentId ||
      (mention.parent_id as string) ||
      (mention.parentId as string) ||
      (mention.parent_post_id as string) ||
      undefined
    replyToId = replyToId || (mention.reply_to_id as string) || (mention.replyToId as string)
    userHandle = userHandle || (mention.user_handle as string) || null
    userId = userId || (mention.user_id as string) || null
    commentText = commentText || (mention.text as string) || (mention.message as string) || null
    sourceUrlHint = sourceUrlHint || (mention.permalink as string) || null
    const mp = mention.parent_post_text ?? mention.post_text
    if (typeof mp === 'string' && mp.trim()) parentPostText = parentPostText || mp.trim()
  }

  if (typeof body.parent_post_id === 'string' && body.parent_post_id.trim()) {
    parentId = parentId || body.parent_post_id.trim()
  }

  if (typeof body.parent_post_text === 'string' && body.parent_post_text.trim()) {
    parentPostText = body.parent_post_text.trim()
  } else if (typeof body.post_text === 'string' && body.post_text.trim()) {
    parentPostText = body.post_text.trim()
  }

  const topCommentOnly = body.comment_text ?? body.reply_text
  if (typeof topCommentOnly === 'string' && topCommentOnly.trim()) {
    commentText = commentText || topCommentOnly.trim()
  }
  const topMsg = body.message
  if (typeof topMsg === 'string' && topMsg.trim() && !commentText) {
    commentText = topMsg.trim()
  }

  if (
    !parentPostText &&
    typeof body.post_id === 'string' &&
    typeof body.text === 'string' &&
    typeof body.comment_text === 'string'
  ) {
    parentPostText = body.text.trim()
  } else if (
    !parentPostText &&
    typeof body.post_id === 'string' &&
    typeof body.text === 'string' &&
    !body.comment_text
  ) {
    parentPostText = body.text.trim()
  }

  const topPermalink = body.permalink ?? body.permalink_url
  if (typeof topPermalink === 'string' && /^https?:\/\//i.test(topPermalink)) {
    sourceUrlHint = sourceUrlHint || topPermalink
  }

  const tweetEvents = body.tweet_create_events
  if (Array.isArray(tweetEvents) && tweetEvents.length > 0) {
    const tw = asRecord(tweetEvents[0])
    if (tw) {
      replyToId = (tw.in_reply_to_status_id_str as string) || replyToId
      parentId = parentId || replyToId
      const user = asRecord(tw.user)
      userHandle = userHandle || (user?.screen_name ? `@${String(user.screen_name)}` : null)
      userId = userId || (user?.id_str as string) || null
      commentText = commentText || (tw.text as string) || null
    }
  }

  const metaEntry = body.entry
  if (Array.isArray(metaEntry) && metaEntry.length > 0) {
    const e = asRecord(metaEntry[0])
    const changes = e?.changes
    if (Array.isArray(changes)) {
      const ch = asRecord(changes[0])
      const value = asRecord(ch?.value)
      if (value) {
        parentId =
          parentId ||
          (value.parent_post_id as string) ||
          (value.parent_id as string) ||
          (value.post_id as string)
        replyToId = replyToId || (value.comment_id as string)
        const from = asRecord(value.from)
        userId = userId || (from?.id as string) || null
        commentText =
          commentText ||
          (value.message as string) ||
          (value.text as string) ||
          (value.body as string) ||
          null
        const vPerm = value.permalink_url ?? value.permalink
        if (typeof vPerm === 'string' && /^https?:\/\//i.test(vPerm)) {
          sourceUrlHint = sourceUrlHint || vPerm
        }
      }
    }
  }

  return {
    platform,
    parentId,
    replyToId,
    userHandle,
    userId,
    commentText,
    sourceUrlHint,
    parentPostText,
  }
}
