import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'
import { getDriverColor, getConstructorColor } from '../constants/driverData'
import { API } from '../config'
import { SkeletonRow } from '../components/Skeleton'

export default function Standings() {
  const [year, setYear] = useState('2026')
  const [tab, setTab] = useState('drivers')
  const [drivers, setDrivers] = useState(null)
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => { loadStandings() }, [year])

  async function loadStandings() {
    setLoading(true)
    setDrivers(null)
    setTeams(null)
    try {
      const [dr, tr] = await Promise.all([
        axios.get(`${API}/standings/drivers?year=${year}`),
        axios.get(`${API}/standings/constructors?year=${year}`)
      ])
      setDrivers(dr.data)
      document.title = `${year} F1 Championship Standings — PitWall`
      setTeams(tr.data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const maxDriverPoints = drivers?.standings?.[0]?.points || 1
  const maxTeamPoints = teams?.standings?.[0]?.points || 1

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', padding: '20px 16px' }}>
      <Helmet>
        <title>F1 Standings {year} — Driver & Constructor Championships | PitWall</title>
        <meta name="description" content={`Live ${year} F1 championship standings. Driver and constructor points, wins, and podiums updated after every race.`} />
        <meta property="og:title" content={`F1 Standings ${year} | PitWall`} />
        <meta property="og:description" content={`${year} Formula 1 championship standings — drivers and constructors.`} />
        <link rel="canonical" href="https://pitwall-f1.com/standings" />
      </Helmet>
      <style>{`
        .s-row { transition: all .2s; }
        .s-row:hover { background: rgba(255,255,255,0.04) !important; transform: translateX(3px); }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div className="standings-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '20px', fontWeight: '800', letterSpacing: '-0.5px' }}>Championship Standings</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>
              {drivers?.round ? `After round ${drivers.round}` : 'Full season'} · {year}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={year} onChange={e => setYear(e.target.value)} style={{
              background: '#111', border: '0.5px solid #333',
              borderRadius: '8px', color: '#fff', padding: '8px 12px',
              fontSize: '13px', cursor: 'pointer'
            }}>
              {['2026','2025','2024','2023','2022','2021','2020','2019','2018'].map(y => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Tabs */}
        <div className="standings-tabs" style={{ display: 'flex', gap: '4px', marginBottom: '16px', background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
          {['drivers', 'constructors'].map(t => (
            <button key={t} onClick={() => setTab(t)} style={{
              background: tab === t ? '#e10600' : 'transparent',
              border: 'none', color: tab === t ? '#fff' : '#555',
              padding: '7px 18px', borderRadius: '7px',
              fontSize: '13px', fontWeight: '600', cursor: 'pointer',
              textTransform: 'capitalize', transition: 'all .2s'
            }}>{t}</button>
          ))}
        </div>

        {/* Loading */}
        {loading && <SkeletonRow count={10} />}

        {/* Driver Standings */}
        {!loading && tab === 'drivers' && drivers?.standings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {drivers.standings.map((d, i) => {
              const color = getDriverColor(d.code, 0, year)
              const pct = (d.points / maxDriverPoints * 100).toFixed(1)
              return (
                <div key={i} className="s-row standings-row-driver" onClick={() => navigate(`/drivers?driver=${d.code}&year=${year}`)} style={{
                  background: i === 0 ? 'rgba(225,6,0,0.05)' : '#111',
                  border: `0.5px solid ${i === 0 ? 'rgba(225,6,0,0.2)' : '#1e1e1e'}`,
                  borderRadius: '10px', padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '36px 44px 1fr auto auto',
                  alignItems: 'center', gap: '12px',
                  animation: `fadeUp .3s ease ${i * 0.03}s both`,
                  cursor: 'pointer'
                }}>
                  <div style={{
                    fontSize: i === 0 ? '16px' : '13px',
                    fontWeight: '800',
                    color: i === 0 ? '#e10600' : i < 3 ? '#fff' : '#555',
                    textAlign: 'center'
                  }}>P{d.position}</div>

                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%',
                    background: color + '22',
                    border: `1.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '10px', fontWeight: '800', color: color,
                    flexShrink: 0
                  }}>{d.code}</div>

                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{d.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '5px' }}>
                      <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: getConstructorColor(d.team), flexShrink: 0 }}></div>
                      <div style={{ fontSize: '11px', color: '#555' }}>{d.team}</div>
                    </div>
                    <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden', width: '100%', maxWidth: '160px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width .8s ease' }}></div>
                    </div>
                  </div>

                  <div className="wins-col" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Wins</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: d.wins > 0 ? '#f5c842' : '#333' }}>{d.wins}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Points</div>
                    <div style={{ fontSize: '18px', fontWeight: '800', color: i === 0 ? '#e10600' : '#fff' }}>{d.points}</div>
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Constructor Standings */}
        {!loading && tab === 'constructors' && teams?.standings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {teams.standings.map((t, i) => {
              const color = getConstructorColor(t.name)
              const pct = (t.points / maxTeamPoints * 100).toFixed(1)
              return (
                <div key={i} className="s-row standings-row-team" style={{
                  background: i === 0 ? 'rgba(225,6,0,0.05)' : '#111',
                  border: `0.5px solid ${i === 0 ? 'rgba(225,6,0,0.2)' : '#1e1e1e'}`,
                  borderRadius: '10px', padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr auto auto',
                  alignItems: 'center', gap: '16px',
                  animation: `fadeUp .3s ease ${i * 0.04}s both`,
                  cursor: 'default'
                }}>
                  <div style={{
                    fontSize: i === 0 ? '16px' : '13px',
                    fontWeight: '800',
                    color: i === 0 ? '#e10600' : i < 3 ? '#fff' : '#555',
                    textAlign: 'center'
                  }}>P{t.position}</div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '5px' }}>
                      <div style={{ width: '4px', height: '22px', background: color, borderRadius: '2px', flexShrink: 0 }}></div>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff' }}>{t.name}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px', paddingLeft: '14px' }}>{t.nationality}</div>
                    <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden', width: '100%', maxWidth: '200px', marginLeft: '14px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width .8s ease' }}></div>
                    </div>
                  </div>

                  <div className="wins-col" style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Wins</div>
                    <div style={{ fontSize: '15px', fontWeight: '700', color: t.wins > 0 ? '#f5c842' : '#333' }}>{t.wins}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '10px', color: '#555', marginBottom: '2px' }}>Points</div>
                    <div style={{ fontSize: '22px', fontWeight: '800', color: i === 0 ? '#e10600' : '#fff' }}>{t.points}</div>
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