import { useState, useEffect } from 'react'
import axios from 'axios'

const API = 'https://pitwall-production-c292.up.railway.app'

// Team colors by constructor name
const CONSTRUCTOR_COLORS = {
  'red bull': '#3671c6', 'red bull racing': '#3671c6',
  'ferrari': '#e8002d', 'scuderia ferrari': '#e8002d',
  'mclaren': '#ff8000', 'mclaren f1 team': '#ff8000',
  'mercedes': '#00d2be', 'mercedes-amg': '#00d2be', 'mercedes-amg petronas': '#00d2be',
  'aston martin': '#52e252', 'aston martin f1': '#52e252',
  'alpine': '#0093cc', 'alpine f1': '#0093cc',
  'williams': '#005aff', 'williams racing': '#005aff',
  'alphatauri': '#6692ff', 'rb': '#6692ff', 'racing bulls': '#6692ff', 'visa cash app rb': '#6692ff',
  'alfa romeo': '#c92d4b', 'sauber': '#c92d4b', 'kick sauber': '#c92d4b', 'stake f1': '#c92d4b',
  'haas': '#b6babd', 'haas f1 team': '#b6babd', 'moneygram haas': '#b6babd',
  'audi': '#e8002d',
  'cadillac': '#ffffff', 'andretti': '#ffffff',
}

function getConstructorColor(name) {
  if (!name) return '#888'
  const lower = name.toLowerCase()
  for (const [key, color] of Object.entries(CONSTRUCTOR_COLORS)) {
    if (lower.includes(key)) return color
  }
  return '#888'
}

// Driver colors per season
const DRIVER_COLORS_BY_YEAR = {
  '2026': {
    VER: '#3671c6', HAD: '#3671c6',
    LEC: '#e8002d', HAM: '#e8002d', BEA: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000', DOO: '#ff8000',
    RUS: '#00d2be', ANT: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', COL: '#0093cc',
    TSU: '#6692ff', LAW: '#6692ff',
    ALB: '#005aff', SAI: '#005aff',
    OCO: '#b6babd', MAG: '#b6babd',
    HUL: '#c92d4b', BOR: '#c92d4b',
    PER: '#ffffff', BOT: '#ffffff',
  },
  '2025': {
    VER: '#3671c6', LAW: '#3671c6',
    LEC: '#e8002d', HAM: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000',
    RUS: '#00d2be', ANT: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', DOO: '#0093cc',
    TSU: '#6692ff', HAD: '#6692ff',
    ALB: '#005aff', SAI: '#005aff',
    MAG: '#b6babd', OCO: '#b6babd',
    HUL: '#c92d4b', BOR: '#c92d4b',
    BEA: '#b6babd',
  },
  '2024': {
    VER: '#3671c6', PER: '#3671c6',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000',
    HAM: '#00d2be', RUS: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', OCO: '#0093cc',
    TSU: '#6692ff', RIC: '#6692ff',
    ALB: '#005aff', SAR: '#005aff',
    MAG: '#b6babd', HUL: '#b6babd',
    ZHO: '#c92d4b', BOT: '#c92d4b',
  },
  '2023': {
    VER: '#3671c6', PER: '#3671c6',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', PIA: '#ff8000',
    HAM: '#00d2be', RUS: '#00d2be',
    ALO: '#52e252', STR: '#52e252',
    GAS: '#0093cc', OCO: '#0093cc',
    TSU: '#6692ff', DEV: '#6692ff',
    ALB: '#005aff', SAR: '#005aff',
    MAG: '#b6babd', HUL: '#b6babd',
    ZHO: '#c92d4b', BOT: '#c92d4b',
  },
  '2022': {
    VER: '#3671c6', PER: '#3671c6',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', RIC: '#ff8000',
    HAM: '#00d2be', RUS: '#00d2be',
    ALO: '#0093cc', OCO: '#0093cc',
    VET: '#52e252', STR: '#52e252',
    GAS: '#6692ff', TSU: '#6692ff',
    ALB: '#005aff', LAT: '#005aff',
    MAG: '#b6babd', MSC: '#b6babd',
    ZHO: '#c92d4b', BOT: '#c92d4b',
  },
  '2021': {
    VER: '#3671c6', PER: '#3671c6',
    HAM: '#00d2be', BOT: '#00d2be',
    LEC: '#e8002d', SAI: '#e8002d',
    NOR: '#ff8000', RIC: '#ff8000',
    GAS: '#0093cc', ALO: '#0093cc',
    VET: '#52e252', STR: '#52e252',
    TSU: '#6692ff', HAR: '#6692ff',
    RUS: '#005aff', LAT: '#005aff',
    MAZ: '#c92d4b', RAI: '#c92d4b',
    MAG: '#b6babd', SCH: '#b6babd',
  },
  '2020': {
    HAM: '#00d2be', BOT: '#00d2be',
    VER: '#3671c6', ALB: '#3671c6',
    LEC: '#e8002d', VET: '#e8002d',
    NOR: '#ff8000', SAI: '#ff8000',
    PER: '#c92d4b', STR: '#c92d4b',
    OCO: '#0093cc', RIC: '#0093cc',
    GAS: '#6692ff', KVY: '#6692ff',
    GRO: '#b6babd', MAG: '#b6babd',
    RAI: '#c92d4b', GIO: '#c92d4b',
    RUS: '#005aff', LAT: '#005aff',
  },
}

function getDriverColor(code, year) {
  const colors = DRIVER_COLORS_BY_YEAR[String(year)] || DRIVER_COLORS_BY_YEAR['2024']
  return colors[code] || '#888'
}

export default function Standings() {
  const [year, setYear] = useState('2026')
  const [tab, setTab] = useState('drivers')
  const [drivers, setDrivers] = useState(null)
  const [teams, setTeams] = useState(null)
  const [loading, setLoading] = useState(false)

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
      setTeams(tr.data)
    } catch(e) { console.error(e) }
    setLoading(false)
  }

  const maxDriverPoints = drivers?.standings?.[0]?.points || 1
  const maxTeamPoints = teams?.standings?.[0]?.points || 1

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', padding: '20px 16px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
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
        {loading && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', border: '2.5px solid #1e1e1e', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
            <div style={{ fontSize: '13px', color: '#555' }}>Loading standings...</div>
          </div>
        )}

        {/* Driver Standings */}
        {!loading && tab === 'drivers' && drivers?.standings && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {drivers.standings.map((d, i) => {
              const color = getDriverColor(d.code, year)
              const pct = (d.points / maxDriverPoints * 100).toFixed(1)
              return (
                <div key={i} className="s-row standings-row-driver" style={{
                  background: i === 0 ? 'rgba(225,6,0,0.05)' : '#111',
                  border: `0.5px solid ${i === 0 ? 'rgba(225,6,0,0.2)' : '#1e1e1e'}`,
                  borderRadius: '10px', padding: '12px 14px',
                  display: 'grid',
                  gridTemplateColumns: '36px 44px 1fr auto auto',
                  alignItems: 'center', gap: '12px',
                  animation: `fadeUp .3s ease ${i * 0.03}s both`,
                  cursor: 'default'
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