import { useState, useEffect } from 'react'
import axios from 'axios'
import { Line } from 'react-chartjs-2'
import { Chart, LineElement, PointElement, LinearScale,
         CategoryScale, Tooltip, Legend } from 'chart.js'
Chart.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

const API = 'https://pitwall-production-c292.up.railway.app'

export default function RaceReplay() {
  const [year, setYear] = useState('2024')
  const [gp, setGp] = useState('')
  const [races, setRaces] = useState([])
  const [raceData, setRaceData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [question, setQuestion] = useState('')
  const [aiReply, setAiReply] = useState('')
  const [aiLoading, setAiLoading] = useState(false)

  useEffect(() => {
    axios.get(`${API}/races?year=${year}`)
      .then(r => { setRaces(r.data.races); setGp(r.data.races[0] || '') })
      .catch(() => setRaces(['Monaco','Bahrain','Silverstone']))
  }, [year])

  async function loadRace() {
    setLoading(true)
    setRaceData(null)
    try {
      const r = await axios.get(`${API}/race?year=${year}&gp=${encodeURIComponent(gp)}`)
      setRaceData(r.data)
    } catch(e) { alert('Error loading race — make sure backend is running') }
    setLoading(false)
  }

  async function askAI() {
    if (!question || !raceData) return
    setAiLoading(true)
    const summary = `Race: ${raceData.gp} ${raceData.year}, Total laps: ${raceData.total_laps}, Drivers: ${raceData.drivers.join(', ')}`
    try {
      const r = await axios.post(`${API}/analyze`, { race_summary: summary, question })
      setAiReply(r.data.response)
    } catch(e) { setAiReply('AI unavailable right now.') }
    setAiLoading(false)
  }

  const topDrivers = raceData ? raceData.drivers.slice(0, 6) : []
  const colors = ['#3671c6','#e8002d','#ff8000','#00d2be','#52e252','#c92d4b']
  const laps = raceData ? Array.from({length: raceData.total_laps}, (_, i) => i + 1) : []

  return (
    <div style={{ display: 'flex', minHeight: 'calc(100vh - 52px)' }}>
      <div style={{
        width: '230px', background: '#111', borderRight: '0.5px solid #222',
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px'
      }}>
        <div style={{ fontSize: '10px', color: '#555', letterSpacing: '.5px', textTransform: 'uppercase' }}>Race selector</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <select value={year} onChange={e => setYear(e.target.value)}
            style={{ background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px', fontSize: '13px' }}>
            {['2024','2023','2022'].map(y => <option key={y}>{y}</option>)}
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
      </div>

      <div style={{ flex: 1, padding: '20px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {!raceData && !loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#444', fontSize: '14px' }}>
            Select a race and click Load race data
          </div>
        )}
        {loading && (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#666', fontSize: '14px' }}>
            Loading race data — this takes a minute first time...
          </div>
        )}
        {raceData && (
          <>
            <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '10px', padding: '14px 18px' }}>
              <div style={{ fontSize: '15px', fontWeight: '600' }}>{raceData.gp} Grand Prix {raceData.year}</div>
              <div style={{ fontSize: '12px', color: '#666', marginTop: '2px' }}>{raceData.total_laps} laps · {raceData.drivers.length} drivers</div>
            </div>
            <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '12px' }}>Position changes</div>
              <Line
                data={{
                  labels: laps,
                  datasets: topDrivers.map((d, i) => ({
                    label: d,
                    data: raceData.position_data[d],
                    borderColor: colors[i],
                    backgroundColor: 'transparent',
                    borderWidth: 2.5, pointRadius: 0, tension: .3
                  }))
                }}
                options={{
                  responsive: true,
                  plugins: { legend: { labels: { color: '#888', font: { size: 11 } } }, tooltip: { mode: 'index', intersect: false } },
                  scales: {
                    x: { grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', maxTicksLimit: 12, font: { size: 10 } } },
                    y: { reverse: true, min: 1, max: 20, grid: { color: 'rgba(255,255,255,.04)' }, ticks: { color: '#555', stepSize: 2, font: { size: 10 } } }
                  }
                }}
              />
            </div>
            <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '10px', padding: '16px' }}>
              <div style={{ fontSize: '12px', fontWeight: '600', marginBottom: '10px' }}>AI race analyst</div>
              <div style={{ display: 'flex', gap: '8px' }}>
                <input value={question} onChange={e => setQuestion(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && askAI()}
                  placeholder="Ask about the race..."
                  style={{ flex: 1, background: '#1a1a1a', border: '0.5px solid #333', borderRadius: '7px', color: '#fff', padding: '8px 12px', fontSize: '13px' }}
                />
                <button onClick={askAI} disabled={aiLoading} style={{
                  background: '#e10600', color: '#fff', border: 'none',
                  padding: '8px 16px', borderRadius: '7px', fontSize: '13px',
                  fontWeight: '600', cursor: 'pointer'
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