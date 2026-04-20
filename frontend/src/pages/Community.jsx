import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { API } from '../config'
import { ALL_DRIVERS_BY_YEAR } from '../constants/driverData'

const COUNTRY_FLAGS = {
  'Japan': '🇯🇵', 'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺',
  'China': '🇨🇳', 'United States': '🇺🇸', 'Monaco': '🇲🇨', 'Canada': '🇨🇦',
  'Spain': '🇪🇸', 'Austria': '🇦🇹', 'Great Britain': '🇬🇧', 'Hungary': '🇭🇺',
  'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Qatar': '🇶🇦',
  'Abu Dhabi': '🇦🇪', 'Las Vegas': '🇺🇸', 'Miami': '🇺🇸',
}

const card = {
  background: 'var(--bg-card)',
  border: '0.5px solid var(--border-subtle)',
  borderRadius: '12px', padding: '18px', marginBottom: '12px'
}

function useCalendar() {
  const [races, setRaces] = useState({ past: [], upcoming: [] })
  useEffect(() => {
    fetch(`${API}/calendar?year=${new Date().getFullYear()}`)
      .then(r => r.json())
      .then(d => {
        const now = new Date()
        const all = d.races || []
        setRaces({
          past: all.filter(r => new Date(r.date) <= now).reverse(),
          upcoming: all.filter(r => new Date(r.date) > now),
        })
      }).catch(() => {})
  }, [])
  return races
}

export default function Community() {
  const [tab, setTab] = useState('dotd')

  return (
    <div style={{ padding: '20px 16px', maxWidth: '860px', margin: '0 auto', minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)' }}>
      <Helmet>
        <title>The Paddock — PitWall F1 Community</title>
        <meta name="description" content="Vote Driver of the Day, make race predictions, and rate F1 drivers — The Paddock on PitWall." />
      </Helmet>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
        <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>The Paddock</div>
        <div style={{ fontSize: '11px', background: 'rgba(225,6,0,0.12)', color: '#e10600', border: '0.5px solid rgba(225,6,0,0.3)', borderRadius: '20px', padding: '2px 10px', fontWeight: '700' }}>Community</div>
      </div>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Your F1 takes — vote, predict, rate</div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'dotd', label: '🏆 Driver of the Day' },
          { id: 'predict', label: '🔮 Race Predictions' },
          { id: 'rate', label: '⭐ Driver Ratings' },
        ].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? '#e10600' : 'var(--bg-card)',
            border: `0.5px solid ${tab === t.id ? '#e10600' : 'var(--border-input)'}`,
            borderRadius: '8px', color: tab === t.id ? '#fff' : 'var(--text-secondary)',
            padding: '8px 14px', fontSize: '13px', fontWeight: tab === t.id ? '700' : '400', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {tab === 'dotd' && <DriverOfTheDay />}
      {tab === 'predict' && <RacePredictions />}
      {tab === 'rate' && <DriverRatings />}
    </div>
  )
}

// ── Driver of the Day ────────────────────────────────────────────────────────
function DriverOfTheDay() {
  const year = String(new Date().getFullYear())
  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2025'] || []
  const { past } = useCalendar()
  const [selectedRace, setSelectedRace] = useState(null)
  const [voted, setVoted] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pw_dotd') || '{}') } catch { return {} }
  })

  // Auto-select most recent race
  useEffect(() => {
    if (past.length > 0 && !selectedRace) setSelectedRace(past[0].name)
  }, [past])

  function vote(code) {
    if (!selectedRace) return
    const updated = { ...voted, [selectedRace]: code }
    setVoted(updated)
    localStorage.setItem('pw_dotd', JSON.stringify(updated))
  }

  const myVote = voted[selectedRace]
  const selectedRaceObj = past.find(r => r.name === selectedRace)

  return (
    <div>
      <div style={card}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Who was Driver of the Day?</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Pick a race then vote for your standout performer</div>

        {/* Race selector */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>Select race</div>
          {past.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading races...</div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {past.slice(0, 8).map(r => (
                <button key={r.name} onClick={() => setSelectedRace(r.name)} style={{
                  background: selectedRace === r.name ? 'rgba(225,6,0,0.12)' : 'var(--bg-input)',
                  border: `0.5px solid ${selectedRace === r.name ? '#e10600' : 'var(--border-input)'}`,
                  borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                  fontSize: '12px', color: selectedRace === r.name ? '#e10600' : 'var(--text-secondary)',
                  fontWeight: selectedRace === r.name ? '700' : '400',
                }}>
                  {COUNTRY_FLAGS[r.country] || '🏁'} {r.name.replace(' Grand Prix', '').replace(' Grande Prémio', '')}
                  {voted[r.name] && <span style={{ marginLeft: '6px', fontSize: '10px' }}>✅</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {selectedRaceObj && (
          <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '14px' }}>
            {COUNTRY_FLAGS[selectedRaceObj.country] || '🏁'} {selectedRaceObj.name} · {new Date(selectedRaceObj.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
          </div>
        )}

        {myVote && (
          <div style={{ background: 'rgba(225,6,0,0.08)', border: '0.5px solid rgba(225,6,0,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>🏆</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#e10600' }}>Your vote: {drivers.find(d => d.code === myVote)?.name || myVote}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Tap another driver to change</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
          {drivers.map(d => {
            const isVoted = myVote === d.code
            return (
              <button key={d.code} onClick={() => vote(d.code)} style={{
                background: isVoted ? 'rgba(225,6,0,0.12)' : 'var(--bg-input)',
                border: `1px solid ${isVoted ? '#e10600' : 'var(--border-input)'}`,
                borderRadius: '10px', padding: '10px 12px', cursor: 'pointer',
                textAlign: 'left', transition: 'all .2s', color: 'var(--text-primary)',
              }}>
                <div style={{ fontSize: '12px', fontWeight: '700', color: isVoted ? '#e10600' : 'var(--text-secondary)' }}>{d.code}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.name.split(' ').slice(1).join(' ')}</div>
                {isVoted && <div style={{ fontSize: '14px', marginTop: '4px' }}>✅</div>}
              </button>
            )
          })}
        </div>
      </div>

      {Object.keys(voted).length > 0 && (
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Your voting history</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(voted).map(([race, code]) => (
              <div key={race} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>{race.replace(' Grand Prix', ' GP')}</div>
                <div style={{ fontSize: '13px', fontWeight: '700', color: '#e10600' }}>🏆 {code}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Race Predictions ─────────────────────────────────────────────────────────
function RacePredictions() {
  const year = String(new Date().getFullYear())
  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2025'] || []
  const { upcoming, past } = useCalendar()
  const [selectedRace, setSelectedRace] = useState(null)
  const [predictions, setPredictions] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pw_preds') || '{}') } catch { return {} }
  })
  const [pick, setPick] = useState({ p1: '', p2: '', p3: '' })

  // Auto-select next upcoming race
  useEffect(() => {
    if (upcoming.length > 0 && !selectedRace) {
      setSelectedRace(upcoming[0].name)
      if (predictions[upcoming[0].name]) setPick(predictions[upcoming[0].name])
    }
  }, [upcoming])

  useEffect(() => {
    if (selectedRace && predictions[selectedRace]) {
      setPick(predictions[selectedRace])
    } else {
      setPick({ p1: '', p2: '', p3: '' })
    }
  }, [selectedRace])

  function savePick() {
    if (!selectedRace || !pick.p1 || !pick.p2 || !pick.p3) return
    if (new Set([pick.p1, pick.p2, pick.p3]).size < 3) return
    const updated = { ...predictions, [selectedRace]: pick }
    setPredictions(updated)
    localStorage.setItem('pw_preds', JSON.stringify(updated))
  }

  const saved = selectedRace && predictions[selectedRace]
  const allRaces = [...upcoming, ...past.slice(0, 3)]

  return (
    <div>
      <div style={card}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Predict the podium</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Pick any race, lock in your P1/P2/P3 before the lights go out</div>

        {/* Race selector */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>Select race</div>
          {allRaces.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading races...</div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {upcoming.map(r => (
                <button key={r.name} onClick={() => setSelectedRace(r.name)} style={{
                  background: selectedRace === r.name ? 'rgba(225,6,0,0.12)' : 'var(--bg-input)',
                  border: `0.5px solid ${selectedRace === r.name ? '#e10600' : 'var(--border-input)'}`,
                  borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                  fontSize: '12px', color: selectedRace === r.name ? '#e10600' : 'var(--text-secondary)',
                  fontWeight: selectedRace === r.name ? '700' : '400',
                }}>
                  {COUNTRY_FLAGS[r.country] || '🏁'} {r.name.replace(' Grand Prix', '').replace(' Grande Prémio', '')}
                  {predictions[r.name] && <span style={{ marginLeft: '6px', fontSize: '10px' }}>✅</span>}
                </button>
              ))}
              {past.slice(0, 3).map(r => (
                <button key={r.name} onClick={() => setSelectedRace(r.name)} style={{
                  background: selectedRace === r.name ? 'rgba(100,100,100,0.15)' : 'var(--bg-input)',
                  border: `0.5px solid ${selectedRace === r.name ? '#666' : 'var(--border-input)'}`,
                  borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                  fontSize: '12px', color: 'var(--text-muted)', opacity: 0.7,
                }}>
                  {COUNTRY_FLAGS[r.country] || '🏁'} {r.name.replace(' Grand Prix', '')} <span style={{ fontSize: '9px' }}>(past)</span>
                  {predictions[r.name] && <span style={{ marginLeft: '4px', fontSize: '10px' }}>✅</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {saved && (
          <div style={{ background: 'rgba(80,200,100,0.08)', border: '0.5px solid rgba(80,200,100,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px' }}>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#4caf50' }}>✅ Prediction locked in!</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '4px' }}>
              🥇 {saved.p1} · 🥈 {saved.p2} · 🥉 {saved.p3}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
          {['p1','p2','p3'].map((pos, i) => (
            <div key={pos} style={{ flex: 1, minWidth: '120px' }}>
              <div style={{ fontSize: '11px', color: ['#f5c842','#aaa','#cd7f32'][i], fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                {['🥇 P1','🥈 P2','🥉 P3'][i]}
              </div>
              <select value={pick[pos]} onChange={e => setPick(p => ({ ...p, [pos]: e.target.value }))} style={{
                width: '100%', background: 'var(--bg-input)', border: '0.5px solid var(--border-input)',
                borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 10px', fontSize: '13px',
              }}>
                <option value="">Pick driver</option>
                {drivers.filter(d => !Object.values(pick).filter((_,j)=>['p1','p2','p3'][j]!==pos).includes(d.code)).map(d => (
                  <option key={d.code} value={d.code}>{d.name}</option>
                ))}
              </select>
            </div>
          ))}
        </div>

        <button onClick={savePick} disabled={!selectedRace || !pick.p1 || !pick.p2 || !pick.p3 || new Set([pick.p1,pick.p2,pick.p3]).size < 3} style={{
          background: '#e10600', color: '#fff', border: 'none', borderRadius: '8px',
          padding: '10px 20px', fontSize: '13px', fontWeight: '700', cursor: 'pointer',
          opacity: (!selectedRace || !pick.p1 || !pick.p2 || !pick.p3) ? .5 : 1,
        }}>Lock in prediction 🔒</button>
      </div>

      {Object.keys(predictions).length > 0 && (
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Your predictions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(predictions).map(([race, p]) => (
              <div key={race} style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px' }}>{race.replace(' Grand Prix', ' GP')}</div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[['🥇',p.p1],['🥈',p.p2],['🥉',p.p3]].map(([m,c],i) => (
                    <div key={i} style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-primary)' }}>{m} {c}</div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

// ── Driver Ratings ───────────────────────────────────────────────────────────
function DriverRatings() {
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const drivers = ALL_DRIVERS_BY_YEAR[year] || []
  const [ratings, setRatings] = useState(() => {
    try { return JSON.parse(localStorage.getItem('pw_ratings') || '{}') } catch { return {} }
  })
  const [hover, setHover] = useState({})

  function rate(code, val) {
    const updated = { ...ratings, [`${year}_${code}`]: val }
    setRatings(updated)
    localStorage.setItem('pw_ratings', JSON.stringify(updated))
  }

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Rate every driver</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Your personal 1–10 season ratings</div>
          </div>
          <select value={year} onChange={e => setYear(e.target.value)} style={{
            background: 'var(--bg-input)', border: '0.5px solid var(--border-input)', borderRadius: '8px',
            color: 'var(--text-primary)', padding: '8px 12px', fontSize: '13px',
          }}>
            {['2026','2025','2024','2023','2022','2021'].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drivers.map(d => {
            const key = `${year}_${d.code}`
            const myRating = ratings[key] || 0
            const hov = hover[key] || 0
            return (
              <div key={d.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: myRating ? 'rgba(225,6,0,0.04)' : 'var(--bg-input)', borderRadius: '10px', flexWrap: 'wrap' }}>
                <div style={{ width: '36px', fontSize: '12px', fontWeight: '800', color: '#e10600', flexShrink: 0 }}>{d.code}</div>
                <div style={{ flex: 1, minWidth: '100px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.name}</div>
                <div style={{ display: 'flex', gap: '3px' }} onMouseLeave={() => setHover(h => ({ ...h, [key]: 0 }))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n}
                      onMouseEnter={() => setHover(h => ({ ...h, [key]: n }))}
                      onClick={() => rate(d.code, n)}
                      style={{
                        width: '22px', height: '22px', borderRadius: '4px', border: 'none',
                        background: n <= (hov || myRating) ? '#e10600' : 'var(--border-subtle)',
                        cursor: 'pointer', fontSize: '9px', fontWeight: '700',
                        color: n <= (hov || myRating) ? '#fff' : 'var(--text-muted)',
                        transition: 'background .1s',
                      }}>{n}</button>
                  ))}
                </div>
                {myRating > 0 && <div style={{ fontSize: '12px', color: '#e10600', fontWeight: '700', minWidth: '32px' }}>{myRating}/10</div>}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
