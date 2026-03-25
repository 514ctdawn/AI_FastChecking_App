function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''
  return base ? `${base}${path}` : path
}

export async function startThreadsVerificationFromUrl(url: string): Promise<{ id: string }> {
  const res = await fetch(apiUrl('/api/verify/threads/from-url'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ url }),
  })
  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`POST /api/verify/threads/from-url failed: ${res.status} ${text.slice(0, 200)}`)
  }
  const data = (await res.json()) as { id?: string }
  if (!data.id) throw new Error('Invalid response: missing id')
  return { id: data.id }
}

