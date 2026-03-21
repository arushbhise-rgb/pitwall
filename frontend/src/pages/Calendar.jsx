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
  }, [year])

  const now = new Date()
  const nextRaceIdx = races.findIndex(r => new Date(r.date) > now)

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', padding: '20px 16px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        .cal-row:hover { background: rgba(255,255,255,0.04) !important; border-color: rgba(225,6,0,0.2) !important; cursor: pointer; }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Race Calendar</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>Full season schedule with countdowns</div>
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {races.map((race, i) => {
              const isPast = new Date(race.date) < now
              const isNext = i === nextRaceIdx

              return (
                <div key={i} className="cal-row" onClick={() => {
                  if (isPast) navigate(`/replay?year=${year}&gp=${encodeURIComponent(race.name)}`)
                }} style={{
                  background: isNext ? 'rgba(225,6,0,0.06)' : '#111',
                  border: `0.5px solid ${isNext ? 'rgba(225,6,0,0.3)' : '#1e1e1e'}`,
                  borderRadius: '10px', padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '32px 28px 1fr auto auto',
                  alignItems: 'center', gap: '14px',
                  animation: `fadeUp .3s ease ${i * 0.02}s both`,
                  opacity: isPast && !isNext ? 0.5 : 1,
                  transition: 'all .2s',
                }}>
                  {/* Round */}
                  <div style={{ fontSize: '11px', color: '#444', fontWeight: '700', textAlign: 'center' }}>
                    R{race.round}
                  </div>

                  {/* Flag */}
                  <div style={{ fontSize: '20px', textAlign: 'center' }}>
                    {getFlag(race.country)}
                  </div>

                  {/* Name + location */}
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff' }}>
                        {race.name}
                      </div>
                      {isNext && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.3)', padding: '2px 8px', borderRadius: '8px' }}>
                          <div style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#e10600', animation: 'pulse 1.5s infinite' }}></div>
                          <span style={{ fontSize: '9px', color: '#e10600', fontWeight: '700' }}>NEXT</span>
                        </div>
                      )}
                      {isPast && (
                        <div style={{ fontSize: '9px', color: '#333', background: '#1a1a1a', padding: '2px 6px', borderRadius: '6px' }}>
                          DONE
                        </div>
                      )}
                    </div>
                    <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>
                      {race.location}, {race.country}
                    </div>
                  </div>

                  {/* Date */}
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '12px', color: '#aaa', fontWeight: '600' }}>
                      {new Date(race.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                    </div>
                    <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>
                      {new Date(race.date).getFullYear()}
                    </div>
                  </div>

                  {/* Countdown or replay button */}
                  <div style={{ minWidth: '80px', textAlign: 'right' }}>
                    {isPast ? (
                      <div style={{ fontSize: '11px', color: '#e10600', background: 'rgba(225,6,0,0.08)', border: '0.5px solid rgba(225,6,0,0.2)', padding: '4px 10px', borderRadius: '7px', fontWeight: '600' }}>
                        Replay →
                      </div>
                    ) : (
                      <div style={{ fontSize: '11px', color: isNext ? '#e10600' : '#555', fontWeight: isNext ? '700' : '400' }}>
                        <Countdown dateStr={race.date} />
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}