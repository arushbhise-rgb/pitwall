import { useState, useEffect } from 'react'
import { Helmet } from 'react-helmet-async'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AuthModal from '../components/AuthModal'
import { ALL_DRIVERS_BY_YEAR } from '../constants/driverData'

const F1_TEAMS = [
  { id: 'Red Bull Racing', color: '#3671c6' },
  { id: 'Ferrari', color: '#e8002d' },
  { id: 'McLaren', color: '#ff8000' },
  { id: 'Mercedes', color: '#00d2be' },
  { id: 'Aston Martin', color: '#52e252' },
  { id: 'Alpine', color: '#0093cc' },
  { id: 'Racing Bulls', color: '#6692ff' },
  { id: 'Williams', color: '#005aff' },
  { id: 'Haas', color: '#b6babd' },
  { id: 'Audi', color: '#c92d4b' },
  { id: 'Cadillac', color: '#888' },
]

const YEAR = String(new Date().getFullYear())
const DRIVERS_NOW = ALL_DRIVERS_BY_YEAR[YEAR] || ALL_DRIVERS_BY_YEAR['2025'] || []

function teamColor(team) {
  return F1_TEAMS.find(t => t.id === team)?.color || '#e10600'
}

const card = { background: 'var(--bg-card)', border: '0.5px solid var(--border-subtle)', borderRadius: '12px', padding: '18px', marginBottom: '12px' }
const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: '#141414', border: '1.5px solid #222',
  borderRadius: '8px', color: '#fff',
  padding: '10px 12px', fontSize: '14px', outline: 'none',
}

export default function Profile() {
  const { user, profile, updateProfile, loading } = useAuth()
  const navigate = useNavigate()
  const [showAuth, setShowAuth] = useState(false)
  const [tab, setTab] = useState('activity') // 'activity' | 'settings'

  // Activity data
  const [votes, setVotes] = useState([])
  const [preds, setPreds] = useState([])
  const [ratings, setRatings] = useState([])
  const [dataLoading, setDataLoading] = useState(true)

  // Settings edit state
  const [editUsername, setEditUsername] = useState('')
  const [editTeam, setEditTeam] = useState('')
  const [editDriver, setEditDriver] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username || '')
      setEditTeam(profile.fav_team || '')
      setEditDriver(profile.fav_driver || '')
    }
  }, [profile])

  useEffect(() => {
    if (!user) { setDataLoading(false); return }
    Promise.all([
      supabase.from('votes').select('race_name, driver_code').eq('user_id', user.id).order('race_name'),
      supabase.from('predictions').select('race_name, p1, p2, p3').eq('user_id', user.id).order('race_name'),
      supabase.from('ratings').select('driver_code, rating, year').eq('user_id', user.id).order('year', { ascending: false }),
    ]).then(([v, p, r]) => {
      setVotes(v.data || [])
      setPreds(p.data || [])
      setRatings(r.data || [])
      setDataLoading(false)
    })
  }, [user])

  async function handleSaveSettings() {
    setSaving(true); setSaveMsg(''); setSaveErr('')
    const u = editUsername.trim()
    if (!u || u.length < 3) { setSaveErr('Username must be at least 3 characters.'); setSaving(false); return }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { setSaveErr('Only letters, numbers, and underscores.'); setSaving(false); return }
    const { error } = await updateProfile({ username: u, fav_team: editTeam, fav_driver: editDriver })
    if (error) setSaveErr(error.message?.includes('unique') ? 'Username already taken.' : error.message)
    else setSaveMsg('Profile updated!')
    setSaving(false)
    setTimeout(() => setSaveMsg(''), 3000)
  }

  const totalPoints = votes.length * 1 + preds.length * 2 + ratings.length * 0.5
  const color = teamColor(profile?.fav_team)

  if (!loading && !user) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <Helmet><title>My Profile — PitWall</title></Helmet>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Sign in to see your profile</div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>Your votes, predictions, and ratings all in one place</div>
        <button onClick={() => setShowAuth(true)} style={{ background: '#e10600', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Sign In</button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  return (
    <div style={{ padding: '20px 16px', maxWidth: '760px', margin: '0 auto', minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)' }}>
      <Helmet><title>{profile?.username ? `${profile.username} — PitWall` : 'My Profile — PitWall'}</title></Helmet>

      {/* Profile Hero */}
      <div style={{ ...card, marginBottom: '20px', padding: '24px', position: 'relative', overflow: 'hidden' }}>
        {/* Background glow */}
        <div style={{ position: 'absolute', top: 0, right: 0, width: '200px', height: '200px', background: `radial-gradient(circle, ${color}18, transparent 70%)`, pointerEvents: 'none' }} />

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: '64px', height: '64px', borderRadius: '50%', flexShrink: 0,
            background: `linear-gradient(135deg, ${color}, ${color}99)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '24px', fontWeight: '900', color: '#fff',
            boxShadow: `0 0 24px ${color}44`,
            border: `3px solid ${color}33`,
          }}>
            {profile?.username?.[0]?.toUpperCase() || user?.email?.[0]?.toUpperCase() || '?'}
          </div>

          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '22px', fontWeight: '900', color: '#fff', letterSpacing: '-0.4px' }}>
              {profile?.username || 'Set a username'}
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>{user?.email}</div>
            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {profile?.fav_team && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: `${color}15`, border: `0.5px solid ${color}44`, borderRadius: '20px', padding: '3px 10px' }}>
                  <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                  <span style={{ fontSize: '11px', color: color, fontWeight: '700' }}>{profile.fav_team}</span>
                </div>
              )}
              {profile?.fav_driver && (
                <div style={{ background: 'rgba(255,255,255,0.05)', border: '0.5px solid #2a2a2a', borderRadius: '20px', padding: '3px 10px' }}>
                  <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '600' }}>Driver: {profile.fav_driver}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px', marginTop: '20px', paddingTop: '20px', borderTop: '0.5px solid #1a1a1a' }}>
          {[
            { label: 'Paddock Points', value: totalPoints.toFixed(0), icon: '⭐' },
            { label: 'DOTD Votes', value: votes.length, icon: '🏆' },
            { label: 'Predictions', value: preds.length, icon: '🔮' },
            { label: 'Driver Ratings', value: ratings.length, icon: '⭐' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff' }}>{s.value}</div>
              <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '6px', marginBottom: '18px' }}>
        {[{ id: 'activity', label: '📋 Activity' }, { id: 'settings', label: '⚙️ Settings' }].map(t => (
          <button key={t.id} onClick={() => setTab(t.id)} style={{
            background: tab === t.id ? '#e10600' : 'var(--bg-card)',
            border: `0.5px solid ${tab === t.id ? '#e10600' : 'var(--border-input)'}`,
            borderRadius: '8px', color: tab === t.id ? '#fff' : 'var(--text-secondary)',
            padding: '8px 16px', fontSize: '13px', fontWeight: tab === t.id ? '700' : '400', cursor: 'pointer',
          }}>{t.label}</button>
        ))}
      </div>

      {/* Activity Tab */}
      {tab === 'activity' && (
        <div>
          {dataLoading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading your activity...</div>
          ) : (
            <>
              {/* DOTD Votes */}
              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>🏆 Driver of the Day Votes</div>
                {votes.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#555' }}>No votes yet — head to The Paddock to vote!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {votes.map((v, i) => {
                      const driver = DRIVERS_NOW.find(d => d.code === v.driver_code)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', color: '#777' }}>{v.race_name.replace(' Grand Prix', ' GP')}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '12px', fontWeight: '700', color: '#e10600' }}>{v.driver_code}</span>
                            {driver && <span style={{ fontSize: '11px', color: '#555' }}>{driver.name.split(' ').slice(1).join(' ')}</span>}
                            <span style={{ fontSize: '11px' }}>🔒</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>

              {/* Predictions */}
              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>🔮 Podium Predictions</div>
                {preds.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#555' }}>No predictions yet — lock in your picks in The Paddock!</div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {preds.map((p, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{p.race_name.replace(' Grand Prix', ' GP')}</span>
                          <span>🔒 Locked</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {[['🥇', p.p1], ['🥈', p.p2], ['🥉', p.p3]].map(([m, c], j) => (
                            <span key={j} style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{m} {c}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Ratings */}
              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>⭐ Driver Ratings</div>
                {ratings.length === 0 ? (
                  <div style={{ fontSize: '13px', color: '#555' }}>No ratings yet — rate drivers in The Paddock!</div>
                ) : (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ratings.map((r, i) => (
                      <div key={i} style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#e10600' }}>{r.driver_code}</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>{r.year}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{r.rating}/10</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div style={card}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '18px' }}>Edit Profile</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '6px' }}>Username</label>
              <input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="your_username" maxLength={20}
                style={inputStyle}
                onFocus={e => e.target.style.borderColor = '#e10600'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Favourite Team</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(110px, 1fr))', gap: '6px' }}>
                {F1_TEAMS.map(t => {
                  const sel = editTeam === t.id
                  return (
                    <button key={t.id} onClick={() => setEditTeam(t.id)} style={{
                      background: sel ? `${t.color}18` : '#141414',
                      border: `1.5px solid ${sel ? t.color : '#222'}`,
                      borderRadius: '8px', padding: '8px 6px', cursor: 'pointer', textAlign: 'center',
                    }}>
                      <div style={{ width: '20px', height: '3px', background: t.color, borderRadius: '2px', margin: '0 auto 6px' }} />
                      <div style={{ fontSize: '10px', fontWeight: '700', color: sel ? t.color : '#888', lineHeight: 1.3 }}>{t.id}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Favourite Driver</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '6px' }}>
                {DRIVERS_NOW.map(d => {
                  const sel = editDriver === d.code
                  return (
                    <button key={d.code} onClick={() => setEditDriver(d.code)} style={{
                      background: sel ? 'rgba(225,6,0,0.12)' : '#141414',
                      border: `1.5px solid ${sel ? '#e10600' : '#222'}`,
                      borderRadius: '8px', padding: '8px 6px', cursor: 'pointer', textAlign: 'center',
                    }}>
                      <div style={{ fontSize: '12px', fontWeight: '800', color: sel ? '#e10600' : '#fff' }}>{d.code}</div>
                      <div style={{ fontSize: '9px', color: '#555', marginTop: '2px' }}>{d.name.split(' ').slice(1).join(' ')}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {saveErr && <div style={{ background: 'rgba(225,6,0,0.08)', border: '1px solid rgba(225,6,0,0.22)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#ff7070' }}>{saveErr}</div>}
            {saveMsg && <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#34d399' }}>✓ {saveMsg}</div>}

            <button onClick={handleSaveSettings} disabled={saving} style={{
              background: saving ? '#1a1a1a' : 'linear-gradient(135deg, #e10600, #c00500)',
              color: saving ? '#444' : '#fff', border: 'none', padding: '12px',
              borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 20px rgba(225,6,0,0.25)', transition: 'all .2s',
            }}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      )}
    </div>
  )
}
