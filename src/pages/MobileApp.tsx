import { useState, useRef, useCallback, type KeyboardEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ChevronRight,
  Home,
  Library,
  BookOpen,
  X,
  Camera,
  Mic,
  Loader2,
  RefreshCw,
} from 'lucide-react'
import { knowledgeLibrary } from '../data/mockData'
import { useVerifications } from '../context/VerificationsContext'
import { mockVerifyContent, generateId } from '../utils/mockVerification'
import Sparkline from '../components/Sparkline'
import TrustIndicator from '../components/TrustIndicator'
import SyncStatus from '../components/SyncStatus'
import SocialIntegrationHub from '../components/SocialIntegrationHub'
import type { VerificationListItem } from '../types/verification'
import {
  formatPlatformDisplayLabel,
  isThreadsPlatform,
  processingLabelForPlatform,
} from '../utils/mapApiVerification'
import { extractThreadsID } from '../utils/extractThreadsID'
import { startThreadsVerificationFromUrl } from '../api/verifyThreadsFromUrl'

const formatMeta = (platform: string, date: string) => {
  const platformLabel = formatPlatformDisplayLabel(platform)
  const timeMap: Record<string, string> = {
    '2 小時前': '2H AGO',
    '5 小時前': '5H AGO',
    昨天: '1D AGO',
    剛剛: 'JUST NOW',
  }
  const time = timeMap[date] || date.toUpperCase()
  return `${platformLabel} · ${time}`
}

const statusAccentColor: Record<VerificationListItem['status'], string> = {
  true: 'bg-sage',
  false: 'bg-brick',
  caution: 'bg-ochre',
  processing: 'bg-slate-300',
  error: 'bg-slate-400',
}

const statusShadowClass: Record<VerificationListItem['status'], string> = {
  true: 'hover:shadow-ds-card-focus-sage focus-within:shadow-ds-card-focus-sage',
  false: 'hover:shadow-ds-card-focus-brick focus-within:shadow-ds-card-focus-brick',
  caution: 'hover:shadow-ds-card-focus-ochre focus-within:shadow-ds-card-focus-ochre',
  processing: 'hover:shadow-ds-card-focus-ochre focus-within:shadow-ds-card-focus-ochre',
  error: 'hover:border-brick/40 focus-within:border-brick/40',
}

function VerificationCard({ item }: { item: VerificationListItem }) {
  const navigate = useNavigate()
  const accent = statusAccentColor[item.status] || statusAccentColor.caution
  const shadowClass = statusShadowClass[item.status] || statusShadowClass.caution
  const meta = formatMeta(item.platform, item.date)

  const goDetail = () => navigate(`/result/${item.id}`)

  const cardKeyNav = (e: KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      goDetail()
    }
  }

  if (item.status === 'processing') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={goDetail}
        onKeyDown={cardKeyNav}
        className={`group flex bg-white rounded-ds-md border border-slate-200 overflow-hidden transition-all duration-200 active:scale-[0.995] shadow-ds-card hover:border-navy-900/30 cursor-pointer ${shadowClass}`}
        style={{ borderWidth: '0.5px' }}
      >
        <div className={`w-1 flex-shrink-0 ${accent}`} />
        <div className="flex-1 min-w-0 p-5 flex flex-col gap-3">
          <div className="space-y-2 animate-pulse" aria-busy>
            <div className="h-4 bg-slate-200 rounded w-3/4" />
            <div className="h-4 bg-slate-100 rounded w-full" />
            <div className="h-4 bg-slate-100 rounded w-5/6" />
          </div>
          <p className="text-[13px] font-semibold text-klein">{processingLabelForPlatform(item.platform)}</p>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">{meta}</p>
        </div>
        <div className="flex items-center pr-3 pl-2 min-w-[44px] min-h-[44px] justify-center self-stretch">
          <ChevronRight className="w-6 h-6 text-muted" strokeWidth={2.5} aria-hidden />
        </div>
      </div>
    )
  }

  if (item.status === 'error') {
    return (
      <div
        role="button"
        tabIndex={0}
        onClick={goDetail}
        onKeyDown={cardKeyNav}
        className="group flex bg-white rounded-ds-md border border-red-200 overflow-hidden transition-all duration-200 active:scale-[0.995] shadow-ds-card hover:border-red-300/80 cursor-pointer"
        style={{ borderWidth: '0.5px' }}
      >
        <div className={`w-1 flex-shrink-0 ${accent}`} />
        <div className="flex-1 min-w-0 p-5 flex flex-col gap-2">
          <p className="text-[12px] font-semibold text-brick uppercase tracking-wider font-mono">無法讀取</p>
          <h3 className="text-[17px] font-bold text-navy-900 leading-snug">
            {item.errorMessage || item.snippet}
          </h3>
          <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">{meta}</p>
        </div>
        <div className="flex items-center pr-3 pl-2 min-w-[44px] min-h-[44px] justify-center self-stretch">
          <ChevronRight className="w-6 h-6 text-muted group-hover:text-navy-900" strokeWidth={2.5} aria-hidden />
        </div>
      </div>
    )
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={goDetail}
      onKeyDown={cardKeyNav}
      className={`group flex bg-white rounded-ds-md border border-slate-200 overflow-hidden transition-all duration-200 active:scale-[0.995] shadow-ds-card hover:border-navy-900/30 focus:border-navy-900/30 cursor-pointer ${shadowClass}`}
      style={{ borderWidth: '0.5px' }}
    >
      <div className={`w-1 flex-shrink-0 ${accent}`} />
      <div className="flex-1 min-w-0 p-5 flex flex-col gap-3">
        <h3 className="text-[20px] font-bold text-navy-900 leading-snug line-clamp-2">{item.snippet}</h3>
        <p className="text-[11px] font-semibold text-navy-800">
          來源：{formatPlatformDisplayLabel(item.platform)}
        </p>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">{meta}</p>
        {item.sourceUrl ? (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation()
              window.open(item.sourceUrl!, '_blank', 'noopener,noreferrer')
            }}
            className="text-left text-[12px] font-semibold text-klein underline decoration-klein/40 w-fit"
            aria-label="View Original Post · 查看原文貼文"
          >
            {isThreadsPlatform(item.platform) ? '查看原文貼文（Threads）' : '查看原文貼文'}
          </button>
        ) : null}
      </div>
      <div className="flex items-center pr-3 pl-2 min-w-[44px] min-h-[44px] justify-center self-stretch">
        <ChevronRight
          className="w-6 h-6 text-muted group-hover:text-navy-900 transition-colors"
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
    </div>
  )
}

const KnowledgeCard = ({
  item,
}: {
  item: { id: string; category: string; title: string; count: number }
}) => (
  <div
    className="p-5 bg-white rounded-ds-md border border-slate-200 shadow-ds-card"
    style={{ borderWidth: '0.5px' }}
  >
    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">{item.category}</p>
    <p className="text-[18px] font-bold text-navy-900 mt-1">{item.title}</p>
    <p className="text-[13px] text-muted mt-1 font-mono">{item.count} 則已查核</p>
  </div>
)

const summaryChips = [
  { label: '總查核數', value: '42', sparkline: [5, 8, 6, 10, 12, 9, 14] as number[] },
  { label: '今日安全', value: '12', sparkline: null as number[] | null },
  { label: '已阻擋詐騙', value: '5', sparkline: null as number[] | null },
]

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [showCheckModal, setShowCheckModal] = useState(false)
  const [inputMode, setInputMode] = useState<'photo' | 'voice' | 'threads' | null>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [threadsUrlInput, setThreadsUrlInput] = useState('')
  const [pullOffset, setPullOffset] = useState(0)
  const chipsRef = useRef<HTMLDivElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const mainRef = useRef<HTMLElement>(null)
  const touchStartY = useRef(0)

  const {
    verifications,
    addVerification,
    refreshVerifications,
    isLoading,
    backendStatus,
    usesMockData,
  } = useVerifications()
  const navigate = useNavigate()
  const SparklineAny = Sparkline as any

  const processVoiceInput = (transcript: string) => {
    const { status, simpleExplanation } = mockVerifyContent(transcript)
    const id = generateId()
    const snippet = transcript.length > 60 ? `${transcript.slice(0, 60)}…` : transcript
    addVerification(
      { id, snippet, platform: '語音輸入', date: '剛剛', status: status as VerificationListItem['status'] },
      {
        id,
        snippet,
        status: status as VerificationListItem['status'],
        simpleExplanation,
        verifiedByAi: false,
      }
    )
    setShowCheckModal(false)
    setIsProcessing(false)
    setInputMode(null)
    setActiveTab('home')
    navigate(`/result/${id}`)
  }

  const handleVoiceClick = () => {
    const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognitionCtor) {
      alert('您的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge。')
      return
    }
    setInputMode('voice')
    setIsProcessing(true)
    const recognition = new SpeechRecognitionCtor()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'zh-TW'
    recognition.onresult = (e: SpeechRecognitionEvent) => {
      const transcript = e.results[0]?.[0]?.transcript || ''
      processVoiceInput(transcript)
    }
    recognition.onerror = () => {
      setIsProcessing(false)
      setInputMode(null)
    }
    recognition.onend = () => {}
    recognitionRef.current = recognition
    recognition.start()
  }

  const closeModal = () => {
    if (inputMode === 'voice') recognitionRef.current?.abort()
    setShowCheckModal(false)
    setInputMode(null)
    setIsProcessing(false)
    setThreadsUrlInput('')
  }

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setInputMode('photo')
    setIsProcessing(true)
    e.target.value = ''
    window.setTimeout(() => {
      const id = generateId()
      const snippet = '已分析圖片內容（圖片文字辨識）'
      const { status, simpleExplanation } = mockVerifyContent('圖片查核')
      addVerification(
        { id, snippet, platform: '相機', date: '剛剛', status: status as VerificationListItem['status'] },
        {
          id,
          snippet,
          status: status as VerificationListItem['status'],
          simpleExplanation,
          verifiedByAi: false,
        }
      )
      setShowCheckModal(false)
      setIsProcessing(false)
      setInputMode(null)
      setActiveTab('home')
      navigate(`/result/${id}`)
    }, 1500)
  }

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    if (activeTab !== 'home') return
    touchStartY.current = e.touches[0].clientY
  }, [activeTab])

  const onTouchMove = useCallback(
    (e: React.TouchEvent) => {
      if (activeTab !== 'home') return
      const el = mainRef.current
      if (!el || el.scrollTop > 0) return
      const delta = e.touches[0].clientY - touchStartY.current
      if (delta > 0) setPullOffset(Math.min(delta, 96))
    },
    [activeTab]
  )

  const onTouchEnd = useCallback(() => {
    if (pullOffset > 56) void refreshVerifications()
    setPullOffset(0)
  }, [pullOffset, refreshVerifications])

  const startThreadsVerification = async (url: string): Promise<void> => {
    const trimmed = url.trim()
    const postId = extractThreadsID(trimmed)
    if (!postId) {
      alert('Threads 連結格式不正確，請貼上類似：https://www.threads.net/@user/post/貼文ID')
      return
    }

    try {
      setInputMode('threads')
      setIsProcessing(true)
      setShowCheckModal(false)

      const { id } = await startThreadsVerificationFromUrl(trimmed)
      // Ensure dashboard + details map is ready before navigating.
      await refreshVerifications()

      setIsProcessing(false)
      setInputMode(null)
      setThreadsUrlInput('')
      navigate(`/result/${id}`)
    } catch (e) {
      setIsProcessing(false)
      setInputMode(null)
      setShowCheckModal(true)
      const msg = e instanceof Error ? e.message : String(e)
      alert(msg)
    }
  }

  return (
    <div className="min-h-screen bg-surface pb-24 max-w-lg mx-auto font-sans">
      <header
        className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-5 py-4"
        style={{ borderBottomWidth: '0.5px' }}
      >
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-ds-md bg-navy-900 flex items-center justify-center shrink-0" aria-hidden>
              <span className="text-white text-sm font-bold">VS</span>
            </div>
            <div className="min-w-0">
              <h1 className="text-lg font-bold text-navy-900 tracking-tight">VeriSenior</h1>
              <p className="text-[12px] text-muted uppercase tracking-wider font-mono">驗證儀表板</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <SyncStatus backendStatus={backendStatus} />
            <button
              type="button"
              onClick={() => void refreshVerifications()}
              className="p-2.5 rounded-ds-md border border-slate-200/80 text-navy-900 hover:bg-slate-50 touch-target"
              style={{ borderWidth: '0.5px' }}
              aria-label="重新整理查核列表"
            >
              <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin text-klein' : ''}`} strokeWidth={2} />
            </button>
            <TrustIndicator />
          </div>
        </div>
      </header>

      <main
        ref={mainRef}
        className="px-4 py-5 overflow-y-auto overscroll-y-contain min-h-[50vh]"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        {activeTab === 'home' && pullOffset > 8 && (
          <div
            className="flex justify-center text-[12px] text-klein font-semibold mb-2"
            style={{ height: pullOffset * 0.35 }}
          >
            鬆手即可重新整理
          </div>
        )}

        {activeTab === 'home' && (
          <div
            className="mb-4 rounded-ds-md border border-klein/15 bg-[#002FA7]/[0.06] px-4 py-3 text-[13px] text-navy-900 leading-relaxed"
            style={{ borderWidth: '0.5px' }}
            role="status"
          >
            在社群媒體標記 @VeriSenior，結果將自動同步至此。
          </div>
        )}

        {activeTab === 'home' && (
          <>
            <section className="mb-6">
              <div
                ref={chipsRef}
                className="flex gap-3 overflow-x-auto pb-2 -mx-1 scrollbar-hide"
                style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
              >
                {summaryChips.map((chip) => (
                  <div
                    key={chip.label}
                    className="flex-shrink-0 px-4 py-3 rounded-ds-md bg-white border border-slate-200 min-w-[110px] shadow-ds-card flex flex-col"
                    style={{ borderWidth: '0.5px' }}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-[10px] font-semibold text-muted uppercase tracking-wider font-mono">
                        {chip.label}
                      </p>
                      {chip.sparkline && (
                        <SparklineAny data={chip.sparkline} className="flex-shrink-0 opacity-70" />
                      )}
                    </div>
                    <p className="text-xl font-bold text-navy-900 mt-1">{chip.value}</p>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-4 font-mono">
                最近查核記錄
              </h2>
              {backendStatus === 'error' && !usesMockData ? (
                <p className="text-[13px] text-muted mb-4 leading-relaxed">
                  無法連線至查核伺服器。請將後端部署至 Render／Vercel 等，並在環境變數設定 VITE_API_BASE
                  指向該 API；GitHub Pages 無法接收 Threads Webhook。
                </p>
              ) : null}
              {backendStatus === 'ok' && verifications.length === 0 ? (
                <p className="text-body text-muted mb-4 leading-relaxed">
                  尚無查核紀錄。在 Threads 留言 @VeriSenior 幫我查證 後，結果會透過後端同步至此。
                </p>
              ) : null}
              <div className="grid grid-cols-1 gap-4 auto-rows-fr">
                {verifications.map((item) => (
                  <VerificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'library' && (
          <section>
            <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">查核庫</h2>
            <p className="text-body text-muted mb-6">瀏覽您已查核的主題，或依分類探索已驗證的資訊。</p>
            <div className="space-y-4">
              {knowledgeLibrary.map((item) => (
                <KnowledgeCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'tutorial' && <SocialIntegrationHub />}
      </main>

      <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-20">
        <div className="flex items-center gap-2 w-full">
          <button
            type="button"
            onClick={() => {
              setShowCheckModal(true)
              window.setTimeout(() => fileInputRef.current?.click(), 50)
            }}
            className="flex items-center justify-center w-12 h-12 rounded-ds-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-ds-card hover:border-navy-900/20 transition-colors touch-target"
            style={{ borderWidth: '0.5px' }}
            aria-label="掃描畫面"
          >
            <Camera className="w-5 h-5 text-klein" strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={() => {
              // Clipboard-driven "post-to-app": if the user already copied a Threads link,
              // we can start verification immediately.
              void (async () => {
                try {
                  const text = await navigator.clipboard?.readText?.()
                  const maybe = text?.trim()
                  if (maybe && extractThreadsID(maybe)) {
                    const ok = window.confirm('檢測到已複製的 Threads 連結，是否開始查核？')
                    if (ok) {
                      await startThreadsVerification(maybe)
                      return
                    }
                  }
                } catch {
                  // Ignore clipboard permission issues; fall back to modal.
                }
                setShowCheckModal(true)
              })()
            }}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-ds-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-ds-card hover:shadow-[0_4px_20px_rgba(0,47,167,0.12)] hover:border-klein/30 transition-all touch-target"
            style={{ borderWidth: '0.5px' }}
            aria-label="啟動 AI 查核"
          >
            <span className="text-base font-bold text-klein">啟動 AI 查核</span>
          </button>
          <button
            type="button"
            onClick={() => {
              setShowCheckModal(true)
              window.setTimeout(handleVoiceClick, 50)
            }}
            className="flex items-center justify-center w-12 h-12 rounded-ds-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-ds-card hover:border-navy-900/20 transition-colors touch-target"
            style={{ borderWidth: '0.5px' }}
            aria-label="語音輸入"
          >
            <Mic className="w-5 h-5 text-klein" strokeWidth={2} />
          </button>
        </div>
      </div>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {showCheckModal && (
        <div className="fixed inset-0 z-30 flex items-end sm:items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div
            className="bg-white rounded-ds-lg w-full max-w-md p-6 border border-slate-200 shadow-ds-card"
            style={{ borderWidth: '0.5px' }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="check-modal-title"
          >
            <div className="flex justify-between items-center mb-6">
              <h2 id="check-modal-title" className="text-lg font-bold text-navy-900">
                啟動 AI 查核
              </h2>
              <button
                type="button"
                onClick={closeModal}
                className="p-2 rounded-ds-sm hover:bg-slate-100 touch-target disabled:opacity-50"
                aria-label="關閉"
              >
                <X className="w-5 h-5 text-muted" strokeWidth={2} />
              </button>
            </div>
            <p className="text-body text-muted mb-6 leading-relaxed">
              在貼文下方留言 <strong className="text-navy-900">@VeriSenior 幫我查證</strong>
              ，查核結果會同步到首頁。您也可以拍攝貼文畫面由我們分析。
            </p>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="w-10 h-10 text-klein animate-spin" strokeWidth={2} />
                <p className="text-navy-900 font-medium">
                  {inputMode === 'voice'
                    ? '聆聽中... 請開始說話'
                    : inputMode === 'threads'
                      ? '正在從 Threads 擷取內容...'
                      : '正在分析圖片...'}
                </p>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-[12px] font-semibold text-muted mb-2 font-mono">Threads 連結（可貼上）</p>
                  <div className="flex gap-2">
                    <input
                      value={threadsUrlInput}
                      onChange={(e) => setThreadsUrlInput(e.target.value)}
                      placeholder="https://www.threads.net/@user/post/貼文ID"
                      className="flex-1 px-4 py-3 rounded-ds-md border border-slate-200 bg-white text-navy-900 text-[13px] shadow-ds-card"
                      style={{ borderWidth: '0.5px' }}
                      inputMode="url"
                    />
                    <button
                      type="button"
                      onClick={() => void startThreadsVerification(threadsUrlInput)}
                      className="px-4 py-3 rounded-ds-md bg-klein text-white font-semibold shadow-ds-card touch-target whitespace-nowrap"
                      style={{ borderWidth: '0.5px' }}
                    >
                      開始查核
                    </button>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-ds-md border border-slate-200 text-navy-900 font-semibold hover:bg-slate-50 shadow-ds-card"
                  >
                    <Camera className="w-5 h-5" strokeWidth={2} />
                    拍攝照片
                  </button>
                  <button
                    type="button"
                    onClick={handleVoiceClick}
                    className="flex-1 flex items-center justify-center gap-2 py-4 rounded-ds-md bg-klein text-white font-semibold shadow-ds-card"
                  >
                    <Mic className="w-5 h-5" strokeWidth={2} />
                    語音輸入
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      <nav
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/90 backdrop-blur-xl border-t border-slate-200"
        style={{ borderTopWidth: '0.5px' }}
        aria-label="主導航列"
      >
        <div className="flex justify-around py-2.5 px-2">
          {[
            { id: 'home', label: '主頁', Icon: Home },
            { id: 'library', label: '查核庫', Icon: Library },
            { id: 'tutorial', label: '社群整合', Icon: BookOpen },
          ].map(({ id, label, Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 px-6 py-2.5 rounded-ds-md touch-target justify-center transition-all ${
                activeTab === id ? 'text-klein bg-[#002FA7]/5' : 'text-muted hover:text-navy-900'
              }`}
            >
              <Icon className="w-6 h-6" strokeWidth={activeTab === id ? 2.5 : 2} />
              <span className="text-[13px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
