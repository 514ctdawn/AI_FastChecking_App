import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import type { VerificationRow } from './types.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DATA_DIR = join(__dirname, '..', 'data')
const FILE = join(DATA_DIR, 'verifications.json')

function normalizeRow(r: Record<string, unknown>): VerificationRow {
  return {
    id: String(r.id ?? ''),
    original_content: String(r.original_content ?? ''),
    platform_source: String(r.platform_source ?? 'unknown'),
    status: (r.status as VerificationRow['status']) ?? null,
    explanation: String(r.explanation ?? ''),
    confidence: typeof r.confidence === 'number' ? r.confidence : null,
    created_at: String(r.created_at ?? new Date().toISOString()),
    user_id: r.user_id != null ? String(r.user_id) : null,
    user_handle: r.user_handle != null ? String(r.user_handle) : null,
    image_url: r.image_url != null ? String(r.image_url) : null,
    analysis_state: (r.analysis_state as VerificationRow['analysis_state']) ?? 'pending',
    error_message: r.error_message != null ? String(r.error_message) : null,
    source_url: r.source_url != null ? String(r.source_url) : null,
  }
}

export function loadRows(): VerificationRow[] {
  try {
    if (!existsSync(FILE)) return []
    const raw = readFileSync(FILE, 'utf-8')
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed.map((x) => normalizeRow(x as Record<string, unknown>))
  } catch {
    return []
  }
}

export function saveRows(rows: VerificationRow[]): void {
  try {
    mkdirSync(DATA_DIR, { recursive: true })
    writeFileSync(FILE, JSON.stringify(rows, null, 2), 'utf-8')
  } catch (e) {
    console.error('[persistence] save failed', e)
  }
}
