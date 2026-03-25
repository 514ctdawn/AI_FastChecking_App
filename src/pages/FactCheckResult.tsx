import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Volume2, ArrowLeft, Loader2, ShieldCheck, ExternalLink } from 'lucide-react'
import { useVerifications } from '../context/VerificationsContext'
import type { VerificationDetail } from '../types/verification'
import { isThreadsPlatform } from '../utils/mapApiVerification'

const StatusDisplay = ({ status }: { status: VerificationDetail['status'] }) => {
  const config: Record<
    VerificationDetail['status'],
    { label: string; accent: string; aria: string }
  > = {
    true: { label: '真實', accent: 'bg-sage', aria: '此訊息已驗證為真實' },
    false: { label: '不實', accent: 'bg-brick', aria: '此訊息已驗證為不實' },
    caution: { label: '注意', accent: 'bg-ochre', aria: '此訊息需注意' },
    processing: { label: '分析中', accent: 'bg-slate-300', aria: 'AI 正在分析' },
    error: { label: '無法讀取', accent: 'bg-slate-400', aria: '無法完成查核' },
  }
  const { label, accent, aria } = config[status] || config.caution
  return (
    <div
      className="flex bg-white rounded-ds-md border border-slate-200 overflow-hidden shadow-ds-card"
      style={{ borderWidth: '0.5px' }}
      role="status"
      aria-live="polite"
      aria-label={aria}
    >
      <div className={`w-1 flex-shrink-0 ${accent}`} />
      <div className="flex-1 flex items-center justify-center gap-4 p-8">
        {status === 'processing' ? (
          <Loader2 className="w-8 h-8 text-klein animate-spin" strokeWidth={2} aria-hidden />
        ) : null}
        <span className="text-2xl font-bold text-navy-900">{label}</span>
      </div>
    </div>
  )
}

export default function FactCheckResult() {
  const { id } = useParams()
  const { details } = useVerifications()
  const detail = id ? details[id] : undefined

  const handleVoicePlayback = () => {
    if ('speechSynthesis' in window && detail && detail.status !== 'processing') {
      const utterance = new SpeechSynthesisUtterance(detail.simpleExplanation)
      utterance.lang = 'zh-TW'
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }

  if (!detail) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <p className="text-navy text-body">找不到查核結果。</p>
      </div>
    )
  }

  const showAiBadge = detail.verifiedByAi === true
  const showImage = Boolean(detail.imageUrl && detail.status !== 'processing' && detail.status !== 'error')
  const [imageBroken, setImageBroken] = useState(false)

  useEffect(() => {
    // When user navigates to a different verification, reset broken-image state.
    setImageBroken(false)
  }, [detail?.id, detail?.imageUrl])

  return (
    <div className="min-h-screen bg-surface pb-8 max-w-lg mx-auto">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur-xl border-b border-slate-200/60 px-5 py-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-muted hover:text-navy mb-4 touch-target transition-colors"
        >
          <ArrowLeft className="w-5 h-5" strokeWidth={2} />
          <span className="text-base font-medium">返回主頁</span>
        </Link>
        <h1 className="text-lg font-semibold text-navy tracking-tight">查核結果</h1>
      </header>

      <main className="px-4 py-6 space-y-6">
        {showAiBadge && (
          <div className="inline-flex items-center gap-2 rounded-ds-md border border-sage/40 bg-sage/10 px-3 py-2 text-[13px] font-semibold text-navy-900">
            <ShieldCheck className="w-4 h-4 text-sage shrink-0" strokeWidth={2.5} aria-hidden />
            <span>Verified by AI</span>
            <span className="text-muted font-normal">／ AI 查核</span>
          </div>
        )}

        <section>
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">
            原始內容
          </h2>
          {showImage && !imageBroken ? (
            <div className="space-y-3">
              <img
                src={detail.imageUrl!}
                alt="社群貼文附圖"
                className="w-full rounded-ds-md border border-slate-200 object-contain max-h-72 bg-slate-50"
                style={{ borderWidth: '0.5px' }}
                loading="lazy"
                onError={() => setImageBroken(true)}
              />
              <p
                className="text-body text-navy-900 bg-white p-6 rounded-ds-md border border-slate-200 leading-relaxed font-medium shadow-ds-card"
                style={{ borderWidth: '0.5px' }}
              >
                {detail.originalContent || detail.snippet}
              </p>
            </div>
          ) : (
            <p
              className="text-body text-navy-900 bg-white p-6 rounded-ds-md border border-slate-200 leading-relaxed font-medium shadow-ds-card"
              style={{ borderWidth: '0.5px' }}
            >
              {detail.originalContent || detail.snippet}
            </p>
          )}
        </section>

        {detail.sourceUrl ? (
          <section>
            <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">
              原文出處（Source）
            </h2>
            <a
              href={detail.sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-ds-md border border-slate-200 bg-white px-4 py-3 text-[14px] font-semibold text-klein shadow-ds-card hover:border-klein/30 transition-colors"
              style={{ borderWidth: '0.5px' }}
            >
              <ExternalLink className="w-4 h-4 shrink-0" strokeWidth={2.5} aria-hidden />
              {isThreadsPlatform(detail.platformSource || '') ? '在 Threads 開啟原文' : '查看原文出處'}
            </a>
          </section>
        ) : null}

        <StatusDisplay status={detail.status} />

        <section>
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-3 font-mono">
            詳細說明（繁體中文）
          </h2>
          <p className="text-body text-navy-900 leading-relaxed">{detail.simpleExplanation}</p>
          {detail.confidence != null && detail.status !== 'processing' && detail.status !== 'error' ? (
            <p className="text-[12px] text-muted mt-3 font-mono">
              信心度：{Math.round(detail.confidence * 100)}%
            </p>
          ) : null}

          {detail.status !== 'processing' && detail.status !== 'error' ? (
            <button
              type="button"
              onClick={handleVoicePlayback}
              className="mt-6 flex items-center justify-center gap-3 px-6 py-4 rounded-ds-md bg-klein text-white font-semibold shadow-ds-card touch-target w-full"
            >
              <Volume2 className="w-5 h-5" strokeWidth={2} aria-hidden />
              <span>朗讀結果</span>
            </button>
          ) : null}
        </section>

        <Link to="/" className="block text-center text-klein font-semibold text-base hover:underline">
          返回最近查核記錄
        </Link>
      </main>
    </div>
  )
}
