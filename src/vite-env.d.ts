/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  /** Set to "true" to show bundled demo cards when the API is unreachable (local UX only). */
  readonly VITE_VERIFICATIONS_MOCK?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

/** Web Speech API (Chromium) */
interface SpeechRecognitionAlternative {
  readonly transcript: string
}
interface SpeechRecognitionResult {
  readonly [index: number]: SpeechRecognitionAlternative
}
interface SpeechRecognitionResultList {
  readonly [index: number]: SpeechRecognitionResult
}
interface SpeechRecognitionEvent extends Event {
  readonly results: SpeechRecognitionResultList
}
interface SpeechRecognition extends EventTarget {
  continuous: boolean
  interimResults: boolean
  lang: string
  onresult: ((ev: SpeechRecognitionEvent) => void) | null
  onerror: ((ev: Event) => void) | null
  onend: (() => void) | null
  start(): void
  abort(): void
}
declare var SpeechRecognition: { new (): SpeechRecognition }
interface Window {
  SpeechRecognition?: typeof SpeechRecognition
  webkitSpeechRecognition?: typeof SpeechRecognition
}

// `vite-plugin-pwa` provides this virtual module at build time.
declare module 'virtual:pwa-register' {
  export function registerSW(options?: unknown): void
}
