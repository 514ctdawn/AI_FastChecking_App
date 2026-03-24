import { useState, useRef } from 'react'
import {
  Facebook,
  Instagram,
  MessageCircle,
  Music2,
  ExternalLink,
  Loader2,
  Check,
  Link2,
} from 'lucide-react'
import { copyToClipboard } from '../utils/clipboard'

const COMMAND = '@VeriSenior 幫我查證'

const PLATFORMS = [
  {
    id: 'facebook',
    name: 'Facebook',
    command: `${COMMAND}`,
    deepLink: 'https://www.facebook.com/',
    Icon: Facebook,
    iconBg: 'bg-[#1877F2]',
  },
  {
    id: 'threads',
    name: 'Threads',
    command: `${COMMAND}`,
    deepLink: 'https://www.threads.net/',
    Icon: Instagram,
    iconBg: 'bg-neutral-900',
  },
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    command: `${COMMAND}`,
    deepLink: 'https://wa.me/',
    Icon: MessageCircle,
    iconBg: 'bg-[#25D366]',
  },
  {
    id: 'douyin',
    name: '抖音',
    command: `${COMMAND}`,
    deepLink: 'https://www.douyin.com/',
    Icon: Music2,
    iconBg: 'bg-black',
  },
]

function PlatformTile({ platform, connected, connecting, onConnect, copiedId, onCopy }) {
  const { name, command, deepLink, Icon, iconBg } = platform
  const isCopied = copiedId === platform.id

  return (
    <div
      className="flex flex-col p-4 bg-white rounded-ds-md border border-slate-200 shadow-ds-card min-h-[200px]"
      style={{ borderWidth: '0.5px' }}
    >
      <div className="flex items-start justify-between gap-2 mb-3">
        <div
          className={`w-11 h-11 rounded-ds-sm ${iconBg} flex items-center justify-center flex-shrink-0`}
          aria-hidden
        >
          <Icon className="w-5 h-5 text-white" strokeWidth={2} />
        </div>
        <span
          className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-ds-sm border font-mono ${
            connected
              ? 'text-sage border-sage/30 bg-sage/5'
              : 'text-muted border-slate-200 bg-slate-50'
          }`}
          style={{ borderWidth: '0.5px' }}
        >
          {connected ? '已連線' : '未連線'}
        </span>
      </div>
      <p className="text-[15px] font-bold text-navy-900 mb-2">{name}</p>
      <p className="text-[11px] font-mono text-navy-900/90 break-all leading-snug mb-3 px-2 py-1.5 rounded-ds-sm bg-slate-50 border border-slate-200" style={{ borderWidth: '0.5px' }}>
        {command}
      </p>
      <div className="mt-auto flex flex-col gap-2">
        <button
          type="button"
          onClick={() => onCopy(platform.id, command)}
          className="w-full flex items-center justify-center gap-2 py-2.5 rounded-ds-sm border border-slate-200 text-navy-900 text-[13px] font-semibold hover:bg-slate-50 active:bg-slate-100 touch-target"
          style={{ borderWidth: '0.5px' }}
        >
          {isCopied ? (
            <>
              <Check className="w-4 h-4 text-sage" strokeWidth={2.5} />
              已複製
            </>
          ) : (
            <>
              <Link2 className="w-4 h-4 text-muted" strokeWidth={2} />
              複製指令
            </>
          )}
        </button>
        {!connected ? (
          <button
            type="button"
            onClick={() => onConnect(platform.id)}
            disabled={connecting}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-ds-sm bg-navy-900 text-white text-[13px] font-semibold hover:bg-navy-800 disabled:opacity-70 touch-target"
          >
            {connecting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" strokeWidth={2} />
                連線中…
              </>
            ) : (
              '連線'
            )}
          </button>
        ) : (
          <a
            href={deepLink}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-ds-sm border border-klein/25 text-klein text-[13px] font-semibold hover:bg-[#002FA7]/5 touch-target"
            style={{ borderWidth: '0.5px' }}
          >
            <ExternalLink className="w-4 h-4" strokeWidth={2} />
            立即試用
          </a>
        )}
      </div>
    </div>
  )
}

function ThreadsStyleSimulation() {
  return (
    <div
      className="bg-white rounded-ds-md border border-slate-200 shadow-ds-card overflow-hidden"
      style={{ borderWidth: '0.5px' }}
    >
      <div className="px-4 py-3 border-b border-slate-200 bg-slate-50/80" style={{ borderBottomWidth: '0.5px' }}>
        <p className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">留言串模擬 · Threads 風格</p>
      </div>
      <div className="p-4 space-y-5">
        <div className="flex gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-300 to-slate-400 flex-shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-navy-900">林阿姨</p>
            <p className="text-[10px] font-mono text-muted uppercase mt-0.5">2 小時前</p>
            <p className="text-body text-navy-900 mt-2 leading-relaxed">
              大家看看這篇，說喝某種茶就能降血糖！
            </p>
            <a
              href="#"
              onClick={(e) => e.preventDefault()}
              className="text-[13px] font-mono text-klein mt-2 inline-block break-all underline decoration-klein/30 underline-offset-2"
            >
              https://example-health-news.fake/article/77291
            </a>
          </div>
        </div>
        <div className="flex gap-3 pl-2 border-l-2 border-slate-200 ml-4">
          <div className="w-9 h-9 rounded-full bg-slate-200 flex-shrink-0" aria-hidden />
          <div className="min-w-0 flex-1">
            <p className="text-[13px] font-bold text-navy-900">陳伯伯</p>
            <p className="text-[12px] font-mono text-navy-900 mt-2 px-2 py-1.5 rounded-ds-sm bg-slate-50 border border-slate-200 inline-block" style={{ borderWidth: '0.5px' }}>
              @VeriSenior 幫我查證這個連結
            </p>
          </div>
        </div>
        <div className="flex gap-3 pl-2 border-l-2 border-klein/20 ml-4">
          <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0 text-[10px] font-bold text-white">
            VS
          </div>
          <div className="min-w-0 flex-1 space-y-3">
            <div>
              <p className="text-[13px] font-bold text-navy-900">VeriSenior</p>
              <p className="text-[10px] font-mono text-muted uppercase mt-0.5">官方查核 · 機器人回覆</p>
            </div>
            <div
              className="rounded-ds-md border border-slate-200 p-4 bg-white"
              style={{ borderWidth: '0.5px' }}
            >
              <div className="flex items-baseline justify-between gap-2 mb-2">
                <span className="text-[11px] font-semibold text-muted uppercase tracking-wider font-mono">
                  Truth Score
                </span>
                <span className="text-2xl font-bold text-brick tabular-nums">23</span>
              </div>
              <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden mb-3">
                <div className="h-full w-[23%] rounded-full bg-brick" />
              </div>
              <p className="text-[13px] text-navy-900 leading-relaxed">
                來源網域無可查證紀錄，且宣稱與主流醫學指引不符。建議以醫師與衛福部公開資料為準。
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function SocialIntegrationHub() {
  const [connected, setConnected] = useState({})
  const [connectingId, setConnectingId] = useState(null)
  const [copiedId, setCopiedId] = useState(null)
  const tutorialRef = useRef(null)

  const handleConnect = (id) => {
    setConnectingId(id)
    setTimeout(() => {
      setConnected((prev) => ({ ...prev, [id]: true }))
      setConnectingId(null)
    }, 1200)
  }

  const handleCopy = async (id, text) => {
    const ok = await copyToClipboard(text)
    if (ok) {
      setCopiedId(id)
      setTimeout(() => setCopiedId(null), 2000)
    }
  }

  const scrollToTutorial = () => {
    tutorialRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  return (
    <section className="space-y-8">
      <div>
        <h2 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-2 font-mono">
          社群整合
        </h2>
        <p className="text-body text-muted leading-relaxed">
          在留言或串文中<strong className="text-navy-900">標註（@）</strong>
          <span className="font-mono text-navy-900"> @VeriSenior</span>
          ，即可請 AI 在同一則討論串內回覆查核。可先複製下方指令，貼到各平台使用。
        </p>
        <button
          type="button"
          onClick={scrollToTutorial}
          className="mt-4 text-[13px] font-semibold text-klein hover:underline underline-offset-2"
        >
          查看教學
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {PLATFORMS.map((p) => (
          <PlatformTile
            key={p.id}
            platform={p}
            connected={!!connected[p.id]}
            connecting={connectingId === p.id}
            onConnect={handleConnect}
            copiedId={copiedId}
            onCopy={handleCopy}
          />
        ))}
      </div>

      <div ref={tutorialRef}>
        <h3 className="text-[12px] font-semibold text-muted uppercase tracking-wider mb-4 font-mono">
          互動教學
        </h3>
        <ThreadsStyleSimulation />
      </div>

      <p className="text-[11px] text-muted leading-relaxed font-mono border-t border-slate-200 pt-4" style={{ borderTopWidth: '0.5px' }}>
        實際上線時，平台需透過 Webhook／API 接收 @ 提及；此處為介面示意與指令複製。
      </p>
    </section>
  )
}
