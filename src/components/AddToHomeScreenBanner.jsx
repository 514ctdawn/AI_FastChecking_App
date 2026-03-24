import { useState, useEffect } from 'react'
import { X, Share, MoreVertical, Smartphone } from 'lucide-react'

const STORAGE_KEY = 'verisenior-pwa-banner-dismissed'

export default function AddToHomeScreenBanner() {
  const [show, setShow] = useState(false)
  const [isStandalone, setIsStandalone] = useState(false)

  useEffect(() => {
    const dismissed = localStorage.getItem(STORAGE_KEY)
    const standalone = window.matchMedia('(display-mode: standalone)').matches
      || window.navigator.standalone === true
      || document.referrer.includes('android-app://')
    setIsStandalone(standalone)
    if (!dismissed && !standalone) {
      setShow(true)
    }
  }, [])

  const dismiss = () => {
    localStorage.setItem(STORAGE_KEY, 'true')
    setShow(false)
  }

  if (!show || isStandalone) return null

  return (
    <div
      className="fixed bottom-36 left-4 right-4 max-w-lg mx-auto z-30"
      role="status"
      aria-live="polite"
    >
      <div
        className="bg-white/95 backdrop-blur-xl rounded-ds-md border border-slate-200 shadow-ds-card p-4 flex gap-4 items-start"
        style={{ borderWidth: '0.5px' }}
      >
        <div className="w-10 h-10 rounded-ds-md bg-navy-900 flex items-center justify-center flex-shrink-0">
          <Smartphone className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-navy-900 mb-2">
            將 VeriSenior 加到主畫面，使用更方便！
          </p>
          <ul className="text-xs text-muted space-y-1.5">
            <li className="flex items-start gap-2">
              <span className="text-klein font-semibold flex-shrink-0">iOS：</span>
              <span>
                點擊瀏覽器底部的 <Share className="w-3.5 h-3.5 inline align-text-bottom text-klein" strokeWidth={2} /> 分享圖示，然後選擇「加入主畫面」。
              </span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-klein font-semibold flex-shrink-0">Android：</span>
              <span>
                點擊瀏覽器右上角的 <MoreVertical className="w-3.5 h-3.5 inline align-text-bottom text-klein" strokeWidth={2} /> 三個點，然後選擇「安裝應用程式」或「加到主畫面」。
              </span>
            </li>
          </ul>
        </div>
        <button
          onClick={dismiss}
          className="p-1.5 rounded-ds-sm hover:bg-slate-100 touch-target flex-shrink-0"
          aria-label="關閉提示"
        >
          <X className="w-5 h-5 text-muted" strokeWidth={2} />
        </button>
      </div>
    </div>
  )
}
