import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import {
  Chart, LineElement, PointElement,
  LinearScale, CategoryScale, Tooltip, Legend
} from 'chart.js'
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const API = 'https://pitwall-production-c292.up.railway.app'

const DRIVER_COLORS = {
  VER: '#3671c6', PER: '#3671c6',
  LEC: '#e8002d', SAI: '#e8002d', BEA: '#e8002d',
  NOR: '#ff8000', PIA: '#ff8000',
  HAM: '#00d2be', RUS: '#00d2be',
  ALO: '#52e252', STR: '#52e252',
  GAS: '#0093cc', OCO: '#0093cc',
  TSU: '#6692ff', RIC: '#6692ff',
  ALB: '#005aff', SAR: '#005aff',
  MAG: '#b6babd', HUL: '#b6babd',
  ZHO: '#c92d4b', BOT: '#c92d4b',
}

const FALLBACK = ['#3671c6','#e8002d','#ff8000','#00d2be','#52e252','#c92d4b','#9b59b6','#f39c12']

function getDriverColor(code, index) {
  return DRIVER_COLORS[code] || FALLBACK[index % FALLBACK.length]
}

const TIRE_COLORS = {
  SOFT: '#e8002d', MEDIUM: '#f5c842',
  HARD: '#ccc', INTERMEDIATE: '#52e252', WET: '#3671c6'
}

export default function RaceReplay() {
  const RACES_2026 = ['Australian Grand Prix', 'Chinese Grand Prix']
  const RACES_2025 = ['Australian Grand Prix','Chinese Grand Prix','Japanese Grand Prix','Bahrain Grand Prix','Saudi Arabian Grand Prix','Miami Grand Prix','Emilia Romagna Grand Prix','Monaco Grand Prix','Spanish Grand Prix','Canadian Grand Prix','Austrian Grand Prix','British Grand Prix','Belgian Grand Prix','Hungarian Grand Prix','Dutch Grand Prix','Italian Grand Prix','Azerbaijan Grand Prix','Singapore Grand Prix','United States Grand Prix','Mexico City Grand Prix','São Paulo Grand Prix','Las Vegas Grand Prix','Qatar Grand Prix','Abu Dhabi Grand Prix']
  const RACES_2024 = ['Bahrain Grand Prix','Saudi Arabian Grand Prix','Australian Grand Prix','Japanese Grand Prix','Chinese Grand Prix','Miami Grand Prix','Emilia Romagna Grand Prix','Monaco Grand Prix','Canadian Grand Prix','Spanish Grand Prix','Austrian Grand Prix','British Grand Prix','Hungarian Grand Prix','Belgian Grand Prix','Dutch Grand Prix','Italian Grand Prix','Azerbaijan Grand Prix','Singapore Grand Prix','United States Grand Prix','Mexico City Grand Prix','São Paulo Grand Prix','Las Vegas Grand Prix','Qatar Grand Prix','Abu Dhabi Grand Prix']
  const RACES_2023 = ['Bahrain Grand Prix','Saudi Arabian Grand Prix','Australian Grand Prix','Azerbaijan Grand Prix','Miami Grand Prix','Monaco Grand Prix','Spanish Grand Prix','Canadian Grand Prix','Austrian Grand Prix','British Grand Prix','Hungarian Grand Prix','Belgian Grand Prix','Dutch Grand Prix','Italian Grand Prix','Singapore Grand Prix','Japanese Grand Prix','Qatar Grand Prix','United States Grand Prix','Mexico City Grand Prix','São Paulo Grand Prix','Las Vegas Grand Prix','Abu Dhabi Grand Prix']

  const FALLBACK_RACES = {
    '2026': RACES_2026,
    '2025': RACES_2025,
    '2024': RACES_2024,
    '2023': RACES_2023,
    '2022': RACES_2024,
    '2021': RACES_2023,
    '2020': RACES_2023,
    '2019': RACES_2023,
    '2018': RACES_2023,
  }
  const [year, setYear] = useState('2026')
  const [gp, setGp] = useState('')
  const [races, setRaces] = useState([])
  const [raceData, setRaceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [aiReply, setAiReply] = useState('')
  const [aiLoading, setAiLoading] = useState(false)
  const [selectedDrivers, setSelectedDrivers] = useState([])
  const [activeTab, setActiveTab] = useState('positions')

  useEffect(() => {
      const fallback = FALLBACK_RACES[year] || RACES_2024
      setRaces(fallback)
      setGp(fallback[0])
      axios.get(`${API}/races?year=${year}`)
        .then(r => {
          if (r.data.races && r.data.races.length > 0) {
            setRaces(r.data.races)
            setGp(r.data.races[0])
          }
        })
        .catch(() => {})
    }, [year])

  async function loadRace() {
    setLoading(true)
    setRaceData(null)
    setAiReply('')
    try {
      const r = await axios.get(`${API}/race?year=${year}&gp=${encodeURIComponent(gp)}`)
      setRaceData(r.data)
      setSelectedDrivers(r.data.drivers.slice(0, 6))
    } catch(e) { alert('Error loading race') }
    setLoading(false)
  }

  async function askAI() {
    if (!question || !raceData) return
    setAiLoading(true)

    const q = question.toLowerCase()

    // Handle position questions directly from data
    const lapMatch = q.match(/lap\s*(\d+)/)
    const posMatch = q.match(/p(\d+)|(\d+)(st|nd|rd|th)?\s*place|position\s*(\d+)/)

    if (lapMatch && posMatch) {
      const lapNum = parseInt(lapMatch[1])
      const posNum = parseInt(posMatch[1] || posMatch[2] || posMatch[4])

      if (lapNum >= 1 && lapNum <= raceData.total_laps) {
        const lapPositions = raceData.drivers.map(d => {
          const pos = raceData.position_data[d]?.[lapNum - 1]
          return pos && pos > 0 ? { driver: d, pos } : null
        }).filter(Boolean).sort((a, b) => a.pos - b.pos)

        const driverAtPos = lapPositions.find(x => x.pos === posNum)
        if (driverAtPos) {
          setAiReply(`On lap ${lapNum}, ${driverAtPos.driver} was in P${posNum}.\n\nFull order on lap ${lapNum}:\n${lapPositions.map(x => `P${x.pos}: ${x.driver}`).join('\n')}`)
          setAiLoading(false)
          return
        }
      }
    }

    // Handle "who won" questions directly
    if (q.includes('who won') || q.includes('race winner') || q.includes('finish first')) {
      const finalLap = raceData.total_laps
      const finalPositions = raceData.drivers.map(d => {
        const positions = raceData.position_data[d]
        const lastPos = positions ? [...positions].reverse().find(p => p > 0) : null
        return lastPos ? { driver: d, pos: lastPos } : null
      }).filter(Boolean).sort((a, b) => a.pos - b.pos)

      const top5 = finalPositions.slice(0, 5)
      setAiReply(`Race result — ${raceData.gp} ${raceData.year}:\n\n${top5.map(x => `P${x.pos}: ${x.driver}`).join('\n')}`)
      setAiLoading(false)
      return
    }

    // For everything else send to AI with full data
    const allLapPositions = []
    for (let lap = 1; lap <= raceData.total_laps; lap++) {
      const lapData = raceData.drivers.map(d => {
        const pos = raceData.position_data[d]?.[lap - 1]
        return pos && pos > 0 ? `${d}:P${pos}` : null
      }).filter(Boolean).sort((a, b) => {
        return parseInt(a.split(':P')[1]) - parseInt(b.split(':P')[1])
      })
      allLapPositions.push(`Lap ${lap}: ${lapData.join(' ')}`)
    }

    const summary = `
  Race: ${raceData.gp} Grand Prix ${raceData.year}
  Total laps: ${raceData.total_laps}
  Drivers: ${raceData.drivers.join(', ')}

  COMPLETE LAP BY LAP POSITIONS (use this data only, do not guess):
  ${allLapPositions.join('\n')}
    `.trim()

    try {
      const r = await axios.post(`${API}/analyze`, { race_summary: summary, question })
      setAiReply(r.data.response)
    } catch(e) { setAiReply('AI unavailable right now.') }
    setAiLoading(false)
  }

  function toggleDriver(d) {
    setSelectedDrivers(prev =>
      prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d]
    )
  }

  function getTireStints(driver) {
    if (!raceData || !raceData.tire_data[driver]) return []
    const tires = raceData.tire_data[driver]
    const stints = []
    let current = tires[0], start = 0
    for (let i = 1; i <= tires.length; i++) {
      if (tires[i] !== current || i === tires.length) {
        stints.push({ compound: current, start: start + 1, end: i })
        current = tires[i]
        start = i
      }
    }
    return stints
  }

  const laps = raceData ? Array.from({length: raceData.total_laps}, (_, i) => i + 1) : []
  const cardStyle = { background: '#111', border: '0.5px solid #222', borderRadius: '10px', padding: '16px' }

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)' }}>
      <div style={{
        width: '230px', background: '#111', borderRight: '0.5px solid #222',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px', flexShrink: 0
      }}>
        <div style={{ fontSize: '10px', color: '#555', letterSpacing: '.5px', textTransform: 'uppercase' }}>Race selector</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px' }}>
            {['2026','2025','2024','2023','2022','2021','2020','2019','2018'].map(y => <option key={y}>{y}</option>)}
          </select>
          <select value={gp} onChange={e => setGp(e.target.value)}
            style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px' }}>
            {races.map(r => <option key={r}>{r}</option>)}
          </select>
        </div>
        <button onClick={loadRace} disabled={loading} style={{
          background: '#e10600', color: '#fff', border: 'none',
          padding: '10px', borderRadius: '8px', fontSize: '13px',
          fontWeight: '600', cursor: 'pointer', opacity: loading ? .6 : 1
        }}>{loading ? 'Loading...' : 'Load race data'}</button>

        {raceData && (
          <>
            <div style={{ fontSize: '10px', color: '#555', letterSpacing: '.5px', textTransform: 'uppercase' }}>Drivers</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {raceData.drivers.map((d, i) => (
                <div key={d} onClick={() => toggleDriver(d)} style={{
                  display: 'flex', alignItems: 'center', gap: '8px',
                  padding: '5px 8px', borderRadius: '7px', cursor: 'pointer',
                  background: selectedDrivers.includes(d) ? '#1a1a1a' : 'transparent',
                  border: `0.5px solid ${selectedDrivers.includes(d) ? '#333' : 'transparent'}`,
                  opacity: selectedDrivers.includes(d) ? 1 : 0.4,
                  transition: 'all .12s'
                }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: getDriverColor(d, i), flexShrink: 0 }}></div>
                  <div style={{ fontSize: '12px', fontWeight: '500', color: '#fff', flex: 1 }}>{d}</div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px', overflow: 'auto' }}>
        {!raceData && !loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '32px' }}>🏎</div>
            <div style={{ fontSize: '14px', color: '#555' }}>Select a race and click Load race data</div>
          </div>
        )}

        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '12px' }}>
            <div style={{ width: '32px', height: '32px', border: '2.5px solid #333', borderTopColor: '#e10600', borderRadius: '50%', animation: 'spin .7s linear infinite' }}></div>
            <div style={{ fontSize: '13px', color: '#666' }}>Loading race data — first load takes ~30 seconds</div>
            <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
          </div>
        )}

        {raceData && (
          <>
            <div style={{ ...cardStyle, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600' }}>{raceData.gp} Grand Prix {raceData.year}</div>
                <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{raceData.total_laps} laps · {raceData.drivers.length} drivers</div>
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                {['positions','laptimes','tires','gap','sectors'].map(tab => (
                  <button key={tab} onClick={() => setActiveTab(tab)} style={{
                    background: activeTab === tab ? '#e10600' : '#1a1a1a',
                    color: '#fff', border: '0.5px solid #333',
                    padding: '5px 12px', borderRadius: '6px',
                    fontSize: '11px', cursor: 'pointer', textTransform: 'capitalize'
                  }}>{tab}</button>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px' }}>
              {[
                { val: (() => {
                    const drivers = raceData.drivers
                    let winner = drivers[0]
                    let bestPos = 999
                    for (const d of drivers) {
                      const positions = raceData.position_data[d]
                      if (positions && positions.length > 0) {
                        const lastPos = positions[positions.length - 1]
                        if (lastPos > 0 && lastPos < bestPos) {
                          bestPos = lastPos
                          winner = d
                        }
                      }
                    }
                    return winner
                  })(), lbl: 'Race winner', sub: 'P1 finisher' },
                { val: raceData.total_laps, lbl: 'Total laps', sub: 'Race distance' },
                { val: raceData.drivers.length, lbl: 'Drivers', sub: 'Started race' },
                { val: selectedDrivers.length, lbl: 'Shown', sub: 'Click to toggle' },
              ].map((s, i) => (
                <div key={i} style={{ background: '#1a1a1a', borderRadius: '8px', padding: '12px 14px' }}>
                  <div style={{ fontSize: '20px', fontWeight: '600' }}>{s.val}</div>
                  <div style={{ fontSize: '11px', color: '#888', marginTop: '2px' }}>{s.lbl}</div>
                  <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>{s.sub}</div>
                </div>
              ))}
            </div>

            {activeTab === 'positions' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>Position changes — every lap</div>
                <Line
                  data={{
                    labels: laps,
                    datasets: raceData.drivers.map((d, i) => ({
                      label: d,
                      data: raceData.position_data[d],
                      borderColor: getDriverColor(d, i),
                      backgroundColor: 'transparent',
                      borderWidth: selectedDrivers.includes(d) ? 2.5 : 0.5,
                      pointRadius: 0,
                      pointHoverRadius: 4,
                      tension: .3,
                      hidden: !selectedDrivers.includes(d)
                    }))
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 12, filter: (item) => selectedDrivers.includes(item.text) } },
                      tooltip: {
                          mode: 'index',
                          intersect: false,
                          callbacks: {
                            title: (items) => `Lap ${items[0].label}`,
                            label: (c) => `${c.dataset.label}: P${c.raw}`,
                            afterBody: () => '',
                          },
                          itemSort: (a, b) => a.raw - b.raw
                      }
                    },
                    scales: {
                      x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', maxTicksLimit: 12, font: { size: 10 } }, title: { display: true, text: 'Lap', color: '#555', font: { size: 10 } } },
                      y: { reverse: true, min: 1, max: 20, grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', stepSize: 2, font: { size: 10 } }, title: { display: true, text: 'Position', color: '#555', font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'laptimes' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>Lap times comparison</div>
                <Line
                  data={{
                    labels: laps,
                    datasets: raceData.drivers.map((d, i) => ({
                      label: d,
                      data: raceData.lap_time_data[d],
                      borderColor: getDriverColor(d, i),
                      backgroundColor: 'transparent',
                      borderWidth: selectedDrivers.includes(d) ? 1.8 : 0.5,
                      pointRadius: 0,
                      pointHoverRadius: 4,
                      tension: .25,
                      spanGaps: false,
                      hidden: !selectedDrivers.includes(d)
                    }))
                  }}
                  options={{
                    responsive: true,
                    plugins: {
                      legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 12, filter: (item) => selectedDrivers.includes(item.text) } },
                      tooltip: { mode: 'index', intersect: false, callbacks: { label: c => c.raw ? `${c.dataset.label}: ${c.raw.toFixed(3)}s` : null, filter: i => i.raw !== null } }
                    },
                    scales: {
                      x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', maxTicksLimit: 12, font: { size: 10 } } },
                      y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', font: { size: 10 }, callback: v => `${v.toFixed(1)}s` }, title: { display: true, text: 'Lap time (s)', color: '#555', font: { size: 10 } } }
                    }
                  }}
                />
              </div>
            )}

            {activeTab === 'tires' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '14px' }}>Tire strategy</div>
                {selectedDrivers.map(d => {
                  const stints = getTireStints(d)
                  const driverIndex = raceData.drivers.indexOf(d)
                  return (
                    <div key={d} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                      <div style={{ width: '32px', fontSize: '11px', fontWeight: '600', color: getDriverColor(d, driverIndex) }}>{d}</div>
                      <div style={{ display: 'flex', gap: '2px', flex: 1, height: '24px' }}>
                        {stints.map((s, i) => {
                          const pct = ((s.end - s.start + 1) / raceData.total_laps * 100).toFixed(0)
                          const color = TIRE_COLORS[s.compound] || '#888'
                          return (
                            <div key={i} style={{
                              flex: pct, background: color + '33',
                              border: `1px solid ${color}`, borderRadius: '3px',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: '9px', color: color, fontWeight: '600'
                            }}>
                              {s.compound?.[0]} {s.start}-{s.end}
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
                <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                  {Object.entries(TIRE_COLORS).map(([name, color]) => (
                    <div key={name} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', background: color + '33', border: `1px solid ${color}` }}></div>
                      <span style={{ fontSize: '10px', color: '#666' }}>{name[0] + name.slice(1).toLowerCase()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
            {activeTab === 'gap' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>Gap to race leader — seconds</div>
                <GapChart raceData={raceData} selectedDrivers={selectedDrivers} getDriverColor={getDriverColor} API={API} />
              </div>
            )}

            {activeTab === 'sectors' && (
              <div style={cardStyle}>
                <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>Sector times</div>
                <SectorChart raceData={raceData} selectedDrivers={selectedDrivers} getDriverColor={getDriverColor} API={API} />
              </div>
            )}
            <div style={cardStyle}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '10px' }}>
                <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e10600' }}></div>
                <div style={{ fontSize: '12px', fontWeight: '600' }}>AI race analyst</div>
                <div style={{ fontSize: '10px', color: '#555', background: '#1a1a1a', padding: '2px 8px', borderRadius: '8px', marginLeft: 'auto' }}>GPT-4o-mini</div>
              </div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={question} onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAI()}
                  placeholder="Ask about the race..."
                  style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px 12px', fontSize: '13px' }}
                />
                <button onClick={askAI} disabled={aiLoading} style={{
                  background: '#e10600', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: '7px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer', opacity: aiLoading ? .6 : 1
                }}>{aiLoading ? '...' : 'Ask'}</button>
              </div>
              {aiReply && (
                <div style={{ marginTop: '10px', background: '#1a1a1a', borderRadius: '7px', padding: '12px', fontSize: '13px', color: '#aaa', lineHeight: '1.7' }}>
                  {aiReply}
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function GapChart({ raceData, selectedDrivers, getDriverColor, API }) {
  const [gapData, setGapData] = useState(null)

  useEffect(() => {
    if (!raceData) return
    axios.get(`${API}/gap-to-leader?year=${raceData.year}&gp=${encodeURIComponent(raceData.gp)}`)
      .then(r => setGapData(r.data))
      .catch(e => console.error(e))
  }, [raceData])

  if (!gapData) return <div style={{ color: '#555', fontSize: '13px' }}>Loading gap data...</div>

  const laps = Array.from({length: gapData.total_laps}, (_, i) => i + 1)

  return (
    <Line
      data={{
        labels: laps,
        datasets: gapData.drivers.map((d, i) => ({
          label: d,
          data: gapData.gap_data[d],
          borderColor: getDriverColor(d, i),
          backgroundColor: 'transparent',
          borderWidth: selectedDrivers.includes(d) ? 2 : 0.5,
          pointRadius: 0,
          pointHoverRadius: 4,
          tension: .3,
          spanGaps: false,
          hidden: !selectedDrivers.includes(d)
        }))
      }}
      options={{
        responsive: true,
        plugins: {
          legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 12, filter: item => selectedDrivers.includes(item.text) } },
          tooltip: { mode: 'index', intersect: false, itemSort: (a, b) => a.raw - b.raw, callbacks: { title: items => `Lap ${items[0].label}`, label: c => c.raw !== null ? `${c.dataset.label}: +${c.raw.toFixed(3)}s` : null, filter: i => i.raw !== null } }
        },
        scales: {
          x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', maxTicksLimit: 12, font: { size: 10 } }, title: { display: true, text: 'Lap', color: '#555', font: { size: 10 } } },
          y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', font: { size: 10 }, callback: v => `+${v.toFixed(1)}s` }, title: { display: true, text: 'Gap to leader', color: '#555', font: { size: 10 } } }
        }
      }}
    />
  )
}

function SectorChart({ raceData, selectedDrivers, getDriverColor, API }) {
  const [sectorData, setSectorData] = useState(null)
  const [activeSector, setActiveSector] = useState('s1')

  useEffect(() => {
    if (!raceData) return
    axios.get(`${API}/sectors?year=${raceData.year}&gp=${encodeURIComponent(raceData.gp)}`)
      .then(r => setSectorData(r.data))
      .catch(e => console.error(e))
  }, [raceData])

  if (!sectorData) return <div style={{ color: '#555', fontSize: '13px' }}>Loading sector data...</div>

  const laps = Array.from({length: sectorData.total_laps}, (_, i) => i + 1)
  const sectorLabels = { s1: 'Sector 1', s2: 'Sector 2', s3: 'Sector 3' }

  return (
    <>
      <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
        {['s1','s2','s3'].map(s => (
          <button key={s} onClick={() => setActiveSector(s)} style={{
            background: activeSector === s ? '#e10600' : '#1a1a1a',
            color: '#fff', border: '0.5px solid #333',
            padding: '4px 12px', borderRadius: '6px',
            fontSize: '11px', cursor: 'pointer'
          }}>{sectorLabels[s]}</button>
        ))}
      </div>
      <Line
        data={{
          labels: laps,
          datasets: sectorData.drivers.map((d, i) => ({
            label: d,
            data: sectorData.sector_data[d]?.[activeSector],
            borderColor: getDriverColor(d, i),
            backgroundColor: 'transparent',
            borderWidth: selectedDrivers.includes(d) ? 2 : 0.5,
            pointRadius: 0,
            pointHoverRadius: 4,
            tension: .25,
            spanGaps: false,
            hidden: !selectedDrivers.includes(d)
          }))
        }}
        options={{
          responsive: true,
          plugins: {
            legend: { labels: { color: '#888', font: { size: 11 }, boxWidth: 12, filter: item => selectedDrivers.includes(item.text) } },
            tooltip: { mode: 'index', intersect: false, callbacks: { title: items => `Lap ${items[0].label}`, label: c => c.raw ? `${c.dataset.label}: ${c.raw.toFixed(3)}s` : null, filter: i => i.raw !== null } }
          },
          scales: {
            x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', maxTicksLimit: 12, font: { size: 10 } } },
            y: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', font: { size: 10 }, callback: v => `${v.toFixed(2)}s` }, title: { display: true, text: 'Sector time (s)', color: '#555', font: { size: 10 } } }
          }
        }}
      />
    </>
  )
}