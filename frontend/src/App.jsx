import { Routes, Route } from 'react-router-dom'
import { Suspense, lazy, useEffect } from 'react'
import Layout from './components/Layout'
import Landing from './pages/Landing'
import InstallPrompt from './components/InstallPrompt'

const RaceReplay = lazy(() => import('./pages/RaceReplay'))
const HeadToHead = lazy(() => import('./pages/HeadToHead'))
const Standings = lazy(() => import('./pages/Standings'))
const Calendar = lazy(() => import('./pages/Calendar'))
const Drivers = lazy(() => import('./pages/Drivers'))
const Contact = lazy(() => import('./pages/Contact'))
const Support = lazy(() => import('./pages/Support'))
const Community = lazy(() => import('./pages/Community'))
const Team = lazy(() => import('./pages/Team'))
const NotFound = lazy(() => import('./pages/NotFound'))

function PageLoader() {
  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid #1a1a1a', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
    </div>
  )
}

export default function App() {
  // Prefetch most common routes after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      import('./pages/RaceReplay')
      import('./pages/Standings')
    }, 3000)
    return () => clearTimeout(timer)
  }, [])

  return (
    <>
    <InstallPrompt />
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/replay" element={<Suspense fallback={<PageLoader />}><Layout><RaceReplay /></Layout></Suspense>} />
      <Route path="/h2h" element={<Suspense fallback={<PageLoader />}><Layout><HeadToHead /></Layout></Suspense>} />
      <Route path="/standings" element={<Suspense fallback={<PageLoader />}><Layout><Standings /></Layout></Suspense>} />
      <Route path="/calendar" element={<Suspense fallback={<PageLoader />}><Layout><Calendar /></Layout></Suspense>} />
      <Route path="/drivers" element={<Suspense fallback={<PageLoader />}><Layout><Drivers /></Layout></Suspense>} />
      <Route path="/contact" element={<Suspense fallback={<PageLoader />}><Layout><Contact /></Layout></Suspense>} />
      <Route path="/support" element={<Suspense fallback={<PageLoader />}><Layout><Support /></Layout></Suspense>} />
      <Route path="/community" element={<Suspense fallback={<PageLoader />}><Layout><Community /></Layout></Suspense>} />
      <Route path="/team" element={<Suspense fallback={<PageLoader />}><Layout><Team /></Layout></Suspense>} />
      <Route path="*" element={<Suspense fallback={<PageLoader />}><NotFound /></Suspense>} />
    </Routes>
    </>
  )
}
