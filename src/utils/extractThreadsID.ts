/**
 * Extract Threads post id from a Threads URL.
 * Example:
 * - https://www.threads.net/@user/post/DWSDJGvlagZ
 */
export function extractThreadsID(url: string): string | null {
  if (typeof url !== 'string') return null
  const trimmed = url.trim()
  if (!trimmed) return null

  let parsed: URL | null = null
  try {
    parsed = new URL(trimmed)
  } catch {
    parsed = null
  }

  if (parsed) {
    const host = parsed.hostname.toLowerCase()
    const isThreadsHost =
      host === 'threads.net' || host === 'threads.com' || host.endsWith('.threads.net') || host.endsWith('.threads.com')
    if (!isThreadsHost) return null

    const m = parsed.pathname.match(/\/post\/([^/?#]+)/i)
    return m?.[1] ? String(m[1]) : null
  }

  const m = trimmed.match(/\/post\/([^/?#]+)/i)
  return m?.[1] ? String(m[1]) : null
}

