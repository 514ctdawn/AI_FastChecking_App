import { useEffect, useRef, useState, useCallback } from 'react'
import { useVerifications } from '../context/VerificationsContext'
import NewVerificationToast from './NewVerificationToast'

/**
 * Long polling (15s) + toast when new verification ids appear (Threads tag → webhook → API).
 */
export default function SocialSync() {
  const { refreshVerifications, verifications, backendStatus } = useVerifications()
  const [toast, setToast] = useState(false)
  const prevIdsRef = useRef<Set<string>>(new Set())
  const baselineOkRef = useRef(false)

  useEffect(() => {
    void refreshVerifications()
    const id = window.setInterval(() => void refreshVerifications(), 15_000)
    return () => window.clearInterval(id)
  }, [refreshVerifications])

  useEffect(() => {
    if (backendStatus !== 'ok') return
    const ids = new Set(verifications.map((v) => v.id))
    if (!baselineOkRef.current) {
      baselineOkRef.current = true
      prevIdsRef.current = ids
      return
    }
    let hasNew = false
    for (const v of verifications) {
      if (!prevIdsRef.current.has(v.id)) {
        hasNew = true
        break
      }
    }
    if (hasNew) setToast(true)
    prevIdsRef.current = ids
  }, [verifications, backendStatus])

  const dismiss = useCallback(() => setToast(false), [])

  return <NewVerificationToast visible={toast} onDismiss={dismiss} />
}
