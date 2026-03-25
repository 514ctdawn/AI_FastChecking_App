import { Routes, Route } from 'react-router-dom'
import { VerificationsProvider } from './context/VerificationsContext'
import MobileApp from './pages/MobileApp'
import FactCheckResult from './pages/FactCheckResult'
import AddToHomeScreenBanner from './components/AddToHomeScreenBanner'
import SocialSync from './components/SocialSync'
import { fetchLatestVerifications } from './api/verifications'

function App() {
  return (
    <VerificationsProvider>
      <SocialSync />
      <AddToHomeScreenBanner />
      <Routes>
        <Route path="/" element={<MobileApp />} />
        <Route path="/result/:id" element={<FactCheckResult />} />
      </Routes>
    </VerificationsProvider>
  )
}

export default App
/** Same as `src/api/verifications` — used for tests or manual sync. */
export { fetchLatestVerifications }
