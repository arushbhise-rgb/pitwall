import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import RaceReplay from './pages/RaceReplay'
import HeadToHead from './pages/HeadToHead'

export default function App() {
  return (
    <div>
      <Navbar />
      <Routes>
        <Route path="/" element={<RaceReplay />} />
        <Route path="/h2h" element={<HeadToHead />} />
      </Routes>
    </div>
  )
}