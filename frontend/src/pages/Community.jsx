import { useState, useEffect, useCallback } from 'react'
import { Helmet } from 'react-helmet-async'
import { API } from '../config'
import { ALL_DRIVERS_BY_YEAR } from '../constants/driverData'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AuthModal from '../components/AuthModal'

const COUNTRY_FLAGS = {
  'Japan': '🇯🇵', 'Bahrain': '🇧🇭', 'Saudi Arabia': '🇸🇦', 'Australia': '🇦🇺',
  'China': '🇨🇳', 'United States': '🇺🇸', 'Monaco': '🇲🇨', 'Canada': '🇨🇦',
  'Spain': '🇪🇸', 'Austria': '🇦🇹', 'Great Britain': '🇬🇧', 'Hungary': '🇭🇺',
  'Belgium': '🇧🇪', 'Netherlands': '🇳🇱', 'Italy': '🇮🇹', 'Azerbaijan': '🇦🇿',
  'Singapore': '🇸🇬', 'Mexico': '🇲🇽', 'Brazil': '🇧🇷', 'Qatar': '🇶🇦',
  'Abu Dhabi': '🇦🇪', 'Las Vegas': '🇺🇸', 'Miami': '🇺🇸',
}

const TEAM_COLORS = {
  'Red Bull Racing': '#3671c6', 'Ferrari': '#e8002d', 'McLaren': '#ff8000',
  'Mercedes': '#00d2be', 'Aston Martin': '#52e252', 'Alpine': '#0093cc',
  'Racing Bulls': '#6692ff', 'Williams': '#005aff', 'Haas': '#b6babd',
  'Audi': '#c92d4b', 'Cadillac': '#888',
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
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()

  if (!loading && !user) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <Helmet><title>The Paddock — PitWall</title></Helmet>
        <div style={{ position: 'absolute', width: '400px', height: '400px', background: 'radial-gradient(circle, rgba(225,6,0,0.07), transparent 70%)', pointerEvents: 'none' }} />
        <div style={{ width: '64px', height: '64px', background: 'linear-gradient(135deg, #e10600, #b30500)', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', marginBottom: '24px', boxShadow: '0 0 32px rgba(225,6,0,0.3)' }}>🏁</div>
        <div style={{ fontSize: '28px', fontWeight: '900', color: 'var(--text-primary)', letterSpacing: '-0.5px', marginBottom: '8px' }}>The Paddock</div>
        <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '32px', maxWidth: '340px', lineHeight: 1.6 }}>
          Vote Driver of the Day, predict race results, rate drivers, and compete on the leaderboard — all saved to your account.
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '36px' }}>
          {['🏆 Driver of the Day', '🔮 Race Predictions', '⭐ Driver Ratings', '🥇 Leaderboard'].map(f => (
            <div key={f} style={{ background: 'var(--bg-card)', border: '0.5px solid var(--border-subtle)', borderRadius: '20px', padding: '6px 14px', fontSize: '12px', color: 'var(--text-secondary)' }}>{f}</div>
          ))}
        </div>
        <button onClick={() => setShowAuth(true)} style={{
          background: 'linear-gradient(135deg, #e10600, #c00500)', border: 'none', color: '#fff',
          padding: '14px 40px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer',
          boxShadow: '0 0 24px rgba(225,6,0,0.35)', transition: 'transform 0.15s',
        }}
          onMouseEnter={e => e.currentTarget.style.transform = 'scale(1.04)'}
          onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
        >Sign In to Enter</button>
        <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-muted)' }}>Free account — no credit card needed</div>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)' }}>
        <div style={{ width: '32px', height: '32px', border: '2px solid #1a1a1a', borderTop: '2px solid #e10600', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      </div>
    )
  }

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
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>Vote, predict, rate — locked in forever once submitted</div>

      <div style={{ display: 'flex', gap: '6px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {[
          { id: 'dotd', label: '🏆 Driver of the Day' },
          { id: 'predict', label: '🔮 Predictions' },
          { id: 'rate', label: '⭐ Driver Ratings' },
          { id: 'leaderboard', label: '🥇 Leaderboard' },
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
      {tab === 'leaderboard' && <Leaderboard />}
    </div>
  )
}

// ── Driver of the Day ────────────────────────────────────────────────────────
function DriverOfTheDay() {
  const { user } = useAuth()
  const year = String(new Date().getFullYear())
  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2025'] || []
  const { past } = useCalendar()
  const [selectedRace, setSelectedRace] = useState(null)
  const [myVote, setMyVote] = useState(null)
  const [voteCounts, setVoteCounts] = useState({})
  const [saving, setSaving] = useState(false)
  const [allVotes, setAllVotes] = useState([])

  useEffect(() => {
    if (past.length > 0 && !selectedRace) setSelectedRace(past[0].name)
  }, [past])

  const loadVotes = useCallback(async () => {
    if (!selectedRace) return
    const { data } = await supabase.from('votes').select('driver_code, user_id').eq('race_name', selectedRace)
    if (!data) return
    setAllVotes(data)
    const counts = {}
    data.forEach(v => { counts[v.driver_code] = (counts[v.driver_code] || 0) + 1 })
    setVoteCounts(counts)
    if (user) {
      const mine = data.find(v => v.user_id === user.id)
      setMyVote(mine?.driver_code || null)
    }
  }, [selectedRace, user])

  useEffect(() => { loadVotes() }, [loadVotes])

  // Reset myVote when race changes
  useEffect(() => { setMyVote(null) }, [selectedRace])

  async function vote(code) {
    if (!user || saving || myVote) return // locked once voted
    setSaving(true)
    const { error } = await supabase.from('votes').insert(
      { user_id: user.id, race_name: selectedRace, driver_code: code }
    )
    if (!error) { setMyVote(code); await loadVotes() }
    setSaving(false)
  }

  const totalVotes = allVotes.length
  const selectedRaceObj = past.find(r => r.name === selectedRace)

  return (
    <div>
      <div style={card}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Who was Driver of the Day?</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>
          Pick a race and lock in your vote — can't be changed after submitting
          {totalVotes > 0 && <span style={{ marginLeft: '8px', color: '#e10600', fontWeight: '600' }}>{totalVotes} vote{totalVotes !== 1 ? 's' : ''} total</span>}
        </div>

        {/* Race selector */}
        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>Select race</div>
          {past.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Loading races...</div>
          ) : (
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {past.slice(0, 10).map(r => (
                <button key={r.name} onClick={() => setSelectedRace(r.name)} style={{
                  background: selectedRace === r.name ? 'rgba(225,6,0,0.12)' : 'var(--bg-input)',
                  border: `0.5px solid ${selectedRace === r.name ? '#e10600' : 'var(--border-input)'}`,
                  borderRadius: '8px', padding: '6px 12px', cursor: 'pointer',
                  fontSize: '12px', color: selectedRace === r.name ? '#e10600' : 'var(--text-secondary)',
                  fontWeight: selectedRace === r.name ? '700' : '400',
                }}>
                  {COUNTRY_FLAGS[r.country] || '🏁'} {r.name.replace(' Grand Prix', '').replace(' Grande Prémio', '')}
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

        {/* Locked vote banner */}
        {myVote && (
          <div style={{ background: 'rgba(225,6,0,0.08)', border: '0.5px solid rgba(225,6,0,0.3)', borderRadius: '10px', padding: '12px 16px', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ fontSize: '20px' }}>🔒</div>
            <div>
              <div style={{ fontSize: '13px', fontWeight: '700', color: '#e10600' }}>Vote locked: {drivers.find(d => d.code === myVote)?.name || myVote}</div>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Your vote is permanent — visible on your profile</div>
            </div>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '8px' }}>
          {drivers.map(d => {
            const isVoted = myVote === d.code
            const count = voteCounts[d.code] || 0
            const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
            const locked = !!myVote
            return (
              <button key={d.code} onClick={() => vote(d.code)}
                disabled={saving || locked}
                style={{
                  background: isVoted ? 'rgba(225,6,0,0.12)' : 'var(--bg-input)',
                  border: `1px solid ${isVoted ? '#e10600' : 'var(--border-input)'}`,
                  borderRadius: '10px', padding: '10px 12px', cursor: locked ? 'default' : 'pointer',
                  textAlign: 'left', transition: 'all .2s', color: 'var(--text-primary)',
                  position: 'relative', overflow: 'hidden',
                  opacity: locked && !isVoted ? 0.5 : 1,
                }}>
                {totalVotes > 0 && (
                  <div style={{ position: 'absolute', bottom: 0, left: 0, height: '2px', width: `${pct}%`, background: isVoted ? '#e10600' : '#333', transition: 'width .5s ease' }} />
                )}
                <div style={{ fontSize: '12px', fontWeight: '700', color: isVoted ? '#e10600' : 'var(--text-secondary)' }}>{d.code}</div>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '2px' }}>{d.name.split(' ').slice(1).join(' ')}</div>
                <div style={{ fontSize: '10px', color: isVoted ? '#e10600' : '#444', marginTop: '4px', fontWeight: '600' }}>
                  {isVoted ? '🔒 Locked' : count > 0 ? `${pct}% · ${count}` : ''}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Race Predictions ─────────────────────────────────────────────────────────
function RacePredictions() {
  const { user } = useAuth()
  const year = String(new Date().getFullYear())
  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2025'] || []
  const { upcoming, past } = useCalendar()
  const [selectedRace, setSelectedRace] = useState(null)
  const [myPreds, setMyPreds] = useState({}) // race_name -> {p1,p2,p3, locked}
  const [pick, setPick] = useState({ p1: '', p2: '', p3: '' })
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    if (upcoming.length > 0 && !selectedRace) setSelectedRace(upcoming[0].name)
  }, [upcoming])

  useEffect(() => {
    const saved = myPreds[selectedRace]
    if (saved) setPick({ p1: saved.p1, p2: saved.p2, p3: saved.p3 })
    else setPick({ p1: '', p2: '', p3: '' })
  }, [selectedRace])

  useEffect(() => {
    if (!user) return
    supabase.from('predictions').select('race_name, p1, p2, p3').eq('user_id', user.id)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(p => { map[p.race_name] = { p1: p.p1, p2: p.p2, p3: p.p3, locked: true } })
        setMyPreds(map)
      })
  }, [user])

  async function savePick() {
    if (!user || !selectedRace || !pick.p1 || !pick.p2 || !pick.p3) return
    if (new Set([pick.p1, pick.p2, pick.p3]).size < 3) return
    if (myPreds[selectedRace]?.locked) return // already locked
    setSaving(true)
    const { error } = await supabase.from('predictions').insert(
      { user_id: user.id, race_name: selectedRace, p1: pick.p1, p2: pick.p2, p3: pick.p3 }
    )
    if (!error) setMyPreds(p => ({ ...p, [selectedRace]: { ...pick, locked: true } }))
    setSaving(false)
  }

  const saved = selectedRace && myPreds[selectedRace]
  const isLocked = saved?.locked

  return (
    <div>
      <div style={card}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Predict the podium</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px' }}>Pick your P1/P2/P3 — once locked, it's permanent</div>

        <div style={{ marginBottom: '18px' }}>
          <div style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '6px' }}>Upcoming races</div>
          {upcoming.length === 0 ? (
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>No upcoming races loaded</div>
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
                  {myPreds[r.name]?.locked && <span style={{ marginLeft: '6px' }}>🔒</span>}
                </button>
              ))}
            </div>
          )}
        </div>

        {isLocked ? (
          <div style={{ background: 'rgba(52,211,153,0.07)', border: '0.5px solid rgba(52,211,153,0.25)', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ fontSize: '28px' }}>🔒</div>
            <div>
              <div style={{ fontSize: '14px', fontWeight: '700', color: '#4caf50' }}>Prediction locked in!</div>
              <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                🥇 {saved.p1} · 🥈 {saved.p2} · 🥉 {saved.p3}
              </div>
              <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>Visible on your profile. Can't be changed.</div>
            </div>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', gap: '10px', marginBottom: '16px', flexWrap: 'wrap' }}>
              {['p1', 'p2', 'p3'].map((pos, i) => (
                <div key={pos} style={{ flex: 1, minWidth: '120px' }}>
                  <div style={{ fontSize: '11px', color: ['#f5c842', '#aaa', '#cd7f32'][i], fontWeight: '700', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                    {['🥇 P1', '🥈 P2', '🥉 P3'][i]}
                  </div>
                  <select value={pick[pos]} onChange={e => setPick(p => ({ ...p, [pos]: e.target.value }))} style={{
                    width: '100%', background: 'var(--bg-input)', border: '0.5px solid var(--border-input)',
                    borderRadius: '8px', color: 'var(--text-primary)', padding: '8px 10px', fontSize: '13px',
                  }}>
                    <option value="">Pick driver</option>
                    {drivers.filter(d => !Object.entries(pick).filter(([k]) => k !== pos).map(([, v]) => v).includes(d.code)).map(d => (
                      <option key={d.code} value={d.code}>{d.name}</option>
                    ))}
                  </select>
                </div>
              ))}
            </div>

            <button onClick={savePick} disabled={saving || !pick.p1 || !pick.p2 || !pick.p3 || new Set([pick.p1, pick.p2, pick.p3]).size < 3} style={{
              background: (!pick.p1 || !pick.p2 || !pick.p3) ? '#1a1a1a' : saving ? '#333' : '#e10600',
              color: (!pick.p1 || !pick.p2 || !pick.p3) ? '#444' : '#fff',
              border: 'none', borderRadius: '8px', padding: '11px 22px',
              fontSize: '14px', fontWeight: '700', cursor: 'pointer',
              display: 'flex', alignItems: 'center', gap: '8px', transition: 'all .2s',
              boxShadow: (!pick.p1 || !pick.p2 || !pick.p3) ? 'none' : '0 4px 16px rgba(225,6,0,0.25)',
            }}>{saving ? 'Locking…' : '🔒 Lock Prediction'}</button>
            <div style={{ fontSize: '11px', color: '#444', marginTop: '8px' }}>Once locked this cannot be changed</div>
          </>
        )}
      </div>

      {/* Past locked predictions */}
      {Object.keys(myPreds).filter(r => !upcoming.find(u => u.name === r)).length > 0 && (
        <div style={card}>
          <div style={{ fontSize: '13px', fontWeight: '700', marginBottom: '12px', color: 'var(--text-primary)' }}>Your past predictions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(myPreds).filter(([r]) => !upcoming.find(u => u.name === r)).map(([race, p]) => (
              <div key={race} style={{ padding: '10px 14px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                  <span>{race.replace(' Grand Prix', ' GP')}</span>
                  <span>🔒</span>
                </div>
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  {[['🥇', p.p1], ['🥈', p.p2], ['🥉', p.p3]].map(([m, c], i) => (
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
  const { user } = useAuth()
  const [year, setYear] = useState(String(new Date().getFullYear()))
  const drivers = ALL_DRIVERS_BY_YEAR[year] || []
  const [ratings, setRatings] = useState({})
  const [hover, setHover] = useState({})
  const [saving, setSaving] = useState(null)

  useEffect(() => {
    if (!user) return
    supabase.from('ratings').select('driver_code, rating').eq('user_id', user.id).eq('year', year)
      .then(({ data }) => {
        if (!data) return
        const map = {}
        data.forEach(r => { map[`${year}_${r.driver_code}`] = r.rating })
        setRatings(map)
      })
  }, [user, year])

  async function rate(code, val) {
    if (!user) return
    const key = `${year}_${code}`
    setSaving(code)
    const { error } = await supabase.from('ratings').upsert(
      { user_id: user.id, driver_code: code, year, rating: val },
      { onConflict: 'user_id,driver_code,year' }
    )
    if (!error) setRatings(r => ({ ...r, [key]: val }))
    setSaving(null)
  }

  return (
    <div>
      <div style={card}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '10px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)' }}>Rate every driver</div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '3px' }}>Your personal 1–10 season ratings · can be updated anytime</div>
          </div>
          <select value={year} onChange={e => setYear(e.target.value)} style={{
            background: 'var(--bg-input)', border: '0.5px solid var(--border-input)', borderRadius: '8px',
            color: 'var(--text-primary)', padding: '8px 12px', fontSize: '13px',
          }}>
            {['2026', '2025', '2024', '2023', '2022', '2021'].map(y => <option key={y}>{y}</option>)}
          </select>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {drivers.map(d => {
            const key = `${year}_${d.code}`
            const myRating = ratings[key] || 0
            const hov = hover[key] || 0
            const isSaving = saving === d.code
            return (
              <div key={d.code} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 12px', background: myRating ? 'rgba(225,6,0,0.04)' : 'var(--bg-input)', borderRadius: '10px', flexWrap: 'wrap', opacity: isSaving ? 0.6 : 1, transition: 'opacity .2s' }}>
                <div style={{ width: '36px', fontSize: '12px', fontWeight: '800', color: '#e10600', flexShrink: 0 }}>{d.code}</div>
                <div style={{ flex: 1, minWidth: '100px', fontSize: '13px', color: 'var(--text-secondary)' }}>{d.name}</div>
                <div style={{ display: 'flex', gap: '3px' }} onMouseLeave={() => setHover(h => ({ ...h, [key]: 0 }))}>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(n => (
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

// ── Leaderboard ──────────────────────────────────────────────────────────────
function Leaderboard() {
  const { user } = useAuth()
  const [entries, setEntries] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      // Fetch all activity data + profiles
      const [votesRes, predsRes, ratingsRes, profilesRes] = await Promise.all([
        supabase.from('votes').select('user_id'),
        supabase.from('predictions').select('user_id'),
        supabase.from('ratings').select('user_id'),
        supabase.from('profiles').select('id, username, fav_team'),
      ])

      const votes = votesRes.data || []
      const preds = predsRes.data || []
      const ratings = ratingsRes.data || []
      const profiles = profilesRes.data || []

      // Count activity per user
      const userMap = {}
      votes.forEach(v => { if (!userMap[v.user_id]) userMap[v.user_id] = { votes: 0, preds: 0, ratings: 0 }; userMap[v.user_id].votes++ })
      preds.forEach(p => { if (!userMap[p.user_id]) userMap[p.user_id] = { votes: 0, preds: 0, ratings: 0 }; userMap[p.user_id].preds++ })
      ratings.forEach(r => { if (!userMap[r.user_id]) userMap[r.user_id] = { votes: 0, preds: 0, ratings: 0 }; userMap[r.user_id].ratings++ })

      // Join with profiles and calculate points
      const leaderboard = Object.entries(userMap)
        .map(([userId, stats]) => {
          const profile = profiles.find(p => p.id === userId)
          const points = stats.votes * 1 + stats.preds * 2 + Math.floor(stats.ratings * 0.5)
          return {
            userId,
            username: profile?.username || 'Anonymous',
            fav_team: profile?.fav_team || null,
            points,
            votes: stats.votes,
            preds: stats.preds,
            ratings: stats.ratings,
          }
        })
        .filter(e => e.points > 0)
        .sort((a, b) => b.points - a.points)
        .slice(0, 50)

      setEntries(leaderboard)
      setLoading(false)
    }
    load()
  }, [])

  const medals = ['🥇', '🥈', '🥉']

  return (
    <div>
      <div style={card}>
        <div style={{ fontSize: '16px', fontWeight: '700', color: 'var(--text-primary)', marginBottom: '4px' }}>Paddock Leaderboard</div>
        <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '4px' }}>Points: Vote = 1pt · Prediction = 2pts · Rating = 0.5pts</div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading leaderboard...</div>
        ) : entries.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>
            <div style={{ fontSize: '32px', marginBottom: '12px' }}>🏁</div>
            No activity yet — be the first to vote!
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '16px' }}>
            {entries.map((entry, i) => {
              const isMe = entry.userId === user?.id
              const color = entry.fav_team ? (TEAM_COLORS[entry.fav_team] || '#e10600') : '#e10600'
              return (
                <div key={entry.userId} style={{
                  display: 'flex', alignItems: 'center', gap: '12px',
                  padding: '12px 14px', borderRadius: '10px',
                  background: isMe ? 'rgba(225,6,0,0.06)' : i < 3 ? 'rgba(255,255,255,0.02)' : 'var(--bg-input)',
                  border: `0.5px solid ${isMe ? 'rgba(225,6,0,0.3)' : i < 3 ? 'rgba(255,255,255,0.06)' : 'var(--border-input)'}`,
                  transition: 'all .15s',
                }}>
                  {/* Rank */}
                  <div style={{ width: '28px', flexShrink: 0, textAlign: 'center', fontSize: i < 3 ? '18px' : '13px', fontWeight: '700', color: i < 3 ? '#fff' : '#555' }}>
                    {i < 3 ? medals[i] : `${i + 1}`}
                  </div>

                  {/* Avatar */}
                  <div style={{
                    width: '32px', height: '32px', borderRadius: '50%', flexShrink: 0,
                    background: `linear-gradient(135deg, ${color}, ${color}99)`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '13px', fontWeight: '800', color: '#fff',
                  }}>
                    {entry.username[0].toUpperCase()}
                  </div>

                  {/* Name + team */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: isMe ? '#e10600' : '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {entry.username}
                      {isMe && <span style={{ fontSize: '10px', background: 'rgba(225,6,0,0.15)', color: '#e10600', padding: '1px 6px', borderRadius: '10px', fontWeight: '700' }}>You</span>}
                    </div>
                    {entry.fav_team && (
                      <div style={{ fontSize: '10px', color: color, marginTop: '1px', fontWeight: '600' }}>{entry.fav_team}</div>
                    )}
                  </div>

                  {/* Stats */}
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexShrink: 0 }}>
                    <div style={{ textAlign: 'right', display: 'flex', gap: '8px' }}>
                      <span style={{ fontSize: '10px', color: '#555' }}>🏆{entry.votes}</span>
                      <span style={{ fontSize: '10px', color: '#555' }}>🔮{entry.preds}</span>
                      <span style={{ fontSize: '10px', color: '#555' }}>⭐{entry.ratings}</span>
                    </div>
                    <div style={{ fontSize: '16px', fontWeight: '900', color: i < 3 ? '#f5c842' : '#fff', minWidth: '40px', textAlign: 'right' }}>
                      {entry.points}<span style={{ fontSize: '10px', color: '#555', fontWeight: '400' }}>pt</span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Points explanation */}
      <div style={{ ...card, padding: '14px 18px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: '#777', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '.5px' }}>How to earn Paddock Points</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {[
            { icon: '🏆', action: 'Vote Driver of the Day', pts: '+1 pt' },
            { icon: '🔮', action: 'Lock a race prediction', pts: '+2 pts' },
            { icon: '⭐', action: 'Rate a driver', pts: '+0.5 pts' },
          ].map(r => (
            <div key={r.action} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{r.icon} {r.action}</span>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#e10600' }}>{r.pts}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
