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
  DOO: '🇦🇺', HAR: '🇳🇿', MAZ: '🇷🇺', SCH: '🇩🇪',
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

function StatPill({ label, value, color }) {
  return (
    <div style={{ textAlign: 'center', flex: 1 }}>
      <div style={{ fontSize: '18px', fontWeight: '800', color: color || '#fff' }}>{value}</div>
      <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{label}</div>
    </div>
  )
}

function DriverCard({ driver, year, color, team, isSelected, onSelect }) {
  const [hovered, setHovered] = useState(false)
  const active = isSelected || hovered

  return (
    <div
      onClick={() => onSelect(driver.code)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        background: isSelected ? `${color}10` : '#111',
        border: `0.5px solid ${active ? color + '66' : '#1e1e1e'}`,
        borderRadius: '14px', padding: '20px',
        cursor: 'pointer', transition: 'all .25s',
        transform: isSelected ? 'scale(1.02)' : 'scale(1)',
        position: 'relative', overflow: 'hidden',
      }}
    >
      {/* Top color bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: color, opacity: active ? 1 : 0.4, transition: 'opacity .25s' }}></div>

      {/* Big number watermark */}
      <div style={{ position: 'absolute', bottom: '-10px', right: '10px', fontSize: '72px', fontWeight: '900', color: color, opacity: 0.05, userSelect: 'none', lineHeight: 1 }}>
        {driver.number}
      </div>

      {/* Flag + initials */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
        <div style={{
          width: '52px', height: '52px', borderRadius: '50%',
          background: color + '20', border: `2px solid ${color}`,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '14px', fontWeight: '900', color: color,
        }}>{driver.initials}</div>
        <div style={{ fontSize: '22px' }}>{DRIVER_NATIONALITIES[driver.code] || '🏁'}</div>
      </div>

      {/* Name */}
      <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '3px', lineHeight: 1.2 }}>
        {driver.name}
      </div>

      {/* Team */}
      <div style={{ fontSize: '11px', color: color, marginBottom: '12px' }}>{team}</div>

      {/* Number tag */}
      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', background: color + '15', border: `0.5px solid ${color}33`, padding: '3px 8px', borderRadius: '6px' }}>
        <span style={{ fontSize: '10px', color: color, fontWeight: '700' }}>#{driver.number}</span>
      </div>

      {/* Selected indicator */}
      {isSelected && (
        <div style={{ position: 'absolute', top: '10px', right: '10px', width: '8px', height: '8px', borderRadius: '50%', background: color, boxShadow: `0 0 8px ${color}` }}></div>
      )}
    </div>
  )
}

function DriverProfile({ driverCode, year, color, team, driverInfo }) {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    if (!driverCode) return
    setLoading(true)
    setStats(null)
    const driverId = CODE_TO_ID[driverCode] || driverCode.toLowerCase()
    axios.get(`${API}/driver/stats?year=${year}&driver=${driverId}`)
      .then(r => { setStats(r.data); setLoading(false) })
      .catch(() => setLoading(false))
  }, [driverCode, year])

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', background: '#111', borderRadius: '16px', border: '0.5px solid #1e1e1e' }}>
      <div style={{ width: '28px', height: '28px', border: '2.5px solid #1e1e1e', borderTopColor: color, borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
    </div>
  )

  if (!stats || stats.error) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '60px', background: '#111', borderRadius: '16px', border: '0.5px solid #1e1e1e' }}>
      <div style={{ fontSize: '13px', color: '#444' }}>No data available for {driverCode} in {year}</div>
    </div>
  )

  return (
    <div style={{ background: '#111', border: `0.5px solid ${color}33`, borderRadius: '16px', overflow: 'hidden', animation: 'fadeUp .3s ease both' }}>
      {/* Header */}
      <div style={{ position: 'relative', padding: '28px', background: `linear-gradient(135deg, ${color}12, transparent)`, borderBottom: '0.5px solid #1a1a1a', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: `linear-gradient(90deg, ${color}, ${color}44)` }}></div>
        <div style={{ position: 'absolute', right: '-10px', top: '50%', transform: 'translateY(-50%)', fontSize: '140px', fontWeight: '900', color: color, opacity: 0.05, userSelect: 'none', lineHeight: 1 }}>
          {driverInfo?.number}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px', flexWrap: 'wrap', position: 'relative' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: color + '20', border: `2.5px solid ${color}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '22px', fontWeight: '900', color: color, flexShrink: 0,
            boxShadow: `0 0 24px ${color}33`
          }}>{driverInfo?.initials}</div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{ fontSize: '28px', fontWeight: '900', letterSpacing: '-1px' }}>{driverInfo?.name}</div>
              <div style={{ fontSize: '28px' }}>{DRIVER_NATIONALITIES[driverCode] || '🏁'}</div>
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <div style={{ fontSize: '12px', color: color, background: color + '15', border: `0.5px solid ${color}33`, padding: '4px 12px', borderRadius: '8px', fontWeight: '600' }}>{team}</div>
              <div style={{ fontSize: '12px', color: '#555', background: '#1a1a1a', padding: '4px 12px', borderRadius: '8px' }}>#{driverInfo?.number}</div>
              <div style={{ fontSize: '12px', color: '#555', background: '#1a1a1a', padding: '4px 12px', borderRadius: '8px' }}>{year} season</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '1px', background: '#1a1a1a', borderBottom: '0.5px solid #1a1a1a' }}>
        {[
          { label: 'Points', value: Math.round(stats.points), highlight: true },
          { label: 'Wins', value: stats.wins },
          { label: 'Podiums', value: stats.podiums },
          { label: 'Poles', value: stats.poles },
          { label: 'Races', value: stats.races },
          { label: 'Best finish', value: stats.bestFinish ? `P${stats.bestFinish}` : '—' },
          { label: 'DNFs', value: stats.dnfs },
          { label: 'Avg finish', value: stats.avgFinish ? `P${stats.avgFinish}` : '—' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#111', padding: '16px', textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: s.highlight ? color : '#fff' }}>{s.value}</div>
            <div style={{ fontSize: '10px', color: '#444', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Race results */}
      {stats.race_results && stats.race_results.length > 0 && (
        <div style={{ padding: '20px' }}>
          <div style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '14px' }}>
            Race by race — {year}
          </div>

          {/* Visual bar chart */}
          <div style={{ display: 'flex', gap: '3px', alignItems: 'flex-end', height: '60px', marginBottom: '16px', overflowX: 'auto', paddingBottom: '4px' }}>
            {stats.race_results.map((r, i) => {
              const height = Math.max(((21 - r.position) / 20) * 60, 4)
              const isWin = r.position === 1
              return (
                <div key={i} title={`${r.race}: P${r.position}`} style={{ flex: '0 0 auto', width: '20px', height: `${height}px`, background: isWin ? '#f5c842' : color, borderRadius: '3px 3px 0 0', opacity: r.position <= 10 ? 1 : 0.35, transition: 'opacity .2s', cursor: 'default' }}></div>
              )
            })}
          </div>

          {/* Results list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', maxHeight: '280px', overflowY: 'auto' }}>
            {stats.race_results.map((r, i) => {
              const isWin = r.position === 1
              const isPodium = r.position <= 3
              return (
                <div key={i}
                  onClick={() => navigate(`/replay?year=${year}&gp=${encodeURIComponent(r.race + ' Grand Prix')}`)}
                  style={{
                    display: 'grid', gridTemplateColumns: '36px 1fr auto auto',
                    alignItems: 'center', gap: '10px',
                    padding: '8px 10px', borderRadius: '8px',
                    background: isWin ? 'rgba(245,200,66,0.06)' : 'transparent',
                    cursor: 'pointer', transition: 'background .15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = isWin ? 'rgba(245,200,66,0.06)' : 'transparent'}
                >
                  <div style={{ fontSize: '13px', fontWeight: '800', color: isWin ? '#f5c842' : isPodium ? color : '#555', textAlign: 'center' }}>
                    P{r.position}
                  </div>
                  <div style={{ fontSize: '12px', color: '#aaa' }}>{r.race}</div>
                  <div style={{ fontSize: '11px', color: r.points > 0 ? color : '#333' }}>
                    {r.points > 0 ? `+${r.points}pts` : '—'}
                  </div>
                  <div style={{ fontSize: '10px', color: '#333' }}>→</div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ padding: '0 20px 20px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <button onClick={() => navigate(`/h2h`)} style={{
          flex: 1, background: color + '15', border: `0.5px solid ${color}33`,
          color: color, padding: '10px', borderRadius: '8px',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = color + '25'}
          onMouseLeave={e => e.currentTarget.style.background = color + '15'}
        >⚔️ Compare in H2H</button>
        <button onClick={() => navigate(`/standings?year=${year}`)} style={{
          flex: 1, background: '#1a1a1a', border: '0.5px solid #2a2a2a',
          color: '#aaa', padding: '10px', borderRadius: '8px',
          fontSize: '12px', fontWeight: '700', cursor: 'pointer', transition: 'all .2s'
        }}
          onMouseEnter={e => e.currentTarget.style.background = '#222'}
          onMouseLeave={e => e.currentTarget.style.background = '#1a1a1a'}
        >📊 Championship</button>
      </div>
    </div>
  )
}

export default function Drivers() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [year, setYear] = useState('2026')
  const [selectedCode, setSelectedCode] = useState(searchParams.get('driver')?.toUpperCase() || null)

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
  const selectedColor = selectedCode ? (colors[selectedCode] || '#888') : '#888'
  const selectedTeam = selectedCode ? (teams[selectedCode] || 'Unknown') : ''

  function handleSelect(code) {
    if (selectedCode === code) {
      setSelectedCode(null)
    } else {
      setSelectedCode(code)
      setTimeout(() => {
        document.getElementById('driver-profile-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', padding: '20px 16px' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(16px); } to { opacity:1; transform:translateY(0); } }
        @keyframes spin { to { transform: rotate(360deg) } }
      `}</style>

      <div style={{ maxWidth: '1100px', margin: '0 auto' }}>

        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '28px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>Drivers</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '3px' }}>Click any driver to see their full season profile</div>
          </div>
          <select value={year} onChange={e => { setYear(e.target.value); setSelectedCode(null) }} style={{
            background: '#111', border: '0.5px solid #333', borderRadius: '8px',
            color: '#fff', padding: '8px 14px', fontSize: '13px', cursor: 'pointer'
          }}>
            {['2026','2025','2024','2023','2022','2021','2020'].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: selectedCode ? '1fr 400px' : '1fr', gap: '20px', alignItems: 'start' }}>

          {/* Driver grid */}
          <div>
            {Object.entries(teamGroups).map(([team, teamDrivers], ti) => (
              <div key={team} style={{ marginBottom: '28px' }}>
                <div style={{ fontSize: '11px', color: '#333', textTransform: 'uppercase', letterSpacing: '1.5px', marginBottom: '12px', fontWeight: '600' }}>
                  {team}
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px' }}>
                  {teamDrivers.map(d => (
                    <DriverCard
                      key={d.code}
                      driver={d}
                      year={year}
                      color={colors[d.code] || '#888'}
                      team={team}
                      isSelected={selectedCode === d.code}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Profile panel */}
          {selectedCode && selectedDriver && (
            <div id="driver-profile-panel" style={{ position: 'sticky', top: '72px', animation: 'fadeUp .3s ease both' }}>
              <DriverProfile
                driverCode={selectedCode}
                year={year}
                color={selectedColor}
                team={selectedTeam}
                driverInfo={selectedDriver}
              />
            </div>
          )}
        </div>

        {/* Empty state */}
        {!selectedCode && (
          <div style={{ textAlign: 'center', padding: '20px', color: '#333', fontSize: '13px', marginTop: '8px' }}>
            ↑ Select a driver to view their full {year} season profile
          </div>
        )}
      </div>
    </div>
  )
}