/** List card model (UI) */
export type UiVerificationStatus = 'true' | 'false' | 'caution' | 'processing' | 'error'

export interface VerificationListItem {
  id: string
  snippet: string
  platform: string
  status: UiVerificationStatus
  date: string
  errorMessage?: string
  /** Link to original Threads/social post when available */
  sourceUrl?: string | null
}

export interface VerificationDetail {
  id: string
  snippet: string
  status: UiVerificationStatus
  simpleExplanation: string
  originalContent?: string
  imageUrl?: string | null
  confidence?: number | null
  verifiedByAi?: boolean
  platformSource?: string
  errorMessage?: string
  sourceUrl?: string | null
}

/** API GET /api/verifications row */
export interface ApiVerificationRow {
  id: string
  original_content: string
  platform_source: string
  status: 'True' | 'False' | 'Caution' | null
  explanation: string
  /** Same as explanation; included for API consumers expecting `analysis`. */
  analysis?: string | null
  confidence: number | null
  created_at: string
  user_id: string | null
  user_handle: string | null
  image_url: string | null
  analysis_state: 'pending' | 'complete' | 'error'
  error_message: string | null
  /** Present on newer API responses */
  source_url?: string | null
}
