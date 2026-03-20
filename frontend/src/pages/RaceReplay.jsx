import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Legend
} from 'chart.js'
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

import { API } from '../config'

import { getDriverColor } from '../constants/driverData'

const TIRE_COLORS = {
  SOFT: '#e8002d', MEDIUM: '#f5c842',
  HARD: '#ffffff', INTERMEDIATE: '#52e252', WET: '#3671c6'
}

const RACES_BY_YEAR = {
  '2026': ['Australian Grand Prix', 'Chinese Grand Prix'],
  '2025': ['Australian Grand Prix','Chinese Grand Prix','Japanese Grand Prix','Bahrain Grand Prix','Saudi Arabian Grand Prix','Miami Grand Prix','Emilia Romagna Grand Prix','Monaco Grand Prix','Spanish Grand Prix','Canadian Grand Prix','Austrian Grand Prix','British Grand Prix','Belgian Grand Prix','Hungarian Grand Prix','Dutch Grand Prix','Italian Grand Prix','Azerbaijan Grand Prix','Singapore Grand Prix','United States Grand Prix','Mexico City Grand Prix','São Paulo Grand Prix','Las Vegas Grand Prix','Qatar Grand Prix','Abu Dhabi Grand Prix'],
  '2024': ['Bahrain Grand Prix','Saudi Arabian Grand Prix','Australian Grand Prix','Japanese Grand Prix','Chinese Grand Prix','Miami Grand Prix','Emilia Romagna Grand Prix','Monaco Grand Prix','Canadian Grand Prix','Spanish Grand Prix','Austrian Grand Prix','British Grand Prix','Hungarian Grand Prix','Belgian Grand Prix','Dutch Grand Prix','Italian Grand Prix','Azerbaijan Grand Prix','Singapore Grand Prix','United States Grand Prix','Mexico City Grand Prix','São Paulo Grand Prix','Las Vegas Grand Prix','Qatar Grand Prix','Abu Dhabi Grand Prix'],
  '2023': ['Bahrain Grand Prix','Saudi Arabian Grand Prix','Australian Grand Prix','Azerbaijan Grand Prix','Miami Grand Prix','Monaco Grand Prix','Spanish Grand Prix','Canadian Grand Prix','Austrian Grand Prix','British Grand Prix','Hungarian Grand Prix','Belgian Grand Prix','Dutch Grand Prix','Italian Grand Prix','Singapore Grand Prix','Japanese Grand Prix','Qatar Grand Prix','United States Grand Prix','Mexico City Grand Prix','São Paulo Grand Prix','Las Vegas Grand Prix','Abu Dhabi Grand Prix'],
}
RACES_BY_YEAR['2022'] = RACES_BY_YEAR['2024']
RACES_BY_YEAR['2021'] = RACES_BY_YEAR['2023']
RACES_BY_YEAR['2020'] = RACES_BY_YEAR['2023']
RACES_BY_YEAR['2019'] = RACES_BY_YEAR['2023']
RACES_BY_YEAR['2018'] = RACES_BY_YEAR['2023']

function LoadingTimer() {
  const [seconds, setSeconds] = useState(0)
  const msgs = [
    'Connecting to F1 data servers...',
    'Downloading lap telemetry...',
    'Processing position data...',
    'Building lap time charts...',
    'Almost there...',
    'Still loading — first load takes up to 30 seconds...',
    'Worth the wait — real F1 data incoming...',
  ]
  useEffect(() => {
    const t = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(t)
  }, [])
  const msgIndex = Math.min(Math.floor(seconds / 4), msgs.length - 1)
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: '11px', color: '#444', marginBottom: '8px' }}>{msgs[msgIndex]}</div>
      <div style={{ fontSize: '11px', color: '#333' }}>{seconds}s</div>
      <div style={{ width: '200px', height: '2px', background: '#1a1a1a', borderRadius: '1px', margin: '8px auto 0', overflow: 'hidden' }}>
        <div style={{ height: '100%', background: '#e10600', borderRadius: '1px', width: `${Math.min(seconds / 30 * 100, 95)}%`, transition: 'width 1s linear' }}></div>
      </div>
    </div>
  )
}

export default function RaceReplay() {
  const [year, setYear] = useState('2026')
  const [gp, setGp] = useState('Australian Grand Prix')
  const [races, setRaces] = useState(RACES_BY_YEAR['2026'])
  const [raceData, setRaceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [aiReply, setAiReply] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedDrivers, setSelectedDrivers] = useState([])
  const [activeTab, setActiveTab] = useState('positions')

  useEffect(() => {
    const fallback = RACES_BY_YEAR[year] || RACES_BY_YEAR['2024']
    setRaces(fallback)
    setGp(fallback[0])
    axios.get(`${API}/races?year=${year}`)
      .then(r => {
        if (r.data.races && r.data.races.length > 0) {
          setRaces(r.data.races)
          setGp(r.data.races[0])
        }
      })
      .catch(err => console.warn('Failed to fetch races:', err))
  }, [year])

  async function loadRace() {
    setLoading(true)
    setRaceData(null)
    setAiReply('')
    try {
      const r = await axios.get(`${API}/race?year=${year}&gp=${encodeURIComponent(gp)}`)
      setRaceData(r.data)
      setSelectedDrivers(r.data.drivers.slice(0, 6))
    } catch(e) {
      alert(`No data available for ${gp} ${year} yet — this race may not have happened yet or data is still processing.`)
    }
    setLoading(false)
  }

  async function askAI() {
    if (!question || !raceData) return
    setAiLoading(true)
    const q = question.toLowerCase()
    const lapMatch = q.match(/lap\s*(\d+)/)
    const posMatch = q.match(/p(\d+)|(\d+)(st|nd|rd|th)?\s*place|position\s*(\d+)/)

    if (lapMatch && posMatch) {
      const lapNum = parseInt(lapMatch[1])
      const posNum = parseInt(posMatch[1] || posMatch[2] || posMatch[4])
      if (lapNum >= 1 && lapNum <= raceData.total_laps) {
        const lapPositions = raceData.drivers.map(d => {
          const pos = raceData.position_data[d]?.[lapNum - 1]
          return pos && pos > 0 ? { driver: d, pos } : null
        }).filter(Boolean).sort((a, b) => a.pos - b.pos)
        const driverAtPos = lapPositions.find(x => x.pos === posNum)
        if (driverAtPos) {
          const fullOrder = lapPositions.map(x => `P${x.pos}: ${x.driver}`).join('\n')
          setAiReply(`On lap ${lapNum} of the ${raceData.gp} Grand Prix, ${driverAtPos.driver} held P${posNum}.\n\nFull order at lap ${lapNum}:\n${fullOrder}`)
          setAiLoading(false)
          return
        }
      }
    }

    if (q.includes('who won') || q.includes('race winner') || q.includes('finish first')) {
      const finalPositions = raceData.drivers.map(d => {
        const positions = raceData.position_data[d]
        const lastPos = positions ? [...positions].reverse().find(p => p > 0) : null
        return lastPos ? { driver: d, pos: lastPos } : null
      }).filter(Boolean).sort((a, b) => a.pos - b.pos)
      setAiReply(`Race result — ${raceData.gp} ${raceData.year}:\n\n${finalPositions.slice(0,5).map(x => `P${x.pos}: ${x.driver}`).join('\n')}`)
      setAiLoading(false)
      return
    }

    const allLapPositions = []
    for (let lap = 1; lap <= raceData.total_laps; lap++) {
      const lapData = raceData.drivers.map(d => {
        const pos = raceData.position_data[d]?.[lap - 1]
        return pos && pos > 0 ? `${d}:P${pos}` : null
      }).filter(Boolean).sort((a, b) => parseInt(a.split(':P')[1]) - parseInt(b.split(':P')[1]))
      allLapPositions.push(`Lap ${lap}: ${lapData.join(' ')}`)
    }

    const summary = `Race: ${raceData.gp} Grand Prix ${raceData.year}\nTotal laps: ${raceData.total_laps}\nDrivers: ${raceData.drivers.join(', ')}\n\nCOMPLETE LAP BY LAP POSITIONS:\n${allLapPositions.join('\n')}`

    try {
      const r = await axios.post(`${API}/analyze`, { race_summary: summary, question })
      setAiReply(r.data.response)
    } catch(e) { setAiReply('AI unavailable right now.') }
    setAiLoading(false)
  }

  function toggleDriver(d) {
    setSelectedDrivers(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  }

  function getTireStints(driver) {
    if (!raceData || !raceData.tire_data[driver]) return []
    const tires = raceData.tire_data[driver]
    if (tires.length === 0) return []
    const stints = []
    let current = tires[0], start = 0
    for (let i = 1; i < tires.length; i++) {
      if (tires[i] !== current) {
        stints.push({ compound: current, start: start + 1, end: i })
        current = tires[i]
        start = i
      }
    }
    stints.push({ compound: current, start: start + 1, end: tires.length })
    return stints
  }

  const laps = raceData ? Array.from({length: raceData.total_laps}, (_, i) => i + 1) : []
  const cardStyle = { background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '12px', padding: '16px' }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)', background: '#0a0a0a' }} className="race-layout">
      <style>{`
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes orbitSpin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes orbitSpinR { from { transform: rotate(0deg); } to { transform: rotate(-360deg); } }
        @keyframes glowPulse { 0%,100% { opacity:0.4; } 50% { opacity:0.8; } }
        @keyframes tagFloat { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-4px); } }
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        .sidebar-item:hover { background: rgba(255,255,255,0.04) !important; }
        .tab-btn:hover { opacity: 0.8; }
      `}</style>

      {/* SIDEBAR */}
      <div className="race-sidebar" style={{
        width: '230px', background: '#0f0f0f',
        borderRight: '0.5px solid #1a1a1a',
        padding: '16px', display: 'flex',
        flexDirection: 'column', gap: '12px', flexShrink: 0,
        overflowY: 'auto'
      }}>
        <div style={{ fontSize: '10px', color: '#444', letterSpacing: '.8px', textTransform: 'uppercase' }}>Race selector</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={year} onChange={e => setYear(e.target.value)} style={{
            background: '#1a1a1a', border: '0.5px solid #2a2a2a',
            borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '13px'
          }}>
            {['2026','2025','2024','2023','2022','2021','2020','2019','2018'].map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={gp} onChange={e => setGp(e.target.value)} style={{
            background: '#1a1a1a', border: '0.5px solid #2a2a2a',
            borderRadius: '8px', color: '#fff', padding: '8px 10px', fontSize: '13px'
          }}>
            {races.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>

        <button onClick={loadRace} disabled={loading} style={{
          background: loading ? '#333' : '#e10600', color: '#fff', border: 'none',
          padding: '10px', borderRadius: '8px', fontSize: '13px',
          fontWeight: '600', cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all .2s', boxShadow: loading ? 'none' : '0 0 12px rgba(225,6,0,0.3)'
        }}>{loading ? 'Loading...' : 'Load race data'}</button>

        {/* Empty sidebar state */}
        {!raceData && !loading && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ height: '0.5px', background: '#1a1a1a', margin: '4px 0' }}/>
            <div style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '2px' }}>How it works</div>
            {[
              { num: '1', text: 'Pick a season', sub: '2018 to 2026 live' },
              { num: '2', text: 'Select a race', sub: 'Any Grand Prix' },
              { num: '3', text: 'Load race data', sub: 'Real F1 telemetry' },
            ].map((s, i) => (
              <div key={i} className="sidebar-item" style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', background: '#111', border: '0.5px solid #1a1a1a',
                borderRadius: '8px', transition: 'all .15s'
              }}>
                <div style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '700', color: '#e10600', flexShrink: 0 }}>{s.num}</div>
                <div>
                  <div style={{ fontSize: '11px', fontWeight: '600', color: '#aaa' }}>{s.text}</div>
                  <div style={{ fontSize: '10px', color: '#444', marginTop: '1px' }}>{s.sub}</div>
                </div>
              </div>
            ))}
            <div style={{ height: '0.5px', background: '#1a1a1a', margin: '4px 0' }}/>
            <div style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '4px' }}>Features</div>
            {[
              { icon: '📍', label: 'Position changes' },
              { icon: '⏱', label: 'Lap times' },
              { icon: '🔄', label: 'Tire strategy' },
              { icon: '📊', label: 'Gap to leader' },
              { icon: '⚡', label: 'Sector times' },
              { icon: '🤖', label: 'AI analyst' },
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', borderRadius: '6px' }}>
                <span style={{ fontSize: '13px' }}>{f.icon}</span>
                <span style={{ fontSize: '11px', color: '#444' }}>{f.label}</span>
              </div>
            ))}
            <div style={{ height: '0.5px', background: '#1a1a1a', margin: '4px 0' }}/>
            <div style={{ padding: '10px', background: 'rgba(225,6,0,0.04)', border: '0.5px solid rgba(225,6,0,0.1)', borderRadius: '8px' }}>
              <div style={{ fontSize: '10px', color: '#e10600', fontWeight: '600', marginBottom: '4px' }}>💡 Tip</div>
              <div style={{ fontSize: '10px', color: '#444', lineHeight: '1.6' }}>First load ~30 seconds. After that every race is instant from cache.</div>
            </div>
          </div>
        )}

        {/* Driver list after race loads */}
        {raceData && (
          <>
            <div style={{ height: '0.5px', background: '#1a1a1a' }}/>
            <div style={{ fontSize: '10px', color: '#444', letterSpacing: '.8px', textTransform: 'uppercase' }}>Drivers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {raceData.drivers.map((d, i) => (
                <div key={d} onClick={() => toggleDriver(d)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '6px 8px', borderRadius: '7px', cursor: 'pointer',
                  background: selectedDrivers.includes(d) ? '#1a1a1a' : 'transparent',
                  border: `0.5px solid ${selectedDrivers.includes(d) ? '#2a2a2a' : 'transparent'}`,
                  opacity: selectedDrivers.includes(d) ? 1 : 0.35,
                  transition: 'all .12s'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getDriverColor(d, i, year), flexShrink: 0, boxShadow: selectedDrivers.includes(d) ? `0 0 6px ${getDriverColor(d, i, year)}66` : 'none' }}></div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#fff', flex: 1 }}>{d}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto', background: '#0a0a0a' }}>

        {/* EMPTY STATE */}
        {!raceData && !loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '0', padding: '40px 20px', position: 'relative', overflow: 'hidden', minHeight: '400px' }}>

            {/* Grid background */}
            <div style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 0.5 }}>
              <svg width="100%" height="100%" style={{ position: 'absolute' }}>
                <defs>
                  <pattern id="emptygrid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(225,6,0,0.12)" strokeWidth="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#emptygrid)"/>
              </svg>
              <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(225,6,0,0.06), transparent 70%)', animation: 'glowPulse 3s ease-in-out infinite' }}/>
            </div>

            {/* Orbit rings */}
            <div style={{ position: 'relative', width: '160px', height: '160px', marginBottom: '28px' }}>
              <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(225,6,0,0.15)', borderRadius: '50%', animation: 'orbitSpin 8s linear infinite' }}>
                <div style={{ position: 'absolute', top: '-4px', left: '50%', width: '8px', height: '8px', background: '#e10600', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 8px rgba(225,6,0,0.8)' }}/>
              </div>
              <div style={{ position: 'absolute', inset: '20px', border: '1px solid rgba(225,6,0,0.08)', borderRadius: '50%', animation: 'orbitSpinR 5s linear infinite' }}>
                <div style={{ position: 'absolute', bottom: '-4px', left: '50%', width: '6px', height: '6px', background: '#ff4040', borderRadius: '50%', transform: 'translateX(-50%)', boxShadow: '0 0 6px rgba(255,64,64,0.8)' }}/>
              </div>
              <div style={{ position: 'absolute', inset: '40px', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '50%', animation: 'orbitSpin 3s linear infinite' }}>
                <div style={{ position: 'absolute', top: '-3px', right: '8px', width: '6px', height: '6px', background: '#3671c6', borderRadius: '50%', boxShadow: '0 0 6px rgba(54,113,198,0.8)' }}/>
              </div>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '52px', height: '52px', background: 'linear-gradient(135deg, #e10600, #b30500)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '16px', boxShadow: '0 0 20px rgba(225,6,0,0.4)' }}>PW</div>
              </div>
            </div>

            <div style={{ position: 'relative', textAlign: 'center', marginBottom: '28px' }}>
              <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Ready to analyze</div>
              <div style={{ fontSize: '13px', color: '#444', lineHeight: '1.7', maxWidth: '280px' }}>
                Pick a season and race from the sidebar then hit <span style={{ color: '#e10600', fontWeight: '600' }}>Load race data</span>
              </div>
            </div>

            {/* Quick pick */}
            <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '8px', width: '100%', maxWidth: '340px' }}>
              <div style={{ fontSize: '10px', color: '#333', textTransform: 'uppercase', letterSpacing: '1px', textAlign: 'center', marginBottom: '4px' }}>Popular races</div>
              {[
                { y: '2026', r: 'Chinese Grand Prix', label: '2026 Chinese GP', tag: 'Live season', tagColor: '#e10600' },
                { y: '2024', r: 'Monaco Grand Prix', label: '2024 Monaco GP', tag: 'Classic', tagColor: '#f5c842' },
                { y: '2023', r: 'British Grand Prix', label: '2023 British GP', tag: 'Fan favourite', tagColor: '#3671c6' },
              ].map((item, i) => (
                <div key={i}onClick={async () => {
                    setYear(item.y)
                    setRaces(RACES_BY_YEAR[item.y] || RACES_BY_YEAR['2024'])
                    setGp(item.r)
                    setLoading(true)
                    setRaceData(null)
                    setAiReply('')
                    try {
                      const r = await axios.get(`${API}/race?year=${item.y}&gp=${encodeURIComponent(item.r)}`)
                      setRaceData(r.data)
                      setSelectedDrivers(r.data.drivers.slice(0, 6))
                    } catch(e) { alert('Error loading race') }
                    setLoading(false)
                  }} style={{
                  background: '#111', border: '0.5px solid #1e1e1e',
                  borderRadius: '10px', padding: '10px 14px',
                  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                  cursor: 'pointer', transition: 'all .2s',
                  animation: `tagFloat ${2 + i * 0.4}s ease-in-out infinite`,
                }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.3)'; e.currentTarget.style.background = 'rgba(225,6,0,0.05)' }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#1e1e1e'; e.currentTarget.style.background = '#111' }}
                >
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>{item.label}</div>
                    <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>Click to select</div>
                  </div>
                  <div style={{ fontSize: '10px', color: item.tagColor, background: item.tagColor + '15', border: `0.5px solid ${item.tagColor}33`, padding: '3px 8px', borderRadius: '8px' }}>{item.tag}</div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOADING STATE */}
        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', minHeight: '400px' }}>
            <div style={{ position: 'relative', width: '48px', height: '48px' }}>
              <div style={{ width: '48px', height: '48px', border: '2px solid #1a1a1a', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite', position: 'absolute' }}></div>
              <div style={{ width: '32px', height: '32px', border: '2px solid #1a1a1a', borderBottomColor: '#e10600', borderRadius: '50%', animation: 'spin 1.1s linear infinite reverse', position: 'absolute', top: '8px', left: '8px' }}></div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '14px', color: '#fff', fontWeight: '600', marginBottom: '6px' }}>Loading race data</div>
              <div style={{ fontSize: '12px', color: '#444' }}>Hang tight — fetching real F1 telemetry</div>
            </div>
            <LoadingTimer />
          </div>
        )}

        {/* RACE DATA */}
        {raceData && (
          <>
            {/* Race header */}
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>{raceData.gp} Grand Prix {raceData.year}</div>
                  {raceData.year >= 2026 && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.3)', padding: '2px 8px', borderRadius: '10px' }}>
                      <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#e10600', animation: 'pulse 1.5s infinite' }}></div>
                      <span style={{ fontSize: '10px', color: '#e10600', fontWeight: '600' }}>LIVE</span>
                    </div>
                  )}
                </div>
                <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>{raceData.total_laps} laps · {raceData.drivers.length} drivers</div>
              </div>
              <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginTop: '8px' }}>
                {['positions','laptimes','tires','gap','sectors'].map(tab => (
                  <button key={tab} className="tab-btn" onClick={() => setActiveTab(tab)} style={{
                    background: activeTab === tab ? '#e10600' : '#1a1a1a',
                    color: activeTab === tab ? '#fff' : '#666',
                    border: `0.5px solid ${activeTab === tab ? '#e10600' : '#2a2a2a'}`,
                    padding: '7px 14px', borderRadius: '6px',
                    fontSize: '12px', cursor: 'pointer', textTransform: 'capitalize',
                    transition: 'all .15s', minHeight: '36px'
                  }}>{tab}</button>
                ))}
              </div>
            </div>

            {/* Stats row */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
              {[
                { val: (() => {
                    let winner = raceData.drivers[0], bestPos = 999
                    for (const d of raceData.drivers) {
                      const positions = raceData.position_data[d]
                      if (positions && positions.length > 0) {
                        const lastPos = positions[positions.length - 1]
                        if (lastPos > 0 && lastPos < bestPos) { bestPos = lastPos; winner = d }
                      }
                    }
                    return winner
                  })(), lbl: 'Race winner', sub: 'P1 finisher' },
                { val: raceData.total_laps, lbl: 'Total laps', sub: 'Race distance' },
                { val: raceData.drivers.length, lbl: 'Drivers', sub: 'Started race' },
                { val: selectedDrivers.length, lbl: 'Shown', sub: 'Click to toggle' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '10px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '700' }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: '#666', marginTop: '3px' }}>{s.lbl}</div>
                  <div style={{ fontSize: '10px', color: '#333', marginTop: '1px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {/* Charts */}
            {activeTab === 'positions' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#aaa' }}>Position changes — every lap</div>
                <Line data={{ labels: laps, datasets: raceData.drivers.map((d, i) => ({ label: d, data: (() => {
                      const positions = raceData.position_data[d]
                      if (!positions) return []
                      let lastValid = null
                      return positions.map(p => {
                        if (p && p > 0) { lastValid = p; return p }
                        return lastValid
                      })
                    })(), borderColor: getDriverColor(d, i, year), backgroundColor: 'transparent', borderWidth: selectedDrivers.includes(d) ? 2.5 : 0.5, pointRadius: 0, pointHoverRadius: 4, tension: .3, hidden: !selectedDrivers.includes(d) })) }}
                  options={{ responsive: true, plugins: { legend: { labels: { color: '#666', font: { size: 11 }, boxWidth: 12, filter: item => selectedDrivers.includes(item.text) } }, tooltip: { mode: 'index', intersect: false, callbacks: { title: items => `Lap ${items[0].label}`, label: c => `${c.dataset.label}: P${c.raw}` }, itemSort: (a, b) => a.raw - b.raw } }, scales: { x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', maxTicksLimit: 12, font: { size: 10 } }, title: { display: true, text: 'Lap', color: '#444', font: { size: 10 } } }, y: { reverse: true, min: 1, max: 20, grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', stepSize: 2, font: { size: 10 } }, title: { display: true, text: 'Position', color: '#444', font: { size: 10 } } } } }}
                />
              </div>
            )}

            {activeTab === 'laptimes' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#aaa' }}>Lap times comparison</div>
                <Line data={{ labels: laps, datasets: raceData.drivers.map((d, i) => ({ label: d, data: raceData.lap_time_data[d], borderColor: getDriverColor(d, i, year), backgroundColor: 'transparent', borderWidth: selectedDrivers.includes(d) ? 1.8 : 0.5, pointRadius: 0, pointHoverRadius: 4, tension: .25, spanGaps: false, hidden: !selectedDrivers.includes(d) })) }}
                  options={{ responsive: true, plugins: { legend: { labels: { color: '#666', font: { size: 11 }, boxWidth: 12, filter: item => selectedDrivers.includes(item.text) } }, tooltip: { mode: 'index', intersect: false, callbacks: { label: c => c.raw ? `${c.dataset.label}: ${c.raw.toFixed(3)}s` : null, filter: i => i.raw !== null } } }, scales: { x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', maxTicksLimit: 12, font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', font: { size: 10 }, callback: v => `${v.toFixed(1)}s` }, title: { display: true, text: 'Lap time (s)', color: '#444', font: { size: 10 } } } } }}
                />
              </div>
            )}

            {activeTab === 'tires' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '14px', color: '#aaa' }}>Tire strategy</div>
                {selectedDrivers.map(d => {
                  const stints = getTireStints(d)
                  const driverIndex = raceData.drivers.indexOf(d)
                  return (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '32px', fontSize: '11px', fontWeight: '600', color: getDriverColor(d, driverIndex, year) }}>{d}</div>
                      <div style={{ display: 'flex', gap: '2px', flex: 1, height: '24px' }}>
                        {stints.map((s, i) => {
                          const pct = ((s.end - s.start + 1) / raceData.total_laps * 100).toFixed(0)
                          const color = TIRE_COLORS[s.compound] || '#888'
                          return (
                            <div key={i} style={{ flex: pct, background: color === '#ffffff' ? '#333' : color + '22', border: `1px solid ${color === '#ffffff' ? '#888' : color + '55'}`, borderRadius: '3px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '9px', color: color === '#ffffff' ? '#fff' : color, fontWeight: '600' }}>
                              {s.compound?.[0]} {s.start}-{s.end}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  {Object.entries(TIRE_COLORS).map(([name, color]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color + '33', border: `1px solid ${color}` }}></div>
                      <span style={{ fontSize: '10px', color: '#555' }}>{name[0] + name.slice(1).toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'gap' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#aaa' }}>Gap to race leader — seconds</div>
                <GapChart raceData={raceData} selectedDrivers={selectedDrivers} getDriverColor={getDriverColor} API={API} year={year} />
              </div>
            )}

            {activeTab === 'sectors' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px', color: '#aaa' }}>Sector times</div>
                <SectorChart raceData={raceData} selectedDrivers={selectedDrivers} getDriverColor={getDriverColor} API={API} year={year} />
              </div>
            )}

            {/* AI Analyst */}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e10600', animation: 'pulse 2s infinite' }}></div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>AI race analyst</div>
                <div style={{ fontSize: '10px', color: '#444', background: '#1a1a1a', padding: '2px 8px', borderRadius: '8px', marginLeft: 'auto', border: '0.5px solid #2a2a2a' }}>GPT-4o-mini</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={question} onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAI()}
                  placeholder="Ask about the race... e.g. who was P3 on lap 6?"
                  style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '7px', color: '#fff', padding: '9px 12px', fontSize: '13px' }}
                />
                <button onClick={askAI} disabled={aiLoading} style={{
                  background: aiLoading ? '#333' : '#e10600', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: '7px', fontSize: '13px',
                  fontWeight: '600', cursor: aiLoading ? 'not-allowed' : 'pointer',
                  transition: 'all .2s'
                }}>{aiLoading ? '...' : 'Ask'}</button>
              </div>
              {aiReply && (
                <div style={{ marginTop: '12px', background: '#0f0f0f', border: '0.5px solid #1e1e1e', borderRadius: '8px', padding: '14px', fontSize: '13px', color: '#aaa', lineHeight: '1.8' }}>
                  {aiReply.split('\n').map((line, i) => (
                    line.trim() === ''
                      ? <div key={i} style={{ height: '8px' }} />
                      : <div key={i} style={{ marginBottom: '3px', color: line.startsWith('P') && line.includes(':') ? '#fff' : '#888', fontWeight: line.startsWith('P') && line.includes(':') ? '600' : '400' }}>{line}</div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function GapChart({ raceData, selectedDrivers, getDriverColor, API, year }) {
  const [gapData, setGapData] = useState(null)
  useEffect(() => {
    if (!raceData) return
    axios.get(`${API}/gap-to-leader?year=${raceData.year}&gp=${encodeURIComponent(raceData.gp)}`).then(r => setGapData(r.data)).catch(e => console.error(e))
  }, [raceData])
  if (!gapData) return <div style={{ color: '#444', fontSize: '13px', padding: '20px 0' }}>Loading gap data...</div>
  const laps = Array.from({length: gapData.total_laps}, (_, i) => i + 1)
  return (
    <Line data={{ labels: laps, datasets: gapData.drivers.map((d, i) => ({ label: d, data: gapData.gap_data[d], borderColor: getDriverColor(d, i, year), backgroundColor: 'transparent', borderWidth: selectedDrivers.includes(d) ? 2 : 0.5, pointRadius: 0, pointHoverRadius: 4, tension: .3, spanGaps: false, hidden: !selectedDrivers.includes(d) })) }}
      options={{ responsive: true, plugins: { legend: { labels: { color: '#666', font: { size: 11 }, boxWidth: 12, filter: item => selectedDrivers.includes(item.text) } }, tooltip: { mode: 'index', intersect: false, itemSort: (a, b) => a.raw - b.raw, callbacks: { title: items => `Lap ${items[0].label}`, label: c => c.raw !== null ? `${c.dataset.label}: +${c.raw.toFixed(3)}s` : null, filter: i => i.raw !== null } } }, scales: { x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', maxTicksLimit: 12, font: { size: 10 } }, title: { display: true, text: 'Lap', color: '#444', font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', font: { size: 10 }, callback: v => `+${v.toFixed(1)}s` }, title: { display: true, text: 'Gap to leader', color: '#444', font: { size: 10 } } } } }}
    />
  )
}

function SectorChart({ raceData, selectedDrivers, getDriverColor, API, year }) {
  const [sectorData, setSectorData] = useState(null)
  const [activeSector, setActiveSector] = useState('s1')
  useEffect(() => {
    if (!raceData) return
    axios.get(`${API}/sectors?year=${raceData.year}&gp=${encodeURIComponent(raceData.gp)}`).then(r => setSectorData(r.data)).catch(e => console.error(e))
  }, [raceData])
  if (!sectorData) return <div style={{ color: '#444', fontSize: '13px', padding: '20px 0' }}>Loading sector data...</div>
  const laps = Array.from({length: sectorData.total_laps}, (_, i) => i + 1)
  const sectorLabels = { s1: 'Sector 1', s2: 'Sector 2', s3: 'Sector 3' }
  return (
    <>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {['s1','s2','s3'].map(s => (
          <button key={s} onClick={() => setActiveSector(s)} style={{ background: activeSector === s ? '#e10600' : '#1a1a1a', color: activeSector === s ? '#fff' : '#555', border: `0.5px solid ${activeSector === s ? '#e10600' : '#2a2a2a'}`, padding: '4px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', transition: 'all .15s' }}>{sectorLabels[s]}</button>
        ))}
      </div>
      <Line data={{ labels: laps, datasets: sectorData.drivers.map((d, i) => ({ label: d, data: sectorData.sector_data[d]?.[activeSector], borderColor: getDriverColor(d, i, year), backgroundColor: 'transparent', borderWidth: selectedDrivers.includes(d) ? 2 : 0.5, pointRadius: 0, pointHoverRadius: 4, tension: .25, spanGaps: false, hidden: !selectedDrivers.includes(d) })) }}
        options={{ responsive: true, plugins: { legend: { labels: { color: '#666', font: { size: 11 }, boxWidth: 12, filter: item => selectedDrivers.includes(item.text) } }, tooltip: { mode: 'index', intersect: false, callbacks: { title: items => `Lap ${items[0].label}`, label: c => c.raw ? `${c.dataset.label}: ${c.raw.toFixed(3)}s` : null, filter: i => i.raw !== null } } }, scales: { x: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', maxTicksLimit: 12, font: { size: 10 } } }, y: { grid: { color: 'rgba(255,255,255,.03)' }, ticks: { color: '#444', font: { size: 10 }, callback: v => `${v.toFixed(2)}s` }, title: { display: true, text: 'Sector time (s)', color: '#444', font: { size: 10 } } } } }}
      />
    </>
  )
}