import { useState } from 'react'
import axios from 'axios'

const API = 'https://pitwall-production-c292.up.railway.app'

const ALL_DRIVERS = [
  { code: 'VER', name: 'Max Verstappen', team: 'Red Bull', color: '#3671c6', initials: 'MV', number: 1 },
  { code: 'PER', name: 'Sergio Perez', team: 'Red Bull', color: '#3671c6', initials: 'SP', number: 11 },
  { code: 'LEC', name: 'Charles Leclerc', team: 'Ferrari', color: '#e8002d', initials: 'CL', number: 16 },
  { code: 'SAI', name: 'Carlos Sainz', team: 'Ferrari', color: '#e8002d', initials: 'CS', number: 55 },
  { code: 'NOR', name: 'Lando Norris', team: 'McLaren', color: '#ff8000', initials: 'LN', number: 4 },
  { code: 'PIA', name: 'Oscar Piastri', team: 'McLaren', color: '#ff8000', initials: 'OP', number: 81 },
  { code: 'HAM', name: 'Lewis Hamilton', team: 'Mercedes', color: '#00d2be', initials: 'LH', number: 44 },
  { code: 'RUS', name: 'George Russell', team: 'Mercedes', color: '#00d2be', initials: 'GR', number: 63 },
  { code: 'ALO', name: 'Fernando Alonso', team: 'Aston Martin', color: '#52e252', initials: 'FA', number: 14 },
  { code: 'STR', name: 'Lance Stroll', team: 'Aston Martin', color: '#52e252', initials: 'LS', number: 18 },
  { code: 'GAS', name: 'Pierre Gasly', team: 'Alpine', color: '#0093cc', initials: 'PG', number: 10 },
  { code: 'OCO', name: 'Esteban Ocon', team: 'Alpine', color: '#0093cc', initials: 'EO', number: 31 },
  { code: 'TSU', name: 'Yuki Tsunoda', team: 'RB', color: '#6692ff', initials: 'YT', number: 22 },
  { code: 'RIC', name: 'Daniel Ricciardo', team: 'RB', color: '#6692ff', initials: 'DR', number: 3 },
  { code: 'ALB', name: 'Alexander Albon', team: 'Williams', color: '#005aff', initials: 'AA', number: 23 },
  { code: 'SAR', name: 'Logan Sargeant', team: 'Williams', color: '#005aff', initials: 'LS', number: 2 },
  { code: 'MAG', name: 'Kevin Magnussen', team: 'Haas', color: '#b6babd', initials: 'KM', number: 20 },
  { code: 'HUL', name: 'Nico Hulkenberg', team: 'Haas', color: '#b6babd', initials: 'NH', number: 27 },
  { code: 'ZHO', name: 'Guanyu Zhou', team: 'Sauber', color: '#c92d4b', initials: 'GZ', number: 24 },
  { code: 'BOT', name: 'Valtteri Bottas', team: 'Sauber', color: '#c92d4b', initials: 'VB', number: 77 },
]

export default function HeadToHead() {
  const [year, setYear] = useState('2024')
  const [d1Code, setD1Code] = useState('VER')
  const [d2Code, setD2Code] = useState('LEC')
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(false)

  const d1 = ALL_DRIVERS.find(d => d.code === d1Code)
  const d2 = ALL_DRIVERS.find(d => d.code === d2Code)

  async function compare() {
    if (d1Code === d2Code) { alert('Pick two different drivers'); return }
    setLoading(true)
    setData(null)
    try {
      const r = await axios.get(`${API}/h2h?year=${year}&driver1=${d1Code}&driver2=${d2Code}`)
      setData(r.data)
    } catch(e) { alert('Error loading H2H data') }
    setLoading(false)
  }

  const cardStyle = { background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px' }

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Head to Head</div>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>Real F1 data — compare any two drivers</div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', alignItems: 'center' }}>
        <select value={year} onChange={e => { setYear(e.target.value); setData(null) }}
          style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px 12px', fontSize: '13px' }}>
          {['2024','2023','2022','2021','2020'].map(y => <option key={y}>{y}</option>)}
        </select>
        <div style={{ fontSize: '12px', color: '#555' }}>season</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '24px' }}>
        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Driver 1</div>
          <select value={d1Code} onChange={e => { setD1Code(e.target.value); setData(null) }}
            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px', marginBottom: '14px' }}>
            {ALL_DRIVERS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: d1.color + '22', border: `2px solid ${d1.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: d1.color }}>
              {d1.initials}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d1.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{d1.team}</div>
              <div style={{ fontSize: '11px', color: d1.color, marginTop: '2px' }}>#{d1.number}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e10600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800' }}>VS</div>
          <button onClick={compare} disabled={loading} style={{
            background: '#e10600', color: '#fff', border: 'none',
            padding: '8px 16px', borderRadius: '8px', fontSize: '12px',
            fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap',
            opacity: loading ? .6 : 1
          }}>{loading ? 'Loading...' : 'Compare'}</button>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Driver 2</div>
          <select value={d2Code} onChange={e => { setD2Code(e.target.value); setData(null) }}
            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px', marginBottom: '14px' }}>
            {ALL_DRIVERS.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '52px', height: '52px', borderRadius: '50%', background: d2.color + '22', border: `2px solid ${d2.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '16px', fontWeight: '800', color: d2.color }}>
              {d2.initials}
            </div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d2.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{d2.team}</div>
              <div style={{ fontSize: '11px', color: d2.color, marginTop: '2px' }}>#{d2.number}</div>
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: 'center', padding: '40px', color: '#666' }}>
          <div style={{ width: '32px', height: '32px', border: '2.5px solid #333', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite', margin: '0 auto 12px' }}></div>
          <div style={{ fontSize: '13px' }}>Loading real F1 data — this takes about a minute first time</div>
          <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
        </div>
      )}

      {data && (
        <>
          <div style={{ ...cardStyle, marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '16px' }}>Season battle — {year}</div>
            {[
              { label: 'Championship points', v1: data.stats[d1Code].points, v2: data.stats[d2Code].points, higher: true, fmt: v => Math.round(v) },
              { label: 'Race wins', v1: data.stats[d1Code].wins, v2: data.stats[d2Code].wins, higher: true },
              { label: 'Podiums', v1: data.stats[d1Code].podiums, v2: data.stats[d2Code].podiums, higher: true },
              { label: 'Pole positions', v1: data.stats[d1Code].poles, v2: data.stats[d2Code].poles, higher: true },
              { label: 'Avg finish', v1: data.stats[d1Code].avgFinish, v2: data.stats[d2Code].avgFinish, higher: false, fmt: v => `P${v}` },
              { label: 'DNFs', v1: data.stats[d1Code].dnfs, v2: data.stats[d2Code].dnfs, higher: false },
              { label: 'H2H race wins', v1: data.h2h_wins[d1Code], v2: data.h2h_wins[d2Code], higher: true },
            ].map((stat, i) => {
              const w = stat.higher ? (stat.v1 > stat.v2 ? 'left' : 'right') : (stat.v1 < stat.v2 ? 'left' : 'right')
              const total = stat.v1 + stat.v2 || 1
              const pct1 = stat.higher ? (stat.v1 / total * 100).toFixed(0) : ((1 - stat.v1 / total) * 100).toFixed(0)
              const fmt = stat.fmt || (v => v)
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: w === 'left' ? d1.color : '#666' }}>{fmt(stat.v1)}</div>
                    <div style={{ width: '100%', height: '5px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden', direction: 'rtl' }}>
                      <div style={{ width: `${pct1}%`, height: '100%', background: d1.color, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '130px' }}>{stat.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: w === 'right' ? d2.color : '#666' }}>{fmt(stat.v2)}</div>
                    <div style={{ width: '100%', height: '5px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${100 - pct1}%`, height: '100%', background: d2.color, borderRadius: '3px' }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ ...cardStyle, marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '14px' }}>Race by race — {year}</div>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '80px' }}>
              {data.race_names.map((race, i) => {
                const r1 = data.results[d1Code][i]
                const r2 = data.results[d2Code][i]
                const d1won = r1 < r2
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '1px', alignItems: 'center' }} title={`${race}: ${d1Code} P${r1} vs ${d2Code} P${r2}`}>
                    <div style={{ width: '100%', height: `${(1 - r1/20) * 34 + 4}px`, background: d1.color, borderRadius: '1px', opacity: d1won ? 1 : 0.35 }}></div>
                    <div style={{ width: '100%', height: `${(1 - r2/20) * 34 + 4}px`, background: d2.color, borderRadius: '1px', opacity: !d1won ? 1 : 0.35 }}></div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '14px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: d1.color }}></div>
                {d1.short || d1.name.split(' ')[1]} ({data.h2h_wins[d1Code]} wins)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: d2.color }}></div>
                {d2.short || d2.name.split(' ')[1]} ({data.h2h_wins[d2Code]} wins)
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a0000, #0a0a0a)',
            border: `0.5px solid ${data.h2h_wins[d1Code] >= data.h2h_wins[d2Code] ? d1.color : d2.color}`,
            borderRadius: '12px', padding: '24px', textAlign: 'center'
          }}>
            {(() => {
              const winnerCode = data.h2h_wins[d1Code] >= data.h2h_wins[d2Code] ? d1Code : d2Code
              const winner = ALL_DRIVERS.find(d => d.code === winnerCode)
              const loserCode = winnerCode === d1Code ? d2Code : d1Code
              const loser = ALL_DRIVERS.find(d => d.code === loserCode)
              return (
                <>
                  <div style={{ fontSize: '10px', color: winner.color, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>{year} head to head winner</div>
                  <div style={{ fontSize: '26px', fontWeight: '800', color: winner.color, marginBottom: '4px' }}>{winner.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '14px 0' }}>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: d1.color }}>{data.h2h_wins[d1Code]}</div>
                    <div style={{ fontSize: '20px', color: '#333' }}>—</div>
                    <div style={{ fontSize: '36px', fontWeight: '800', color: d2.color }}>{data.h2h_wins[d2Code]}</div>
                  </div>
                  <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
                    {winner.name} won <strong style={{ color: winner.color }}>{Math.max(data.h2h_wins[d1Code], data.h2h_wins[d2Code])} of {data.race_names.length} head to head battles</strong> in {year}
                  </div>
                </>
              )
            })()}
          </div>
        </>
      )}
    </div>
  )
}