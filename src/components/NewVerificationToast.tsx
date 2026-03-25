import { useEffect } from 'react'
import { Sparkles } from 'lucide-react'

export default function NewVerificationToast({
  visible,
  onDismiss,
}: {
  visible: boolean
  onDismiss: () => void
}) {
  useEffect(() => {
    if (!visible) return
    const t = window.setTimeout(() => onDismiss(), 4500)
    return () => window.clearTimeout(t)
  }, [visible, onDismiss])

  if (!visible) return null

  return (
    <div
      className="fixed top-20 left-4 right-4 max-w-lg mx-auto z-[60] pointer-events-none flex justify-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-ds-md border border-klein/20 bg-white/95 backdrop-blur-md shadow-ds-card text-navy-900"
        style={{ borderWidth: '0.5px' }}
      >
        <Sparkles className="w-5 h-5 text-klein shrink-0" strokeWidth={2} aria-hidden />
        <p className="text-[14px] font-semibold">發現新查核結果！</p>
        <button
          type="button"
          onClick={onDismiss}
          className="text-[12px] font-semibold text-klein underline"
        >
          關閉
        </button>
      </div>
    </div>
  )
}
