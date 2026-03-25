import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import { fetchLatestVerifications } from '../api/verifications'
import { recentVerifications, factCheckDetails } from '../data/mockData'
import { apiRowToDetail, apiRowToListItem } from '../utils/mapApiVerification'
import type { ApiVerificationRow, VerificationDetail, VerificationListItem } from '../types/verification'

type BackendStatus = 'idle' | 'loading' | 'ok' | 'error'

type LocalExtra = { item: VerificationListItem; detail: VerificationDetail }

function mockListItems(): VerificationListItem[] {
  return recentVerifications.map((v) => ({
    id: v.id,
    snippet: v.snippet,
    platform: v.platform,
    status: v.status as VerificationListItem['status'],
    date: v.date,
  }))
}

function mockDetailsMap(): Record<string, VerificationDetail> {
  const out: Record<string, VerificationDetail> = {}
  for (const [id, d] of Object.entries(factCheckDetails)) {
    out[id] = {
      id: d.id,
      snippet: d.snippet,
      status: d.status as VerificationDetail['status'],
      simpleExplanation: d.simpleExplanation,
      verifiedByAi: false,
    }
  }
  return out
}

const useMockFallback = import.meta.env.VITE_VERIFICATIONS_MOCK === 'true'

type VerificationsContextValue = {
  verifications: VerificationListItem[]
  details: Record<string, VerificationDetail>
  addVerification: (item: VerificationListItem, detail: VerificationDetail) => void
  /** Replaces server-backed list with latest API rows; keeps local extras. */
  applyServerVerifications: (rows: ApiVerificationRow[]) => void
  refreshVerifications: () => Promise<void>
  isLoading: boolean
  backendStatus: BackendStatus
  /** True when demo/mock cards are used because VITE_VERIFICATIONS_MOCK=true */
  usesMockData: boolean
}

const VerificationsContext = createContext<VerificationsContextValue | null>(null)

export function VerificationsProvider({ children }: { children: ReactNode }) {
  const [backendStatus, setBackendStatus] = useState<BackendStatus>('loading')
  const [apiList, setApiList] = useState<VerificationListItem[]>([])
  const [apiDetails, setApiDetails] = useState<Record<string, VerificationDetail>>({})
  const [localExtras, setLocalExtras] = useState<LocalExtra[]>([])

  const applyServerVerifications = useCallback((rows: ApiVerificationRow[]) => {
    const list = rows.map(apiRowToListItem)
    const details: Record<string, VerificationDetail> = {}
    for (const r of rows) {
      details[r.id] = apiRowToDetail(r)
    }
    setApiList(list)
    setApiDetails(details)
    setBackendStatus('ok')
  }, [])

  const refreshVerifications = useCallback(async () => {
    // When built with demo-only mode, do not attempt to call a non-existent backend.
    if (useMockFallback) {
      setBackendStatus('error')
      return
    }

    setBackendStatus('loading')
    try {
      const rows = await fetchLatestVerifications()
      applyServerVerifications(rows)
    } catch {
      setBackendStatus('error')
    }
  }, [applyServerVerifications])

  const addVerification = useCallback((item: VerificationListItem, detail: VerificationDetail) => {
    setLocalExtras((prev) => [{ item, detail }, ...prev])
  }, [])

  const verifications = useMemo(() => {
    const baseList =
      backendStatus === 'ok'
        ? apiList
        : backendStatus === 'loading'
          ? []
          : useMockFallback
            ? mockListItems()
            : []
    const apiIds =
      backendStatus === 'ok' ? new Set(apiList.map((v) => v.id)) : new Set<string>()
    const locals = localExtras.filter((x) => !apiIds.has(x.item.id)).map((x) => x.item)
    return [...locals, ...baseList]
  }, [apiList, backendStatus, localExtras])

  const details = useMemo(() => {
    const base =
      backendStatus === 'ok'
        ? apiDetails
        : backendStatus === 'loading'
          ? {}
          : useMockFallback
            ? mockDetailsMap()
            : {}
    const localMap = Object.fromEntries(localExtras.map((x) => [x.item.id, x.detail]))
    return { ...base, ...localMap }
  }, [apiDetails, backendStatus, localExtras])

  const isLoading = backendStatus === 'loading'

  const value = useMemo(
    () => ({
      verifications,
      details,
      addVerification,
      applyServerVerifications,
      refreshVerifications,
      isLoading,
      backendStatus,
      usesMockData: useMockFallback && backendStatus !== 'ok' && backendStatus !== 'loading',
    }),
    [
      verifications,
      details,
      addVerification,
      applyServerVerifications,
      refreshVerifications,
      isLoading,
      backendStatus,
    ]
  )

  return <VerificationsContext.Provider value={value}>{children}</VerificationsContext.Provider>
}

export function useVerifications(): VerificationsContextValue {
  const ctx = useContext(VerificationsContext)
  if (!ctx) throw new Error('useVerifications must be used within VerificationsProvider')
  return ctx
}
