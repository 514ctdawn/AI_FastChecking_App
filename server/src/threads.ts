/** Threads URL utilities (used by deep-link verification). */

/**
 * Extract Threads post id from URLs like:
 * - https://www.threads.net/@user/post/ABC123
 * - https://threads.com/@user/post/ABC123
 */
export function extractThreadsID(url: string): string | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  let u: URL
  try {
    u = new URL(trimmed)
  } catch {
    // Not a valid URL; still try a plain regex match as a fallback.
    const m = trimmed.match(/\/post\/([^/?#]+)/i)
    return m?.[1] ? String(m[1]) : null
  }

  const host = u.hostname.toLowerCase()
  const isThreadsHost = host === 'threads.net' || host === 'threads.com' || host.endsWith('.threads.net') || host.endsWith('.threads.com')
  if (!isThreadsHost) return null

  const m = u.pathname.match(/\/post\/([^/?#]+)/i)
  return m?.[1] ? String(m[1]) : null
}

