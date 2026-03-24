import { useState, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Home, Library, BookOpen, X, Camera, Mic, Loader2 } from 'lucide-react'
import { knowledgeLibrary } from '../data/mockData'
import { useVerifications } from '../context/VerificationsContext'
import { mockVerifyContent, generateId } from '../utils/mockVerification'
import Sparkline from '../components/Sparkline'
import TrustIndicator from '../components/TrustIndicator'
import SocialIntegrationHub from '../components/SocialIntegrationHub'

const formatMeta = (platform, date) => {
  const platformKey = platform.toUpperCase().replace(/\s/g, '')
  const timeMap = { '2 小時前': '2H AGO', '5 小時前': '5H AGO', '昨天': '1D AGO', '剛剛': 'JUST NOW' }
  const time = timeMap[date] || date.toUpperCase()
  return `${platformKey} · ${time}`
}

const statusAccentColor = {
  true: 'bg-sage',
  false: 'bg-brick',
  caution: 'bg-ochre',
}

const statusShadowClass = {
  true: 'hover:shadow-ds-card-focus-sage focus-within:shadow-ds-card-focus-sage',
  false: 'hover:shadow-ds-card-focus-brick focus-within:shadow-ds-card-focus-brick',
  caution: 'hover:shadow-ds-card-focus-ochre focus-within:shadow-ds-card-focus-ochre',
}

const VerificationCard = ({ item }) => {
  const accent = statusAccentColor[item.status] || statusAccentColor.caution
  const shadowClass = statusShadowClass[item.status] || statusShadowClass.caution
  const meta = formatMeta(item.platform, item.date)

  return (
    <Link
      to={`/result/${item.id}`}
      className={`group flex bg-white rounded-ds-md border border-slate-200 overflow-hidden transition-all duration-200 active:scale-[0.995] shadow-ds-card hover:border-navy-900/30 focus:border-navy-900/30 ${shadowClass}`}
      style={{ borderWidth: '0.5px' }}
    >
      <div className={`w-1 flex-shrink-0 ${accent}`} />
      <div className="flex-1 min-w-0 p-5 flex flex-col gap-3">
        <h3 className="text-[20px] font-bold text-navy-900 leading-snug line-clamp-2">
          {item.snippet}
        </h3>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">
          {meta}
        </p>
      </div>
      <div className="flex items-center pr-3 pl-2 min-w-[44px] min-h-[44px] justify-center self-stretch">
        <ChevronRight
          className="w-6 h-6 text-muted group-hover:text-navy-900 transition-colors"
          strokeWidth={2.5}
          aria-hidden
        />
      </div>
    </Link>
  )
}

const KnowledgeCard = ({ item }) => (
  <div className="p-5 bg-white rounded-ds-md border border-slate-200 shadow-ds-card" style={{ borderWidth: '0.5px' }}>
    <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">{item.category}</p>
    <p className="text-[18px] font-bold text-navy-900 mt-1">{item.title}</p>
    <p className="text-[13px] text-muted mt-1 font-mono">{item.count} 則已查核</p>
  </div>
)

const summaryChips = [
  { label: '總查核數', value: '42', sparkline: [5, 8, 6, 10, 12, 9, 14] },
  { label: '今日安全', value: '12', sparkline: null },
  { label: '已阻擋詐騙', value: '5', sparkline: null },
]

export default function MobileApp() {
  const [activeTab, setActiveTab] = useState('home')
  const [showCheckModal, setShowCheckModal] = useState(false)
  const [inputMode, setInputMode] = useState(null) // 'photo' | 'voice'
  const [isProcessing, setIsProcessing] = useState(false)
  const chipsRef = useRef(null)
  const fileInputRef = useRef(null)
  const recognitionRef = useRef(null)
  const { verifications, addVerification } = useVerifications()
  const navigate = useNavigate()

  const processVoiceInput = (transcript) => {
    const { status, simpleExplanation } = mockVerifyContent(transcript)
    const id = generateId()
    const snippet = transcript.length > 60 ? transcript.slice(0, 60) + '…' : transcript
    addVerification(
      { id, snippet, platform: '語音輸入', date: '剛剛', status },
      { id, snippet, status, simpleExplanation }
    )
    setShowCheckModal(false)
    setIsProcessing(false)
    setInputMode(null)
    setActiveTab('home')
    navigate(`/result/${id}`)
  }

  const handleVoiceClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert('您的瀏覽器不支援語音辨識，請使用 Chrome 或 Edge。')
      return
    }
    setInputMode('voice')
    setIsProcessing(true)
    const recognition = new SpeechRecognition()
    recognition.continuous = false
    recognition.interimResults = false
    recognition.lang = 'zh-TW'
    recognition.onresult = (e) => {
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
  }

  const handlePhotoChange = (e) => {
    const file = e.target?.files?.[0]
    if (!file || !file.type.startsWith('image/')) return
    setInputMode('photo')
    setIsProcessing(true)
    e.target.value = ''
    setTimeout(() => {
      const id = generateId()
      const snippet = '已分析圖片內容（圖片文字辨識）'
      const { status, simpleExplanation } = mockVerifyContent('圖片查核')
      addVerification(
        { id, snippet, platform: '相機', date: '剛剛', status },
        { id, snippet, status, simpleExplanation }
      )
      setShowCheckModal(false)
      setIsProcessing(false)
      setInputMode(null)
      setActiveTab('home')
      navigate(`/result/${id}`)
    }, 1500)
  }

  return (
    <div className="min-h-screen bg-surface pb-24 max-w-lg mx-auto font-sans">
      {/* Dashboard Header */}
      <header
        className="sticky top-0 z-10 bg-white/95 backdrop-blur-xl border-b border-slate-200 px-5 py-4"
        style={{ borderBottomWidth: '0.5px' }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-ds-md bg-navy-900 flex items-center justify-center"
              aria-hidden
            >
              <span className="text-white text-sm font-bold">VS</span>
            </div>
            <div>
              <h1 className="text-lg font-bold text-navy-900 tracking-tight">VeriSenior</h1>
              <p className="text-[12px] text-muted uppercase tracking-wider font-mono">驗證儀表板</p>
            </div>
          </div>
          <TrustIndicator />
        </div>
      </header>

      <main className="px-4 py-5">
        {activeTab === 'home' && (
          <>
            {/* Safety Summary Chips */}
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
                        <Sparkline data={chip.sparkline} className="flex-shrink-0 opacity-70" />
                      )}
                    </div>
                    <p className="text-xl font-bold text-navy-900 mt-1">
                      {chip.value}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Case Reports */}
            <section>
              <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-4 font-mono">
                最近查核記錄
              </h2>
              <div className="space-y-4">
                {verifications.map((item) => (
                  <VerificationCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          </>
        )}

        {activeTab === 'library' && (
          <section>
            <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">
              查核庫
            </h2>
            <p className="text-body text-muted mb-6">
              瀏覽您已查核的主題，或依分類探索已驗證的資訊。
            </p>
            <div className="space-y-4">
              {knowledgeLibrary.map((item) => (
                <KnowledgeCard key={item.id} item={item} />
              ))}
            </div>
          </section>
        )}

        {activeTab === 'tutorial' && <SocialIntegrationHub />}
      </main>

      {/* CTA - Multi-step with quick-access camera & mic */}
      <div className="fixed bottom-24 left-4 right-4 max-w-lg mx-auto z-20">
        <div className="flex items-center gap-2 w-full">
          <button
            onClick={() => {
              setShowCheckModal(true)
              setTimeout(() => fileInputRef.current?.click(), 50)
            }}
            className="flex items-center justify-center w-12 h-12 rounded-ds-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-ds-card hover:border-navy-900/20 transition-colors touch-target"
            style={{ borderWidth: '0.5px' }}
            aria-label="掃描畫面"
          >
            <Camera className="w-5 h-5 text-klein" strokeWidth={2} />
          </button>
          <button
            onClick={() => setShowCheckModal(true)}
            className="flex-1 flex items-center justify-center gap-2 py-4 rounded-ds-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-ds-card hover:shadow-[0_4px_20px_rgba(0,47,167,0.12)] hover:border-klein/30 transition-all touch-target"
            style={{ borderWidth: '0.5px' }}
            aria-label="啟動 AI 查核"
          >
            <span className="text-base font-bold text-klein">啟動 AI 查核</span>
          </button>
          <button
            onClick={() => {
              setShowCheckModal(true)
              setTimeout(handleVoiceClick, 50)
            }}
            className="flex items-center justify-center w-12 h-12 rounded-ds-md bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-ds-card hover:border-navy-900/20 transition-colors touch-target"
            style={{ borderWidth: '0.5px' }}
            aria-label="語音輸入"
          >
            <Mic className="w-5 h-5 text-klein" strokeWidth={2} />
          </button>
        </div>
      </div>

      {/* Hidden file input for photo */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handlePhotoChange}
      />

      {/* Modal */}
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
                onClick={closeModal}
                className="p-2 rounded-ds-sm hover:bg-slate-100 touch-target disabled:opacity-50"
                aria-label="關閉"
              >
                <X className="w-5 h-5 text-muted" strokeWidth={2} />
              </button>
            </div>
            <p className="text-body text-muted mb-6 leading-relaxed">
              在社群媒體上輸入 <strong className="text-navy-900">@VeriSenior</strong>{' '}
              即可即時查核。或拍攝貼文照片，我們將為您分析。
            </p>

            {isProcessing ? (
              <div className="flex flex-col items-center justify-center py-8 gap-4">
                <Loader2 className="w-10 h-10 text-klein animate-spin" strokeWidth={2} />
                <p className="text-navy-900 font-medium">
                  {inputMode === 'voice' ? '聆聽中... 請開始說話' : '正在分析圖片...'}
                </p>
              </div>
            ) : (
              <div className="flex gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-ds-md border border-slate-200 text-navy-900 font-semibold hover:bg-slate-50 shadow-ds-card"
                >
                  <Camera className="w-5 h-5" strokeWidth={2} />
                  拍攝照片
                </button>
                <button
                  onClick={handleVoiceClick}
                  className="flex-1 flex items-center justify-center gap-2 py-4 rounded-ds-md bg-klein text-white font-semibold shadow-ds-card"
                >
                  <Mic className="w-5 h-5" strokeWidth={2} />
                  語音輸入
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Bottom Navigation */}
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
              onClick={() => setActiveTab(id)}
              className={`flex flex-col items-center gap-1 px-6 py-2.5 rounded-ds-md touch-target justify-center transition-all ${
                activeTab === id ? 'text-klein bg-[#002FA7]/5' : 'text-muted hover:text-navy-900'
              }`}
            >
              <Icon
                className="w-6 h-6"
                strokeWidth={activeTab === id ? 2.5 : 2}
              />
              <span className="text-[13px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  )
}
