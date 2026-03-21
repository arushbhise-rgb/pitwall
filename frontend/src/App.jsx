import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy } from 'react'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'

const RaceReplay = lazy(() => import('./pages/RaceReplay'))
const HeadToHead = lazy(() => import('./pages/HeadToHead'))
const Standings = lazy(() => import('./pages/Standings'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Drivers = lazy(() => import('./pages/Drivers'))
const DriverProfile = lazy(() => import('./pages/DriverProfile'))
const Contact = lazy(() => import('./pages/Contact'))
const Support = lazy(() => import('./pages/Support'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  )
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/replay" element={<Suspense fallback={<PageLoader />}><Navbar /><RaceReplay /></Suspense>} />
      <Route path="/h2h" element={<Suspense fallback={<PageLoader />}><Navbar /><HeadToHead /></Suspense>} />
      <Route path="/standings" element={<Suspense fallback={<PageLoader />}><Navbar /><Standings /></Suspense>} />
      <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><Navbar /><Calendar /></Suspense>} />
      <Route path="/drivers" element={<Suspense fallback={<PageLoader />}><Navbar /><Drivers /></Suspense>} />
      <Route path="/drivers/:code" element={<Suspense fallback={<PageLoader />}><Navbar /><DriverProfile /></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Navbar /><Contact /></Suspense>} />
      <Route path="/support" element={<Suspense fallback={<PageLoader />}><Navbar /><Support /></Suspense>} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
  )
}