import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Landing from './pages/Landing'
import RaceReplay from './pages/RaceReplay'
import HeadToHead from './pages/HeadToHead'
import Contact from './pages/Contact'
import Support from './pages/Support'

export default function App() {
  return (
    <div>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/replay" element={<><Navbar /><RaceReplay /></>} />
        <Route path="/h2h" element={<><Navbar /><HeadToHead /></>} />
        <Route path="/contact" element={<><Navbar /><Contact /></>} />
        <Route path="/support" element={<><Navbar /><Support /></>} />
      </Routes>
    </div>
  )
}