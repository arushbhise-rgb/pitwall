import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API } from '../config'

const COUNTRY_FLAGS = {
  'Australia': '🇦🇺', 'China': '🇨🇳', 'Japan': '🇯🇵', 'Bahrain': '🇧🇭',
  'Saudi Arabia': '🇸🇦', 'United States': '🇺🇸', 'Italy': '🇮🇹', 'Monaco': '🇲🇨',
  'Spain': '🇪🇸', 'Canada': '🇨🇦', 'Austria': '🇦🇹', 'United Kingdom': '🇬🇧',
  'Belgium': '🇧🇪', 'Hungary': '🇭🇺', 'Netherlands': '🇳🇱', 'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'UAE': '🇦🇪',
  'Qatar': '🇶🇦', 'Las Vegas': '🇺🇸', 'Miami': '🇺🇸',
}

function getFlag(country) {
  for (const [key, flag] of Object.entries(COUNTRY_FLAGS)) {
    if (country?.includes(key)) return flag
  }
  return '🏁'
}

// Circuit SVG maps — simplified track outlines
const CIRCUIT_SVGS = {
  'Australian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M20,60 L15,45 L18,30 L28,18 L42,14 L56,16 L64,24 L66,36 L62,50 L54,60 L42,64 L30,64 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M42,14 L44,8" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M66,36 L72,38 L70,46 L62,50" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  ),
  'Chinese Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M12,40 L12,25 L20,16 L38,13 L55,16 L65,26 L68,38 L68,52 L58,62 L40,65 L22,62 L13,52 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M65,26 L72,22 L74,32 L68,38" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="40" cy="39" r="8" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  ),
  'Japanese Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M14,50 L14,35 L20,22 L32,15 L46,15 L56,22 L60,32 L56,44 L44,52 L44,60 L56,64 L64,60" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M32,15 L28,8 L22,10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M14,35 L8,34 L8,46 L14,50" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Bahrain Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,55 L13,40 L16,26 L26,16 L40,13 L54,16 L63,27 L65,42 L58,55 L46,63 L32,63 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M63,27 L70,24 L72,35 L68,44 L65,42" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M26,16 L22,10 L30,8 L38,10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Saudi Arabian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M20,65 L16,50 L16,32 L20,20 L30,13 L42,11 L54,14 L62,22 L64,34 L62,46 L56,55 L48,62 L36,66 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M54,14 L58,8 L66,10 L68,18 L62,22" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M16,32 L10,30 L10,42 L16,44" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Miami Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M15,55 L12,42 L15,28 L24,18 L38,13 L52,16 L62,26 L65,40 L62,53 L52,62 L38,66 L24,62 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M52,16 L56,10 L64,12 L66,20 L62,26" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M38,13 L38,7" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  ),
  'Emilia Romagna Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M14,48 L14,32 L22,20 L36,14 L50,16 L62,26 L64,40 L58,52 L46,60 L32,60 L20,54 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M62,26 L70,22 L72,34 L64,40" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Monaco Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,60 L14,46 L18,32 L28,20 L38,14 L50,16 L60,24 L64,36 L62,50 L54,60 L42,66 L28,64 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50,16 L54,10 L62,12 L64,20 L60,24" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M18,32 L10,30 L10,44 L14,46" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M42,66 L44,72" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  ),
  'Spanish Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M15,52 L13,38 L17,24 L28,15 L42,12 L56,16 L64,28 L66,42 L60,55 L48,63 L34,63 L20,57 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M56,16 L60,10 L68,13 L68,22 L64,28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Canadian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M14,56 L12,40 L16,26 L26,16 L40,12 L54,16 L63,28 L65,42 L60,55 L50,63 L36,66 L22,62 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M26,16 L22,9 L32,7 L40,9" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M63,28 L70,25 L72,36 L65,42" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Austrian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M20,58 L14,44 L16,30 L26,18 L40,14 L54,18 L63,30 L64,44 L58,56 L44,63 L30,62 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M54,18 L58,12 L66,15 L66,24 L63,30" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'British Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,50 L13,36 L17,22 L28,13 L42,11 L56,15 L65,27 L67,41 L62,54 L50,62 L36,64 L22,58 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M56,15 L60,9 L68,11 L69,20 L65,27" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M17,22 L10,20 L10,32 L13,36" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Belgian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M12,44 L14,30 L22,18 L36,12 L50,14 L62,24 L66,38 L64,52 L54,62 L38,66 L24,62 L14,52 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M36,12 L34,6 L44,5 L50,8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M12,44 L6,42 L6,52 L12,54" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Hungarian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M18,55 L14,40 L17,26 L27,16 L41,13 L55,17 L63,28 L65,42 L60,54 L48,62 L34,63 L20,58 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M55,17 L59,11 L67,13 L68,22 L63,28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <circle cx="41" cy="38" r="7" stroke={color} strokeWidth="2" fill="none"/>
    </svg>
  ),
  'Dutch Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,52 L13,38 L16,24 L27,14 L41,11 L55,15 L64,26 L66,40 L62,53 L50,62 L36,64 L22,59 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M27,14 L24,8 L34,6 L42,8" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
      <path d="M64,26 L71,23 L72,34 L66,40" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Italian Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M18,55 L14,40 L17,26 L27,16 L41,13 L55,17 L63,28 L65,42 L60,54 L48,63 L34,63 L20,58 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="41" cy="38" rx="12" ry="9" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M55,17 L59,11 L67,14 L67,22 L63,28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Azerbaijan Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M15,58 L12,44 L14,30 L22,18 L35,12 L50,13 L62,22 L66,36 L64,50 L56,60 L42,66 L28,64 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M50,13 L54,7 L62,9 L64,17 L62,22" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M15,58 L9,58 L8,46 L12,44" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Singapore Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M14,56 L11,42 L14,28 L24,17 L38,13 L52,16 L62,27 L65,41 L61,54 L50,63 L36,66 L22,61 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M52,16 L57,10 L65,12 L66,21 L62,27" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M24,17 L20,11 L28,8 L36,10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'United States Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,54 L13,40 L16,26 L26,16 L40,12 L54,16 L63,27 L65,41 L61,54 L50,62 L36,65 L22,60 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M54,16 L58,10 L66,12 L67,21 L63,27" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Mexico City Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M15,55 L12,41 L15,27 L25,17 L39,13 L53,17 L62,28 L64,42 L60,54 L49,62 L35,65 L21,60 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <ellipse cx="39" cy="38" rx="10" ry="8" stroke={color} strokeWidth="2.5" fill="none"/>
      <path d="M53,17 L57,11 L65,13 L66,22 L62,28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'São Paulo Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M17,56 L14,42 L17,28 L27,17 L41,13 L55,17 L63,29 L65,43 L60,55 L48,63 L34,64 L20,59 Z" stroke={color} strokeWidth="3.5" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M41,13 L41,7" stroke={color} strokeWidth="2" fill="none"/>
      <path d="M63,29 L70,26 L71,37 L65,43" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Las Vegas Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <rect x="15" y="15" width="50" height="50" rx="4" stroke={color} strokeWidth="3" fill="none"/>
      <path d="M15,38 L35,38 L35,15" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M65,42 L45,42 L45,65" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Qatar Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,53 L13,39 L16,25 L26,15 L40,12 L54,16 L63,27 L65,41 L61,53 L50,62 L36,64 L22,59 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M54,16 L58,10 L66,12 L67,21 L63,27" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M16,53 L10,52 L9,40 L13,39" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
  'Abu Dhabi Grand Prix': (color) => (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M15,54 L12,40 L15,26 L25,16 L39,13 L53,17 L62,28 L64,42 L59,54 L47,62 L33,64 L19,59 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
      <path d="M53,17 L57,11 L65,14 L66,23 L62,28" stroke={color} strokeWidth="2.5" fill="none" strokeLinecap="round"/>
      <path d="M25,16 L21,10 L29,8 L37,10" stroke={color} strokeWidth="2" fill="none" strokeLinecap="round"/>
    </svg>
  ),
}

function getCircuitSVG(raceName, color) {
  for (const [key, fn] of Object.entries(CIRCUIT_SVGS)) {
    if (raceName?.includes(key.replace(' Grand Prix', '').split(' ')[0])) {
      return fn(color)
    }
  }
  // Default generic circuit
  return (
    <svg viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%'}}>
      <path d="M16,52 L13,38 L16,24 L27,14 L41,11 L55,15 L64,26 L66,40 L62,53 L50,62 L36,64 L22,59 Z" stroke={color} strokeWidth="3" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  )
}

function Countdown({ dateStr }) {
  const [timeLeft, setTimeLeft] = useState('')
  useEffect(() => {
    function calc() {
      const diff = new Date(dateStr) - new Date()
      if (diff <= 0) { setTimeLeft('Completed'); return }
      const d = Math.floor(diff / 86400000)
      const h = Math.floor((diff % 86400000) / 3600000)
      const m = Math.floor((diff % 3600000) / 60000)
      if (d > 0) setTimeLeft(`${d}d ${h}h`)
      else if (h > 0) setTimeLeft(`${h}h ${m}m`)
      else setTimeLeft(`${m}m`)
    }
    calc()
    const t = setInterval(calc, 60000)
    return () => clearInterval(t)
  }, [dateStr])
  return <span>{timeLeft}</span>
}

export default function Calendar() {
  const [races, setRaces] = useState([])
  const [loading, setLoading] = useState(true)
  const [year, setYear] = useState('2026')
  const navigate = useNavigate()

  useEffect(() => {
    setLoading(true)
    axios.get(`${API}/calendar?year=${year}`)
      .then(r => { setRaces(r.data.races || []); setLoading(false) })
      .catch(() => setLoading(false))
    document.title = `${year} F1 Race Calendar — PitWall`
  }, [year])

  const now = new Date()
  const nextRaceIdx = races.findIndex(r => new Date(r.date) > now)

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', padding: '16px 12px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .cal-row { transition: all .2s; }
        .cal-row:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(225,6,0,0.2) !important; cursor: pointer; }
        .circuit-svg { transition: opacity .3s; opacity: 0.5; }
        .cal-row:hover .circuit-svg { opacity: 1; }

        @media (max-width: 600px) {
          .cal-inner { grid-template-columns: 24px 22px 1fr auto !important; gap: 8px !important; padding: 10px 10px !important; }
          .cal-date-col { display: none !important; }
          .cal-circuit { display: none !important; }
          .cal-name { font-size: 12px !important; }
          .cal-location { font-size: 10px !important; }
          .cal-round { font-size: 10px !important; }
          .cal-flag { font-size: 16px !important; }
          .cal-replay { font-size: 10px !important; padding: 3px 7px !important; }
          .cal-countdown { font-size: 10px !important; }
          .cal-header-title { font-size: 16px !important; }
        }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div className="cal-header-title" style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Race Calendar</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>{year} · {races.length} rounds</div>
          </div>
          <select value={year} onChange={e => setYear(e.target.value)} style={{
            background: '#111', border: '0.5px solid #333', borderRadius: '8px',
            color: '#fff', padding: '8px 12px', fontSize: '13px', cursor: 'pointer'
          }}>
            {['2026','2025','2024','2023','2022'].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '60px' }}>
            <div style={{ width: '28px', height: '28px', border: '2.5px solid #1e1e1e', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
          </div>
        )}

        {!loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
            {races.map((race, i) => {
              const isPast = new Date(race.date) < now
              const isNext = i === nextRaceIdx
              const accentColor = isNext ? '#e10600' : isPast ? '#333' : '#444'
              const circuitColor = isNext ? '#e10600' : isPast ? '#2a2a2a' : '#2a2a2a'

              return (
                <div
                  key={i}
                  className="cal-row"
                  onClick={() => { if (isPast) navigate(`/replay?year=${year}&gp=${encodeURIComponent(race.name)}`) }}
                  style={{
                    background: isNext ? 'rgba(225,6,0,0.05)' : '#111',
                    border: `0.5px solid ${isNext ? 'rgba(225,6,0,0.25)' : '#1a1a1a'}`,
                    borderRadius: '10px',
                    overflow: 'hidden',
                    animation: `fadeUp .3s ease ${i * 0.02}s both`,
                    opacity: isPast && !isNext ? 0.55 : 1,
                  }}
                >
                  <div className="cal-inner" style={{
                    display: 'grid',
                    gridTemplateColumns: '32px 26px 1fr 90px 70px 56px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                  }}>
                    {/* Round */}
                    <div className="cal-round" style={{ fontSize: '11px', color: '#3a3a3a', fontWeight: '700', textAlign: 'center' }}>
                      R{race.round}
                    </div>

                    {/* Flag */}
                    <div className="cal-flag" style={{ fontSize: '18px', textAlign: 'center' }}>
                      {getFlag(race.country)}
                    </div>

                    {/* Name + location */}
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <div className="cal-name" style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                          {race.name}
                        </div>
                        {isNext && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.3)', padding: '2px 7px', borderRadius: '8px' }}>
                            <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#e10600', animation: 'pulse 1.5s infinite' }}></div>
                            <span style={{ fontSize: '9px', color: '#e10600', fontWeight: '700' }}>NEXT</span>
                          </div>
                        )}
                        {isPast && (
                          <div style={{ fontSize: '9px', color: '#2a2a2a', background: '#161616', padding: '2px 6px', borderRadius: '6px' }}>DONE</div>
                        )}
                      </div>
                      <div className="cal-location" style={{ fontSize: '11px', color: '#3a3a3a', marginTop: '2px' }}>
                        {race.location}, {race.country}
                      </div>
                    </div>

                    {/* Circuit SVG */}
                    <div className="cal-circuit" style={{ width: '56px', height: '42px', flexShrink: 0 }}>
                      <div className="circuit-svg">
                        {getCircuitSVG(race.name, circuitColor)}
                      </div>
                    </div>

                    {/* Date */}
                    <div className="cal-date-col" style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '12px', color: '#777', fontWeight: '600' }}>
                        {new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </div>
                      <div style={{ fontSize: '10px', color: '#333', marginTop: '2px' }}>
                        {new Date(race.date).getFullYear()}
                      </div>
                    </div>

                    {/* Countdown or replay */}
                    <div style={{ textAlign: 'right' }}>
                      {isPast ? (
                        <div className="cal-replay" style={{
                          fontSize: '11px', color: '#e10600',
                          background: 'rgba(225,6,0,0.08)',
                          border: '0.5px solid rgba(225,6,0,0.2)',
                          padding: '4px 10px', borderRadius: '7px',
                          fontWeight: '600', whiteSpace: 'nowrap',
                          display: 'inline-block'
                        }}>
                          Replay →
                        </div>
                      ) : (
                        <div className="cal-countdown" style={{ fontSize: '11px', color: isNext ? '#e10600' : '#444', fontWeight: isNext ? '700' : '400' }}>
                          <Countdown dateStr={race.date} />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Bottom accent bar for next race */}
                  {isNext && (
                    <div style={{ height: '2px', background: 'linear-gradient(90deg, #e10600, transparent)', margin: '0' }} />
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}