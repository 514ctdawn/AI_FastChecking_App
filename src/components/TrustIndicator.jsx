/**
 * Active Performance Indicator - radial progress with status
 */
export default function TrustIndicator() {
  const status = '良好'
  const progress = 0.82
  const circumference = 2 * Math.PI * 18
  const strokeDashoffset = circumference * (1 - progress)

  const formatTime = () => {
    const now = new Date()
    return now.toLocaleTimeString('zh-TW', { hour: '2-digit', minute: '2-digit' })
  }

  return (
    <div className="flex items-center gap-3 px-3 py-2 rounded-ds-md bg-slate-50 border border-slate-200/80">
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="w-10 h-10 -rotate-90" viewBox="0 0 40 40">
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            className="text-slate-200"
          />
          <circle
            cx="20"
            cy="20"
            r="18"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="text-sage transition-all duration-500"
          />
        </svg>
      </div>
      <div>
        <p className="text-[10px] font-bold text-muted uppercase tracking-wider font-mono">
          信任指數
        </p>
        <p className="text-sm font-bold text-navy-900">{status}</p>
        <p className="text-[10px] text-muted font-mono mt-0.5">
          更新於 {formatTime()}
        </p>
      </div>
    </div>
  )
}
