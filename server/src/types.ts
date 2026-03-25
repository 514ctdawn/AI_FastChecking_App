export type VerificationStatus = 'True' | 'False' | 'Caution'

export type AnalysisState = 'pending' | 'complete' | 'error'

export interface VerificationRow {
  id: string
  original_content: string
  platform_source: string
  status: VerificationStatus | null
  explanation: string
  confidence: number | null
  created_at: string
  user_id: string | null
  user_handle: string | null
  image_url: string | null
  analysis_state: AnalysisState
  error_message: string | null
  /** Permalink to original Threads / social post for user verification */
  source_url: string | null
}

export interface AiAnalysisResult {
  status: VerificationStatus
  /** Traditional Chinese (Taiwan) short rationale */
  explanation: string
  confidence: number
}
