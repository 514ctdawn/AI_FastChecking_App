import { Routes, Route } from 'react-router-dom'
import { VerificationsProvider } from './context/VerificationsContext'
import MobileApp from './pages/MobileApp'
import FactCheckResult from './pages/FactCheckResult'
import AddToHomeScreenBanner from './components/AddToHomeScreenBanner'

function App() {
  return (
    <VerificationsProvider>
      <AddToHomeScreenBanner />
      <Routes>
        <Route path="/" element={<MobileApp />} />
        <Route path="/result/:id" element={<FactCheckResult />} />
      </Routes>
    </VerificationsProvider>
  )
}

export default App
