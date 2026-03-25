type BackendStatus = 'idle' | 'loading' | 'ok' | 'error'

/**
 * Green = API reachable; red = offline; amber = syncing.
 */
export default function SyncStatus({ backendStatus }: { backendStatus: BackendStatus }) {
  const mode =
    backendStatus === 'ok' ? 'ok' : backendStatus === 'error' ? 'error' : 'loading'
  const dot =
    mode === 'ok'
      ? 'bg-emerald-500 shadow-[0_0_0_2px_rgba(16,185,129,0.25)]'
      : mode === 'error'
        ? 'bg-red-500 shadow-[0_0_0_2px_rgba(239,68,68,0.2)]'
        : 'bg-amber-400 animate-pulse'
  const label =
    mode === 'ok' ? '已連線' : mode === 'error' ? '離線' : '同步中…'

  return (
    <div
      className="flex items-center gap-2 px-2 py-1.5 rounded-ds-sm border border-slate-200/80 bg-white/90"
      style={{ borderWidth: '0.5px' }}
      title={
        mode === 'ok'
          ? '已連線至查核後端'
          : mode === 'error'
            ? '無法連線至後端，請檢查 VITE_API_BASE 與部署'
            : '正在同步…'
      }
    >
      <span className={`w-2 h-2 rounded-full shrink-0 ${dot}`} aria-hidden />
      <span className="text-[10px] font-semibold text-muted uppercase tracking-wider font-mono">
        {label}
      </span>
    </div>
  )
}
