import { createContext, useContext, useState, useCallback } from 'react'
import { recentVerifications, factCheckDetails } from '../data/mockData'

const VerificationsContext = createContext(null)

export function VerificationsProvider({ children }) {
  const [verifications, setVerifications] = useState(recentVerifications)
  const [details, setDetails] = useState(factCheckDetails)

  const addVerification = useCallback((item, detail) => {
    setVerifications((prev) => [item, ...prev])
    setDetails((prev) => ({ ...prev, [item.id]: detail }))
  }, [])

  return (
    <VerificationsContext.Provider value={{ verifications, details, addVerification }}>
      {children}
    </VerificationsContext.Provider>
  )
}

export function useVerifications() {
  const ctx = useContext(VerificationsContext)
  if (!ctx) throw new Error('useVerifications must be used within VerificationsProvider')
  return ctx
}
