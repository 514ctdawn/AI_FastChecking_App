import { useParams, Link } from 'react-router-dom'
import { Volume2, ArrowLeft } from 'lucide-react'
import { useVerifications } from '../context/VerificationsContext'

const StatusDisplay = ({ status }) => {
  const config = {
    true: { label: '真實', accent: 'bg-sage', aria: '此訊息已驗證為真實' },
    false: { label: '不實', accent: 'bg-brick', aria: '此訊息已驗證為不實' },
    caution: { label: '注意', accent: 'bg-ochre', aria: '此訊息需注意' },
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
        <span className="text-2xl font-bold text-navy-900">{label}</span>
      </div>
    </div>
  )
}

export default function FactCheckResult() {
  const { id } = useParams()
  const { details } = useVerifications()
  const detail = details[id]

  const handleVoicePlayback = () => {
    if ('speechSynthesis' in window && detail) {
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
        {/* Claim being checked */}
        <section>
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">查核內容</h2>
          <p
            className="text-body text-navy-900 bg-white p-6 rounded-ds-md border border-slate-200 leading-relaxed font-medium shadow-ds-card"
            style={{ borderWidth: '0.5px' }}
          >
            {detail.snippet}
          </p>
        </section>

        {/* Large status indicator */}
        <StatusDisplay status={detail.status} />

        {/* Simple Explanation */}
        <section>
          <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-3 font-mono">簡要說明</h2>
          <p className="text-body text-navy-900 leading-relaxed">
            {detail.simpleExplanation}
          </p>

          {/* Voice Playback */}
          <button
            onClick={handleVoicePlayback}
            className="mt-6 flex items-center justify-center gap-3 px-6 py-4 rounded-ds-md bg-klein text-white font-semibold shadow-ds-card touch-target w-full"
          >
            <Volume2 className="w-5 h-5" strokeWidth={2} aria-hidden />
            <span>朗讀結果</span>
          </button>
        </section>

        <Link
          to="/"
          className="block text-center text-klein font-semibold text-base hover:underline"
        >
          返回最近查核記錄
        </Link>
      </main>
    </div>
  )
}
