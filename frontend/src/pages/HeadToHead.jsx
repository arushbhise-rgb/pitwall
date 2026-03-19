import { useState } from 'react'

const DRIVERS = {
  VER: { name: 'Max Verstappen', short: 'Verstappen', team: 'Red Bull Racing', number: 1, color: '#3671c6', initials: 'MV', stats: { points: 575, wins: 19, podiums: 21, poles: 12, fastestLaps: 9, avgFinish: 2.1, dnfs: 1 } },
  LEC: { name: 'Charles Leclerc', short: 'Leclerc', team: 'Ferrari', number: 16, color: '#e8002d', initials: 'CL', stats: { points: 307, wins: 3, podiums: 11, poles: 8, fastestLaps: 4, avgFinish: 4.8, dnfs: 3 } },
  NOR: { name: 'Lando Norris', short: 'Norris', team: 'McLaren', number: 4, color: '#ff8000', initials: 'LN', stats: { points: 356, wins: 4, podiums: 15, poles: 5, fastestLaps: 7, avgFinish: 3.9, dnfs: 2 } },
  HAM: { name: 'Lewis Hamilton', short: 'Hamilton', team: 'Mercedes', number: 44, color: '#00d2be', initials: 'LH', stats: { points: 221, wins: 0, podiums: 8, poles: 1, fastestLaps: 3, avgFinish: 5.2, dnfs: 2 } },
  ALO: { name: 'Fernando Alonso', short: 'Alonso', team: 'Aston Martin', number: 14, color: '#52e252', initials: 'FA', stats: { points: 70, wins: 0, podiums: 2, poles: 0, fastestLaps: 1, avgFinish: 7.4, dnfs: 4 } },
  SAI: { name: 'Carlos Sainz', short: 'Sainz', team: 'Ferrari', number: 55, color: '#c92d4b', initials: 'CS', stats: { points: 290, wins: 2, podiums: 10, poles: 4, fastestLaps: 5, avgFinish: 5.1, dnfs: 2 } },
  PIA: { name: 'Oscar Piastri', short: 'Piastri', team: 'McLaren', number: 81, color: '#ff8000', initials: 'OP', stats: { points: 292, wins: 2, podiums: 12, poles: 2, fastestLaps: 4, avgFinish: 4.4, dnfs: 1 } },
  RUS: { name: 'George Russell', short: 'Russell', team: 'Mercedes', number: 63, color: '#00d2be', initials: 'GR', stats: { points: 235, wins: 1, podiums: 7, poles: 2, fastestLaps: 2, avgFinish: 5.8, dnfs: 3 } },
}

const RACE_RESULTS = {
  VER: [1,1,1,1,1,2,1,1,1,1,1,1,3,1,1,1,2,1,1,1,1,1,1,1],
  LEC: [2,4,2,2,3,1,2,3,2,4,3,2,1,3,2,3,4,3,2,4,3,5,2,3],
  NOR: [3,2,4,3,2,3,3,2,3,2,2,3,2,2,4,2,3,2,3,3,2,2,3,2],
  HAM: [5,3,6,5,5,4,5,5,5,5,5,4,5,5,5,5,5,5,5,5,5,4,5,5],
  ALO: [6,6,7,7,7,7,8,8,7,8,8,7,8,8,7,8,7,8,8,8,8,8,8,8],
  SAI: [4,5,3,4,4,5,4,4,4,3,4,5,4,4,3,4,6,4,4,2,4,3,4,4],
  PIA: [7,7,5,6,6,6,6,6,6,6,6,6,6,6,6,6,4,6,6,6,6,6,6,6],
  RUS: [8,8,8,8,8,8,7,7,8,7,7,8,7,7,8,7,8,7,7,7,7,7,7,7],
}

const CIRCUITS = ['Bahrain','Saudi','Australia','Japan','China','Miami','Imola','Monaco','Canada','Spain','Austria','Britain','Hungary','Belgium','Netherlands','Italy','Azerbaijan','Singapore','COTA','Mexico','Brazil','Vegas','Qatar','Abu Dhabi']

export default function HeadToHead() {
  const [d1Code, setD1Code] = useState('VER')
  const [d2Code, setD2Code] = useState('LEC')
  const [compared, setCompared] = useState(false)

  const d1 = DRIVERS[d1Code]
  const d2 = DRIVERS[d2Code]

  function countH2H() {
    const r1 = RACE_RESULTS[d1Code], r2 = RACE_RESULTS[d2Code]
    let w1 = 0, w2 = 0
    for (let i = 0; i < Math.min(r1.length, r2.length); i++) {
      if (r1[i] < r2[i]) w1++; else if (r2[i] < r1[i]) w2++
    }
    return { w1, w2 }
  }

  const h2h = countH2H()
  const winner = h2h.w1 >= h2h.w2 ? d1 : d2
  const winnerCode = h2h.w1 >= h2h.w2 ? d1Code : d2Code

  const stats = [
    { label: 'Championship points', v1: d1.stats.points, v2: d2.stats.points, higher: true },
    { label: 'Race wins', v1: d1.stats.wins, v2: d2.stats.wins, higher: true },
    { label: 'Podiums', v1: d1.stats.podiums, v2: d2.stats.podiums, higher: true },
    { label: 'Pole positions', v1: d1.stats.poles, v2: d2.stats.poles, higher: true },
    { label: 'Avg finish', v1: d1.stats.avgFinish, v2: d2.stats.avgFinish, higher: false, fmt: v => `P${v.toFixed(1)}` },
    { label: 'Fastest laps', v1: d1.stats.fastestLaps, v2: d2.stats.fastestLaps, higher: true },
    { label: 'DNFs', v1: d1.stats.dnfs, v2: d2.stats.dnfs, higher: false },
  ]

  const s = (style) => style

  return (
    <div style={{ padding: '24px', maxWidth: '900px', margin: '0 auto' }}>
      <div style={{ fontSize: '20px', fontWeight: '700', marginBottom: '4px' }}>Head to Head</div>
      <div style={{ fontSize: '13px', color: '#666', marginBottom: '24px' }}>2024 season · compare any two drivers</div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '16px', alignItems: 'center', marginBottom: '28px' }}>
        <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Driver 1</div>
          <select value={d1Code} onChange={e => { setD1Code(e.target.value); setCompared(false) }}
            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px', marginBottom: '12px' }}>
            {Object.entries(DRIVERS).map(([code, d]) => <option key={code} value={code}>{d.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: d1.color + '22', border: `2px solid ${d1.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: d1.color, flexShrink: 0
            }}>{d1.initials}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d1.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{d1.team}</div>
              <div style={{ fontSize: '11px', color: d1.color, marginTop: '2px' }}>#{d1.number}</div>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: '#e10600', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800' }}>VS</div>
          <button onClick={() => setCompared(true)} style={{
            background: '#e10600', color: '#fff', border: 'none',
            padding: '8px 18px', borderRadius: '8px', fontSize: '12px',
            fontWeight: '700', cursor: 'pointer', whiteSpace: 'nowrap'
          }}>Compare</button>
        </div>

        <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '16px' }}>
          <div style={{ fontSize: '10px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '10px' }}>Driver 2</div>
          <select value={d2Code} onChange={e => { setD2Code(e.target.value); setCompared(false) }}
            style={{ width: '100%', background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px', marginBottom: '12px' }}>
            {Object.entries(DRIVERS).map(([code, d]) => <option key={code} value={code}>{d.name}</option>)}
          </select>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '52px', height: '52px', borderRadius: '50%',
              background: d2.color + '22', border: `2px solid ${d2.color}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', fontWeight: '800', color: d2.color, flexShrink: 0
            }}>{d2.initials}</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700' }}>{d2.name}</div>
              <div style={{ fontSize: '12px', color: '#666' }}>{d2.team}</div>
              <div style={{ fontSize: '11px', color: d2.color, marginTop: '2px' }}>#{d2.number}</div>
            </div>
          </div>
        </div>
      </div>

      {compared && (
        <>
          <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '16px' }}>Season battle — 2024</div>
            {stats.map((stat, i) => {
              const w = stat.higher ? (stat.v1 > stat.v2 ? 'left' : stat.v1 < stat.v2 ? 'right' : 'tie') : (stat.v1 < stat.v2 ? 'left' : stat.v1 > stat.v2 ? 'right' : 'tie')
              const total = stat.v1 + stat.v2 || 1
              const pct1 = stat.higher ? (stat.v1 / total * 100).toFixed(0) : (1 - stat.v1 / total) * 100
              const pct2 = 100 - pct1
              const fmt = stat.fmt || (v => v)
              return (
                <div key={i} style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '12px', alignItems: 'center', marginBottom: '14px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', alignItems: 'flex-end' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: w === 'left' ? d1.color : '#666' }}>{fmt(stat.v1)}</div>
                    <div style={{ width: '100%', height: '5px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden', direction: 'rtl' }}>
                      <div style={{ width: `${pct1}%`, height: '100%', background: d1.color, borderRadius: '3px', transition: 'width .6s ease' }}></div>
                    </div>
                  </div>
                  <div style={{ fontSize: '11px', color: '#555', textAlign: 'center', whiteSpace: 'nowrap', minWidth: '120px' }}>{stat.label}</div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                    <div style={{ fontSize: '14px', fontWeight: '700', color: w === 'right' ? d2.color : '#666' }}>{fmt(stat.v2)}</div>
                    <div style={{ width: '100%', height: '5px', background: '#1a1a1a', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ width: `${pct2}%`, height: '100%', background: d2.color, borderRadius: '3px', transition: 'width .6s ease' }}></div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>

          <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px', marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '14px' }}>Race by race — finishing positions</div>
            <div style={{ display: 'flex', gap: '2px', alignItems: 'flex-end', height: '80px' }}>
              {CIRCUITS.map((circuit, i) => {
                const r1 = RACE_RESULTS[d1Code][i]
                const r2 = RACE_RESULTS[d2Code][i]
                const d1won = r1 < r2
                return (
                  <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2px', alignItems: 'center' }} title={`${circuit}: ${d1Code} P${r1} vs ${d2Code} P${r2}`}>
                    <div style={{ width: '100%', height: '36px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', gap: '1px' }}>
                      <div style={{ width: '100%', height: `${(1 - r1/20) * 30 + 4}px`, background: d1.color, borderRadius: '1px', opacity: d1won ? 1 : 0.4 }}></div>
                      <div style={{ width: '100%', height: `${(1 - r2/20) * 30 + 4}px`, background: d2.color, borderRadius: '1px', opacity: !d1won ? 1 : 0.4 }}></div>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: d1.color }}></div>{d1.short} ({h2h.w1} wins)
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '11px', color: '#666' }}>
                <div style={{ width: '12px', height: '4px', borderRadius: '2px', background: d2.color }}></div>{d2.short} ({h2h.w2} wins)
              </div>
            </div>
          </div>

          <div style={{
            background: 'linear-gradient(135deg, #1a0000, #0a0a0a)',
            border: `0.5px solid ${winner.color}`,
            borderRadius: '12px', padding: '24px', textAlign: 'center'
          }}>
            <div style={{ fontSize: '10px', color: winner.color, textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '8px' }}>2024 head to head winner</div>
            <div style={{ fontSize: '26px', fontWeight: '800', color: winner.color, marginBottom: '4px' }}>{winner.name}</div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '16px', margin: '14px 0' }}>
              <div style={{ fontSize: '36px', fontWeight: '800', color: d1.color }}>{h2h.w1}</div>
              <div style={{ fontSize: '20px', color: '#333' }}>—</div>
              <div style={{ fontSize: '36px', fontWeight: '800', color: d2.color }}>{h2h.w2}</div>
            </div>
            <div style={{ fontSize: '13px', color: '#666', lineHeight: '1.6' }}>
              {winner.short} won <strong style={{ color: winner.color }}>{Math.max(h2h.w1, h2h.w2)} of {CIRCUITS.length} head to head battles</strong> and outscored {(winnerCode === d1Code ? d2 : d1).short} by <strong style={{ color: winner.color }}>{Math.abs(d1.stats.points - d2.stats.points)} championship points</strong>
            </div>
          </div>
        </>
      )}
    </div>
  )
}