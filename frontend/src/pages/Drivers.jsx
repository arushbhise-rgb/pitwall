import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'
import { API } from '../config'
import { DRIVER_COLORS_BY_YEAR, DRIVER_TEAMS_BY_YEAR, ALL_DRIVERS_BY_YEAR } from '../constants/driverData'

const DRIVER_NATIONALITIES = {
  VER: '🇳🇱', HAD: '🇫🇷', LEC: '🇲🇨', HAM: '🇬🇧', NOR: '🇬🇧',
  PIA: '🇦🇺', RUS: '🇬🇧', ANT: '🇮🇹', ALO: '🇪🇸', STR: '🇨🇦',
  GAS: '🇫🇷', COL: '🇦🇷', LAW: '🇳🇿', LIN: '🇬🇧', ALB: '🇹🇭',
  SAI: '🇪🇸', OCO: '🇫🇷', BEA: '🇬🇧', HUL: '🇩🇪', BOR: '🇧🇷',
  PER: '🇲🇽', BOT: '🇫🇮', TSU: '🇯🇵', RIC: '🇦🇺', SAR: '🇺🇸',
  MAG: '🇩🇰', ZHO: '🇨🇳', DEV: '🇳🇱', MSC: '🇩🇪', LAT: '🇨🇦',
  VET: '🇩🇪', RAI: '🇫🇮', GIO: '🇮🇹', KVY: '🇷🇺', GRO: '🇫🇷',
  DOO: '🇦🇺',
}

const CODE_TO_ID = {
  VER: 'max_verstappen', HAM: 'hamilton', LEC: 'leclerc',
  NOR: 'norris', PIA: 'piastri', RUS: 'russell',
  ANT: 'antonelli', SAI: 'sainz', ALO: 'alonso',
  STR: 'stroll', GAS: 'gasly', COL: 'colapinto',
  LAW: 'lawson', LIN: 'lindblad', ALB: 'albon',
  HAD: 'hadjar', OCO: 'ocon', BEA: 'bearman',
  HUL: 'hulkenberg', BOR: 'bortoleto', PER: 'perez',
  BOT: 'bottas', TSU: 'tsunoda', RIC: 'ricciardo',
  SAR: 'sargeant', MAG: 'kevin_magnussen', ZHO: 'zhou',
  DEV: 'de_vries', MSC: 'mick_schumacher', LAT: 'latifi',
  VET: 'vettel', RAI: 'raikkonen', GIO: 'giovinazzi',
  KVY: 'kvyat', GRO: 'grosjean', DOO: 'doohan',
}

export default function Drivers() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const [year, setYear] = useState(searchParams.get('year') || '2026')
  const [selectedCode, setSelectedCode] = useState(searchParams.get('driver')?.toUpperCase() || null)
  const [stats, setStats] = useState(null)
  const [statsLoading, setStatsLoading] = useState(false)

  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2024']
  const colors = DRIVER_COLORS_BY_YEAR[year] || DRIVER_COLORS_BY_YEAR['2024']
  const teams = DRIVER_TEAMS_BY_YEAR[year] || DRIVER_TEAMS_BY_YEAR['2024']

  const teamGroups = {}
  drivers.forEach(d => {
    const team = teams[d.code] || 'Unknown'
    if (!teamGroups[team]) teamGroups[team] = []
    teamGroups[team].push(d)
  })

  const selectedDriver = drivers.find(d => d.code === selectedCode)
  const selectedColor = selectedCode ? (colors[selectedCode] || '#888') : '#e10600'
  const selectedTeam = selectedCode ? (teams[selectedCode] || 'Unknown') : ''

  useEffect(() => {
    if (!selectedCode) return
    setStatsLoading(true)
    setStats(null)
    const driverId = CODE_TO_ID[selectedCode] || selectedCode.toLowerCase()
    axios.get(`${API}/driver/stats?year=${year}&driver=${driverId}`)
      .then(r => { setStats(r.data); setStatsLoading(false) })
      .catch(() => setStatsLoading(false))
  }, [selectedCode, year])

  function handleSelect(code) {
    setSelectedCode(prev => prev === code ? null : code)
    setStats(null)
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes shimmer { 0% { transform: translateX(-100%); } 100% { transform: translateX(100%); } }
        .driver-card { transition: all .25s cubic-bezier(0.16,1,0.3,1); }
        .driver-card:hover { transform: translateY(-4px) !important; }
      `}</style>

      {/* Hero header */}
      <div style={{
        background: 'linear-gradient(180deg, #111 0%, #0a0a0a 100%)',
        borderBottom: '0.5px solid #1a1a1a',
        padding: '32px 24px 28px',
        position: 'relative', overflow: 'hidden'
      }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 20% 50%, rgba(225,6,0,0.06), transparent 60%)', pointerEvents: 'none' }}></div>
        <div style={{ maxWidth: '1200px', margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
            <div>
              <div style={{ fontSize: '11px', color: '#e10600', textTransform: 'uppercase', letterSpacing: '2px', marginBottom: '8px', fontWeight: '600' }}>PitWall</div>
              <div style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', lineHeight: 1 }}>Driver Profiles</div>
              <div style={{ fontSize: '13px', color: '#555', marginTop: '8px' }}>
                {Object.keys(teamGroups).length} teams · {drivers.length} drivers · {year} season
              </div>
            </div>
            <select value={year} onChange={e => { setYear(e.target.value); setSelectedCode(null); setStats(null) }} style={{
              background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '10px',
              color: '#fff', padding: '10px 16px', fontSize: '14px', cursor: 'pointer',
              fontWeight: '600'
            }}>
              {['2026','2025','2024','2023','2022','2021','2020'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: selectedCode ? '1fr 420px' : '1fr', gap: '24px', alignItems: 'start' }}>

          {/* Driver grid */}
          <div>
            {Object.entries(teamGroups).map(([team, teamDrivers], ti) => {
              const teamColor = colors[teamDrivers[0]?.code] || '#888'
              return (
                <div key={team} style={{ marginBottom: '32px', animation: `fadeUp .4s ease ${ti * 0.06}s both` }}>
                  {/* Team header */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '14px' }}>
                    <div style={{ width: '4px', height: '20px', background: teamColor, borderRadius: '2px' }}></div>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: '#aaa', textTransform: 'uppercase', letterSpacing: '1.5px' }}>{team}</div>
                    <div style={{ flex: 1, height: '0.5px', background: '#1a1a1a' }}></div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: '12px' }}>
                    {teamDrivers.map(d => {
                      const color = colors[d.code] || '#888'
                      const isSelected = selectedCode === d.code
                      return (
                        <div key={d.code} className="driver-card" onClick={() => handleSelect(d.code)} style={{
                          background: isSelected
                            ? `linear-gradient(145deg, ${color}18, ${color}08)`
                            : 'linear-gradient(145deg, #161616, #111)',
                          border: `1px solid ${isSelected ? color + '66' : '#222'}`,
                          borderRadius: '16px', padding: '20px 18px',
                          cursor: 'pointer',
                          transform: isSelected ? 'translateY(-4px)' : 'translateY(0)',
                          boxShadow: isSelected ? `0 8px 32px ${color}22` : '0 2px 8px rgba(0,0,0,0.4)',
                          position: 'relative', overflow: 'hidden',
                        }}>
                          {/* Shimmer top bar */}
                          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, transparent, ${color}, transparent)`, opacity: isSelected ? 1 : 0.3, transition: 'opacity .3s' }}></div>

                          {/* Big number */}
                          <div style={{ position: 'absolute', bottom: '-8px', right: '8px', fontSize: '64px', fontWeight: '900', color: color, opacity: 0.06, userSelect: 'none', lineHeight: 1, transition: 'opacity .3s' }}>
                            {d.number}
                          </div>

                          {/* Top row — initials + flag */}
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
                            <div style={{
                              width: '48px', height: '48px', borderRadius: '50%',
                              background: `radial-gradient(circle, ${color}30, ${color}10)`,
                              border: `2px solid ${color}${isSelected ? 'cc' : '55'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '13px', fontWeight: '900', color: color,
                              transition: 'border-color .3s',
                              boxShadow: isSelected ? `0 0 16px ${color}44` : 'none',
                            }}>{d.initials}</div>
                            <div style={{ fontSize: '24px', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }}>
                              {DRIVER_NATIONALITIES[d.code] || '🏁'}
                            </div>
                          </div>

                          {/* Name */}
                          <div style={{ fontSize: '14px', fontWeight: '700', color: isSelected ? '#fff' : '#ccc', marginBottom: '4px', lineHeight: 1.2, transition: 'color .3s' }}>
                            {d.name.split(' ')[0]}
                          </div>
                          <div style={{ fontSize: '16px', fontWeight: '900', color: isSelected ? '#fff' : '#aaa', marginBottom: '12px', lineHeight: 1, transition: 'color .3s' }}>
                            {d.name.split(' ').slice(1).join(' ')}
                          </div>

                          {/* Number tag */}
                          <div style={{ display: 'inline-flex', alignItems: 'center', background: color + '18', border: `0.5px solid ${color}44`, padding: '3px 10px', borderRadius: '20px' }}>
                            <span style={{ fontSize: '11px', color: color, fontWeight: '800' }}>#{d.number}</span>
                          </div>

                          {/* Selected dot */}
                          {isSelected && (
                            <div style={{ position: 'absolute', top: '12px', right: '12px', width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 10px ${color}`, animation: 'pulse 2s infinite' }}></div>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>

          {/* Profile panel */}
          {selectedCode && selectedDriver && (
            <div style={{ position: 'sticky', top: '72px', animation: 'fadeUp .3s ease both' }}>
              <div style={{
                background: 'linear-gradient(145deg, #161616, #111)',
                border: `1px solid ${selectedColor}33`,
                borderRadius: '20px', overflow: 'hidden',
                boxShadow: `0 16px 48px ${selectedColor}15`
              }}>
                {/* Profile header */}
                <div style={{ position: 'relative', padding: '28px', background: `linear-gradient(135deg, ${selectedColor}15, transparent)`, borderBottom: '0.5px solid #1a1a1a', overflow: 'hidden' }}>
                  <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${selectedColor}, ${selectedColor}44, transparent)` }}></div>
                  <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', fontSize: '160px', fontWeight: '900', color: selectedColor, opacity: 0.04, userSelect: 'none', lineHeight: 1 }}>
                    {selectedDriver.number}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '18px', position: 'relative' }}>
                    <div style={{
                      width: '72px', height: '72px', borderRadius: '50%',
                      background: `radial-gradient(circle, ${selectedColor}30, ${selectedColor}10)`,
                      border: `2.5px solid ${selectedColor}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: '20px', fontWeight: '900', color: selectedColor,
                      boxShadow: `0 0 32px ${selectedColor}44`, flexShrink: 0
                    }}>{selectedDriver.initials}</div>

                    <div style={{ flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
                        <div style={{ fontSize: '22px', fontWeight: '900', letterSpacing: '-0.5px' }}>{selectedDriver.name}</div>
                        <div style={{ fontSize: '24px' }}>{DRIVER_NATIONALITIES[selectedCode] || '🏁'}</div>
                      </div>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <div style={{ fontSize: '11px', color: selectedColor, background: selectedColor + '18', border: `0.5px solid ${selectedColor}44`, padding: '3px 10px', borderRadius: '20px', fontWeight: '700' }}>{selectedTeam}</div>
                        <div style={{ fontSize: '11px', color: '#555', background: '#1a1a1a', padding: '3px 10px', borderRadius: '20px' }}>#{selectedDriver.number}</div>
                      </div>
                    </div>

                    <button onClick={() => setSelectedCode(null)} style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid #2a2a2a', color: '#555', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>×</button>
                  </div>
                </div>

                {/* Stats */}
                {statsLoading && (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px', gap: '12px' }}>
                    <div style={{ width: '24px', height: '24px', border: `2.5px solid ${selectedColor}33`, borderTopColor: selectedColor, borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
                    <div style={{ fontSize: '13px', color: '#444' }}>Loading {year} season data...</div>
                  </div>
                )}

                {stats && !statsLoading && !stats.error && (
                  <>
                    {/* Stats grid */}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#1a1a1a' }}>
                      {[
                        { label: 'Pts', value: Math.round(stats.points), highlight: true },
                        { label: 'Wins', value: stats.wins },
                        { label: 'Pods', value: stats.podiums },
                        { label: 'Poles', value: stats.poles },
                        { label: 'Races', value: stats.races },
                        { label: 'Best', value: stats.bestFinish ? `P${stats.bestFinish}` : '—' },
                        { label: 'DNFs', value: stats.dnfs },
                        { label: 'Avg', value: stats.avgFinish ? `P${stats.avgFinish}` : '—' },
                      ].map((s, i) => (
                        <div key={i} style={{ background: '#111', padding: '14px 10px', textAlign: 'center' }}>
                          <div style={{ fontSize: '20px', fontWeight: '900', color: s.highlight ? selectedColor : '#fff', letterSpacing: '-0.5px' }}>{s.value}</div>
                          <div style={{ fontSize: '9px', color: '#444', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '1px' }}>{s.label}</div>
                        </div>
                      ))}
                    </div>

                    {/* Bar chart of results */}
                    {stats.race_results?.length > 0 && (
                      <div style={{ padding: '20px' }}>
                        <div style={{ fontSize: '10px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>
                          Race results — {year}
                        </div>

                        <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '56px', marginBottom: '16px' }}>
                          {stats.race_results.map((r, i) => {
                            const h = Math.max(((21 - r.position) / 20) * 56, 3)
                            return (
                              <div key={i} title={`${r.race}: P${r.position}`} style={{
                                flex: 1, height: `${h}px`,
                                background: r.position === 1 ? '#f5c842' : r.position <= 3 ? selectedColor : selectedColor + '55',
                                borderRadius: '2px 2px 0 0',
                                minWidth: '6px', cursor: 'default',
                                transition: 'opacity .2s'
                              }}></div>
                            )
                          })}
                        </div>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', maxHeight: '240px', overflowY: 'auto' }}>
                          {stats.race_results.map((r, i) => (
                            <div key={i}
                              onClick={() => navigate(`/replay?year=${year}&gp=${encodeURIComponent(r.race + ' Grand Prix')}`)}
                              style={{
                                display: 'grid', gridTemplateColumns: '32px 1fr auto',
                                alignItems: 'center', gap: '10px',
                                padding: '7px 10px', borderRadius: '8px',
                                cursor: 'pointer', transition: 'background .15s',
                              }}
                              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.05)'}
                              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                            >
                              <div style={{ fontSize: '12px', fontWeight: '800', color: r.position === 1 ? '#f5c842' : r.position <= 3 ? selectedColor : '#555', textAlign: 'center' }}>
                                P{r.position}
                              </div>
                              <div style={{ fontSize: '12px', color: '#777' }}>{r.race}</div>
                              <div style={{ fontSize: '11px', color: r.points > 0 ? selectedColor : '#333' }}>
                                {r.points > 0 ? `+${r.points}` : '—'}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px' }}>
                      <button onClick={() => navigate(`/h2h`)} style={{
                        flex: 1, background: selectedColor + '18', border: `0.5px solid ${selectedColor}33`,
                        color: selectedColor, padding: '10px', borderRadius: '10px',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s'
                      }}
                        onMouseEnter={e => e.currentTarget.style.background = selectedColor + '30'}
                        onMouseLeave={e => e.currentTarget.style.background = selectedColor + '18'}
                      >⚔️ H2H Compare</button>
                      <button onClick={() => navigate(`/standings?year=${year}`)} style={{
                        flex: 1, background: '#1a1a1a', border: '0.5px solid #2a2a2a',
                        color: '#666', padding: '10px', borderRadius: '10px',
                        fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s'
                      }}
                        onMouseEnter={e => { e.currentTarget.style.background = '#222'; e.currentTarget.style.color = '#aaa' }}
                        onMouseLeave={e => { e.currentTarget.style.background = '#1a1a1a'; e.currentTarget.style.color = '#666' }}
                      >📊 Standings</button>
                    </div>
                  </>
                )}

                {stats?.error && !statsLoading && (
                  <div style={{ padding: '40px', textAlign: 'center', color: '#444', fontSize: '13px' }}>
                    No data for {selectedCode} in {year}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Empty state hint */}
        {!selectedCode && (
          <div style={{ textAlign: 'center', padding: '12px', color: '#2a2a2a', fontSize: '12px' }}>
            Click any driver card to view their full {year} season profile
          </div>
        )}
      </div>
    </div>
  )
}