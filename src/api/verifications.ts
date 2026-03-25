import type { ApiVerificationRow } from '../types/verification'

function apiUrl(path: string): string {
  const base = import.meta.env.VITE_API_BASE?.replace(/\/$/, '') ?? ''
  return base ? `${base}${path}` : path
}

/**
 * Fetches the latest verifications from the backend (social webhook pipeline).
 */
export async function fetchLatestVerifications(): Promise<ApiVerificationRow[]> {
  const res = await fetch(apiUrl('/api/verifications'), {
    headers: { Accept: 'application/json' },
  })
  if (!res.ok) {
    throw new Error(`GET /api/verifications failed: ${res.status}`)
  }
  const data = (await res.json()) as unknown
  if (!Array.isArray(data)) {
    throw new Error('Invalid verifications response')
  }
  return data as ApiVerificationRow[]
}
