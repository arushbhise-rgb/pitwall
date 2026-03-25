import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
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

const COUNTRY_CODES = {
  'Australia': 'au', 'China': 'cn', 'Japan': 'jp', 'Bahrain': 'bh',
  'Saudi Arabia': 'sa', 'United States': 'us', 'Italy': 'it', 'Monaco': 'mc',
  'Spain': 'es', 'Canada': 'ca', 'Austria': 'at', 'United Kingdom': 'gb',
  'Belgium': 'be', 'Hungary': 'hu', 'Netherlands': 'nl', 'Azerbaijan': 'az',
  'Singapore': 'sg', 'Mexico': 'mx', 'Brazil': 'br', 'UAE': 'ae',
  'Qatar': 'qa', 'Las Vegas': 'us', 'Miami': 'us',
}

function getFlag(country) {
  for (const [key, code] of Object.entries(COUNTRY_CODES)) {
    if (country?.includes(key)) return code
  }
  return null
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
      <Helmet>
        <title>F1 Calendar 2026 — Race Schedule & Dates | PitWall</title>
        <meta name="description" content="Full 2026 Formula 1 race calendar with dates, circuits, and countdown timers. Never miss a Grand Prix." />
        <meta property="og:title" content="F1 Calendar 2026 | PitWall" />
        <meta property="og:description" content="Complete 2026 F1 race schedule with dates and circuits." />
        <link rel="canonical" href="https://pitwall-f1.com/calendar" />
      </Helmet>
      <style>{`
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
                    gridTemplateColumns: '32px 26px 1fr 90px 70px',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px 14px',
                  }}>
                    {/* Round */}
                    <div className="cal-round" style={{ fontSize: '11px', color: '#3a3a3a', fontWeight: '700', textAlign: 'center' }}>
                      R{race.round}
                    </div>

                    {/* Flag */}
                    <div className="cal-flag" style={{ textAlign: 'center' }}>
                      {getFlag(race.country) ? (
                        <img
                          src={`https://flagcdn.com/32x24/${getFlag(race.country)}.png`}
                          alt={`${race.country} flag`}
                          loading="lazy"
                          style={{ width: '28px', height: '21px', borderRadius: '3px', objectFit: 'cover', display: 'block', margin: '0 auto' }}
                          onError={e => e.target.style.display = 'none'}
                        />
                      ) : <span style={{ fontSize: '16px' }}>🏁</span>}
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