import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://pitwall-production-c292.up.railway.app'

const TEAM_COLORS = {
  'Red Bull': '#3671c6', 'Red Bull Racing': '#3671c6',
  'Ferrari': '#e8002d', 'Scuderia Ferrari': '#e8002d',
  'McLaren': '#ff8000', 'McLaren F1 Team': '#ff8000',
  'Mercedes': '#00d2be', 'Mercedes-AMG Petronas': '#00d2be',
  'Aston Martin': '#52e252', 'Aston Martin F1 Team': '#52e252',
  'Alpine': '#0093cc', 'Alpine F1 Team': '#0093cc',
  'Williams': '#005aff', 'Williams Racing': '#005aff',
  'AlphaTauri': '#6692ff', 'RB': '#6692ff', 'Racing Bulls': '#6692ff',
  'Alfa Romeo': '#c92d4b', 'Sauber': '#c92d4b', 'Kick Sauber': '#c92d4b',
  'Haas': '#b6babd', 'Haas F1 Team': '#b6babd',
  'Audi': '#e8002d',
  'Cadillac': '#ffffff',
}

function getTeamColor(team) {
  for (const [key, color] of Object.entries(TEAM_COLORS)) {
    if (team.toLowerCase().includes(key.toLowerCase())) return color
  }
  return '#888'
}

const DRIVER_COLORS = {
  VER: '#3671c6', PER: '#3671c6',
  LEC: '#e8002d', SAI: '#e8002d', BEA: '#e8002d',
  NOR: '#ff8000', PIA: '#ff8000',
  HAM: '#00d2be', RUS: '#00d2be',
  ALO: '#52e252', STR: '#52e252',
  GAS: '#0093cc', OCO: '#0093cc',
  TSU: '#6692ff', LAW: '#6692ff',
  ALB: '#005aff', COL: '#005aff',
  MAG: '#b6babd', HUL: '#b6babd',
  ZHO: '#c92d4b', BOT: '#c92d4b',
  ANT: '#00d2be', HAD: '#6692ff',
  BOR: '#0093cc', DOO: '#0093cc',
}

function getDriverColor(code) {
  return DRIVER_COLORS[code] || '#888'
}

export default function Standings() {
  const [year, setYear] = useState('2026')
  const [tab, setTab] = useState('drivers')
  const [drivers, setDrivers] = useState(null)
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadStandings()
  }, [year])

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
      setTeams(tr.data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const maxPoints = tab === 'drivers'
    ? (drivers?.standings?.[0]?.points || 1)
    : (teams?.standings?.[0]?.points || 1)

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', padding: '24px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes shimmer { 0%,100% { opacity:.6; } 50% { opacity:1; } }
        .standing-row { transition: all .2s; cursor: default; }
        .standing-row:hover { background: rgba(255,255,255,0.04) !important; transform: translateX(4px); }
      `}</style>

      <div style={{ maxWidth: '860px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
              Championship Standings
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '3px' }}>
              {drivers?.round ? `After round ${drivers.round}` : 'Full season'} · {year}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
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
        <div style={{ display: 'flex', gap: '4px', marginBottom: '20px', background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '10px', padding: '4px', width: 'fit-content' }}>
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
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', border: '2.5px solid #1e1e1e', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
            <div style={{ fontSize: '13px', color: '#555' }}>Loading standings...</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {/* Driver Standings */}
        {!loading && tab === 'drivers' && drivers?.standings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {drivers.standings.map((d, i) => {
              const color = getDriverColor(d.code)
              const pct = (d.points / maxPoints * 100).toFixed(1)
              return (
                <div key={i} className="standing-row" style={{
                  background: i === 0 ? 'rgba(225,6,0,0.05)' : '#111',
                  border: `0.5px solid ${i === 0 ? 'rgba(225,6,0,0.2)' : '#1e1e1e'}`,
                  borderRadius: '10px', padding: '14px 16px',
                  display: 'grid',
                  gridTemplateColumns: '36px 44px 1fr auto auto',
                  alignItems: 'center', gap: '12px',
                  animation: `fadeUp .3s ease ${i * 0.03}s both`
                }}>
                  <div style={{
                    fontSize: i === 0 ? '18px' : '14px',
                    fontWeight: '800',
                    color: i === 0 ? '#e10600' : i < 3 ? '#fff' : '#555',
                    textAlign: 'center'
                  }}>P{d.position}</div>

                  <div style={{
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: color + '22',
                    border: `1.5px solid ${color}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '11px', fontWeight: '800', color: color
                  }}>{d.code}</div>

                  <div>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: '#fff', marginBottom: '4px' }}>{d.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: getTeamColor(d.team), flexShrink: 0 }}></div>
                      <div style={{ fontSize: '11px', color: '#555' }}>{d.team}</div>
                    </div>
                    <div style={{ marginTop: '6px', height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden', width: '160px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width .8s ease' }}></div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>Wins</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: d.wins > 0 ? '#f5c842' : '#333' }}>{d.wins}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>Points</div>
                    <div style={{ fontSize: '20px', fontWeight: '800', color: i === 0 ? '#e10600' : '#fff' }}>{d.points}</div>
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
              const color = getTeamColor(t.name)
              const pct = (t.points / maxPoints * 100).toFixed(1)
              return (
                <div key={i} className="standing-row" style={{
                  background: i === 0 ? 'rgba(225,6,0,0.05)' : '#111',
                  border: `0.5px solid ${i === 0 ? 'rgba(225,6,0,0.2)' : '#1e1e1e'}`,
                  borderRadius: '10px', padding: '16px 20px',
                  display: 'grid',
                  gridTemplateColumns: '36px 1fr auto auto',
                  alignItems: 'center', gap: '16px',
                  animation: `fadeUp .3s ease ${i * 0.04}s both`
                }}>
                  <div style={{
                    fontSize: i === 0 ? '18px' : '14px',
                    fontWeight: '800',
                    color: i === 0 ? '#e10600' : i < 3 ? '#fff' : '#555',
                    textAlign: 'center'
                  }}>P{t.position}</div>

                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                      <div style={{ width: '4px', height: '24px', background: color, borderRadius: '2px', flexShrink: 0 }}></div>
                      <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff' }}>{t.name}</div>
                    </div>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px' }}>{t.nationality}</div>
                    <div style={{ height: '3px', background: '#1a1a1a', borderRadius: '2px', overflow: 'hidden', width: '200px' }}>
                      <div style={{ height: '100%', width: `${pct}%`, background: color, borderRadius: '2px', transition: 'width .8s ease' }}></div>
                    </div>
                  </div>

                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>Wins</div>
                    <div style={{ fontSize: '16px', fontWeight: '700', color: t.wins > 0 ? '#f5c842' : '#333' }}>{t.wins}</div>
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '11px', color: '#555', marginBottom: '2px' }}>Points</div>
                    <div style={{ fontSize: '24px', fontWeight: '800', color: i === 0 ? '#e10600' : '#fff' }}>{t.points}</div>
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