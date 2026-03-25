import type { ApiVerificationRow, VerificationDetail, VerificationListItem } from '../types/verification'
import { formatAsTraditionalChinese } from './traditionalChinese'

export function formatRelativeTime(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const diff = Date.now() - d.getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1) return '剛剛'
  if (m < 60) return `${m} 分鐘前`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h} 小時前`
  const days = Math.floor(h / 24)
  return days <= 1 ? '昨天' : `${days} 天前`
}

export function isThreadsPlatform(platformSource: string): boolean {
  return platformSource.toLowerCase().includes('thread')
}

/** Human-readable source for meta line (e.g. Threads, Facebook). */
export function formatPlatformDisplayLabel(platform: string): string {
  const p = platform.toLowerCase()
  if (p.includes('thread')) return 'Threads'
  if (p === 'facebook' || p.includes('facebook') || p.includes('meta')) return 'Facebook'
  if (p.includes('twitter')) return 'X'
  if (p.includes('whatsapp')) return 'WhatsApp'
  if (p.includes('douyin')) return 'Douyin'
  return platform || '社群'
}

/** Dashboard loading line while AI runs on webhook-pulled content */
export function processingLabelForPlatform(platformSource: string): string {
  const p = platformSource.toLowerCase()
  if (p.includes('thread')) return '「正在從 Threads 擷取內容...」'
  return '「AI 正在核實社群內容...」'
}

function processingSnippet(_platformSource: string): string {
  return processingLabelForPlatform(_platformSource)
}

function processingExplanation(_platformSource: string): string {
  const p = _platformSource.toLowerCase()
  if (p.includes('thread')) return '正在從 Threads 擷取內容，請稍候。'
  return 'AI 正在核實社群內容，請稍候。'
}

function mapApiStatus(s: ApiVerificationRow['status']): VerificationDetail['status'] {
  if (!s) return 'caution'
  if (s === 'True') return 'true'
  if (s === 'False') return 'false'
  return 'caution'
}

export function apiRowToListItem(row: ApiVerificationRow): VerificationListItem {
  const srcUrl = row.source_url ?? null

  if (row.analysis_state === 'pending') {
    return {
      id: row.id,
      snippet: row.original_content?.trim() || processingSnippet(row.platform_source),
      platform: row.platform_source,
      status: 'processing',
      date: formatRelativeTime(row.created_at),
    }
  }
  if (row.analysis_state === 'error') {
    return {
      id: row.id,
      snippet: row.error_message || '無法讀取此不公開貼文',
      platform: row.platform_source,
      status: 'error',
      date: formatRelativeTime(row.created_at),
      errorMessage: row.error_message || undefined,
    }
  }
  const text = row.original_content?.trim() || '（無內容）'
  const snippet = text.length > 80 ? `${text.slice(0, 80)}…` : text
  return {
    id: row.id,
    snippet,
    platform: row.platform_source,
    status: mapApiStatus(row.status),
    date: formatRelativeTime(row.created_at),
    sourceUrl: srcUrl,
  }
}

export function apiRowToDetail(row: ApiVerificationRow): VerificationDetail {
  const srcUrl = row.source_url ?? null

  if (row.analysis_state === 'pending') {
    return {
      id: row.id,
      snippet: row.original_content?.trim() || processingSnippet(row.platform_source),
      status: 'processing',
      simpleExplanation: formatAsTraditionalChinese(processingExplanation(row.platform_source)),
      verifiedByAi: true,
      platformSource: row.platform_source,
      sourceUrl: srcUrl,
    }
  }
  if (row.analysis_state === 'error') {
    return {
      id: row.id,
      snippet: row.original_content?.trim() || '—',
      status: 'error',
      simpleExplanation: formatAsTraditionalChinese(row.error_message || '無法讀取此不公開貼文'),
      errorMessage: row.error_message || undefined,
      verifiedByAi: true,
      platformSource: row.platform_source,
      sourceUrl: srcUrl,
    }
  }
  return {
    id: row.id,
    snippet: row.original_content?.trim() || '—',
    status: mapApiStatus(row.status),
    simpleExplanation: formatAsTraditionalChinese(row.explanation || row.analysis || '—'),
    originalContent: row.original_content,
    imageUrl: row.image_url,
    confidence: row.confidence,
    verifiedByAi: true,
    platformSource: row.platform_source,
    sourceUrl: srcUrl,
  }
}
