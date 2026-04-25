import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useSearchParams, useNavigate } from 'react-router-dom'
import axios from 'axios'
import { API } from '../config'
import { getConstructorColor, getDriverColor } from '../constants/driverData'

export default function Team() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const teamName = searchParams.get('name') || ''
  const [year, setYear] = useState(searchParams.get('year') || '2026')
  const [teamData, setTeamData] = useState(null)
  const [drivers, setDrivers] = useState([])
  const [loading, setLoading] = useState(false)

  const color = getConstructorColor(teamName) || '#e10600'

  useEffect(() => {
    if (!teamName) return
    loadTeamData()
  }, [teamName, year])

  async function loadTeamData() {
    setLoading(true)
    try {
      const [consRes, drvRes] = await Promise.all([
        axios.get(`${API}/standings/constructors?year=${year}`),
        axios.get(`${API}/standings/drivers?year=${year}`)
      ])
      const team = consRes.data?.standings?.find(t => t.name === teamName)
      setTeamData(team)
      const teamDrivers = (drvRes.data?.standings || []).filter(d => d.team === teamName)
      setDrivers(teamDrivers)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  if (!teamName) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>No team selected</div>
        <div style={{ fontSize: '13px', color: '#555' }}>Navigate here from the Standings page</div>
        <button onClick={() => navigate('/standings')} style={{ background: '#e10600', color: '#fff', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}>Go to Standings</button>
      </div>
    )
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a' }}>
      <Helmet>
        <title>{teamName} {year} — Constructor Profile | PitWall</title>
        <meta name="description" content={`${teamName} ${year} Formula 1 constructor profile. Season points, wins, and driver lineup.`} />
      </Helmet>

      {/* Hero */}
      <div style={{
        background: `linear-gradient(135deg, ${color}12, transparent 60%), linear-gradient(180deg, #111 0%, #0a0a0a 100%)`,
        borderBottom: '0.5px solid #1a1a1a',
        padding: '36px 24px 32px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${color}, ${color}44, transparent)` }}></div>
        <div style={{ position: 'absolute', right: '-40px', bottom: '-30px', fontSize: '180px', fontWeight: '900', color, opacity: 0.04, userSelect: 'none', lineHeight: 1 }}>F1</div>

        <div style={{ maxWidth: '900px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '20px', flexWrap: 'wrap' }}>
            {/* Team color bar */}
            <div style={{ width: '6px', height: '56px', background: color, borderRadius: '3px', flexShrink: 0 }}></div>
            <div>
              <div style={{ fontSize: '11px', color, textTransform: 'uppercase', letterSpacing: '2px', fontWeight: '600', marginBottom: '6px' }}>Constructor</div>
              <div style={{ fontSize: '34px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>{teamName}</div>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <select value={year} onChange={e => setYear(e.target.value)} style={{
                background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '10px',
                color: '#fff', padding: '10px 16px', fontSize: '14px', cursor: 'pointer', fontWeight: '600'
              }}>
                {['2026','2025','2024','2023','2022','2021','2020','2019','2018'].map(y => <option key={y}>{y}</option>)}
              </select>
            </div>
          </div>

          {/* Season stats */}
          {loading && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#444', fontSize: '13px' }}>
              <div style={{ width: '18px', height: '18px', border: `2px solid ${color}33`, borderTopColor: color, borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
              Loading {year} season data...
            </div>
          )}

          {!loading && teamData && (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { label: 'Position', value: `P${teamData.position}`, highlight: teamData.position === 1 },
                { label: 'Points', value: teamData.points },
                { label: 'Wins', value: teamData.wins },
                { label: 'Nationality', value: teamData.nationality },
              ].map((s, i) => (
                <div key={i} style={{ background: '#111', border: `0.5px solid ${s.highlight ? color + '44' : '#1e1e1e'}`, borderRadius: '12px', padding: '16px 20px', minWidth: '100px' }}>
                  <div style={{ fontSize: '22px', fontWeight: '800', color: s.highlight ? color : '#fff' }}>{s.value}</div>
                  <div style={{ fontSize: '10px', color: '#444', marginTop: '4px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                </div>
              ))}
            </div>
          )}

          {!loading && !teamData && (
            <div style={{ fontSize: '13px', color: '#444' }}>No data found for {teamName} in {year}</div>
          )}
        </div>
      </div>

      {/* Driver lineup */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '28px 24px' }}>
        {!loading && drivers.length > 0 && (
          <>
            <div style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '14px', fontWeight: '600' }}>Driver Lineup — {year}</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px', marginBottom: '32px' }}>
              {drivers.map((d, i) => {
                const dColor = getDriverColor(d.code, i, year) || color
                return (
                  <div key={d.code} style={{
                    background: 'linear-gradient(145deg, #161616, #111)',
                    border: `1px solid ${dColor}33`,
                    borderRadius: '16px', padding: '20px',
                    cursor: 'pointer', transition: 'all .2s',
                    boxShadow: `0 4px 20px ${dColor}10`,
                    position: 'relative', overflow: 'hidden'
                  }}
                    onClick={() => navigate(`/drivers?driver=${d.code}&year=${year}`)}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 28px ${dColor}22` }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 4px 20px ${dColor}10` }}
                  >
                    <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${dColor}, transparent)`, borderRadius: '16px 16px 0 0' }}></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px', marginBottom: '14px' }}>
                      <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: dColor + '22', border: `2px solid ${dColor}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '900', color: dColor, flexShrink: 0 }}>{d.code}</div>
                      <div>
                        <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff', letterSpacing: '-0.3px' }}>{d.name}</div>
                        <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>P{d.position} in championship</div>
                      </div>
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '8px' }}>
                      {[
                        { label: 'Points', value: d.points },
                        { label: 'Wins', value: d.wins },
                        { label: 'Nationality', value: d.nationality?.slice(0, 3) || '—' },
                      ].map((s, j) => (
                        <div key={j} style={{ textAlign: 'center', background: '#0f0f0f', borderRadius: '8px', padding: '8px' }}>
                          <div style={{ fontSize: '16px', fontWeight: '700', color: j === 0 ? dColor : '#fff' }}>{s.value}</div>
                          <div style={{ fontSize: '9px', color: '#444', marginTop: '2px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: '12px', fontSize: '11px', color: '#444', textAlign: 'right' }}>View profile →</div>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {/* Navigate back */}
        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <button onClick={() => navigate(`/standings?year=${year}`)} style={{ background: '#111', border: '0.5px solid #222', color: '#666', padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => { e.currentTarget.style.color = '#aaa'; e.currentTarget.style.borderColor = '#444' }}
            onMouseLeave={e => { e.currentTarget.style.color = '#666'; e.currentTarget.style.borderColor = '#222' }}
          >← Back to Standings</button>
          <button onClick={() => navigate(`/replay`)} style={{ background: color + '18', border: `0.5px solid ${color}33`, color, padding: '10px 20px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = color + '30'}
            onMouseLeave={e => e.currentTarget.style.background = color + '18'}
          >🏎️ Race Replay</button>
        </div>
      </div>
    </div>
  )
}
