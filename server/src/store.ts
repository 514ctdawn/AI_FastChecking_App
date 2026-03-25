import { randomUUID } from 'node:crypto'
import { loadRows, saveRows } from './persistence.js'
import type { AnalysisState, VerificationRow, VerificationStatus } from './types.js'

let rows: VerificationRow[] = loadRows()

function persist(): void {
  saveRows(rows)
}

export function listVerifications(): VerificationRow[] {
  return [...rows].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
}

export function insertPending(input: {
  platform_source: string
  user_handle: string | null
  user_id: string | null
  original_content?: string
}): VerificationRow {
  const row: VerificationRow = {
    id: randomUUID(),
    original_content: input.original_content ?? '',
    platform_source: input.platform_source,
    status: null,
    explanation: '',
    confidence: null,
    created_at: new Date().toISOString(),
    user_id: input.user_id,
    user_handle: input.user_handle,
    image_url: null,
    analysis_state: 'pending',
    error_message: null,
    source_url: null,
  }
  rows.unshift(row)
  persist()
  return row
}

export function updateRow(
  id: string,
  patch: Partial<
    Pick<
      VerificationRow,
      | 'original_content'
      | 'status'
      | 'explanation'
      | 'confidence'
      | 'image_url'
      | 'analysis_state'
      | 'error_message'
      | 'source_url'
    >
  >
): VerificationRow | undefined {
  const i = rows.findIndex((r) => r.id === id)
  if (i === -1) return undefined
  rows[i] = { ...rows[i], ...patch }
  persist()
  return rows[i]
}

export function setComplete(
  id: string,
  data: {
    original_content: string
    image_url: string | null
    status: VerificationStatus
    explanation: string
    confidence: number
    source_url: string | null
  }
): VerificationRow | undefined {
  return updateRow(id, {
    original_content: data.original_content,
    image_url: data.image_url,
    status: data.status,
    explanation: data.explanation,
    confidence: data.confidence,
    analysis_state: 'complete',
    error_message: null,
    source_url: data.source_url,
  })
}

export function setError(id: string, message: string): VerificationRow | undefined {
  return updateRow(id, {
    analysis_state: 'error',
    error_message: message,
    explanation: '',
    status: null,
    confidence: null,
  })
}
