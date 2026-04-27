import { useState, useEffect, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AuthModal from '../components/AuthModal'
import { AVATAR_OPTIONS, CREATOR_AVATAR } from '../components/OnboardingModal'
import { ALL_DRIVERS_BY_YEAR } from '../constants/driverData'
import { useCountUpOnMount } from '../utils/animations'

const CREATOR_EMAILS = new Set(['arush.bhise@gmail.com'])

const F1_TEAMS = [
  { id: 'Red Bull Racing', color: '#3671c6' }, { id: 'Ferrari', color: '#e8002d' },
  { id: 'McLaren', color: '#ff8000' }, { id: 'Mercedes', color: '#00d2be' },
  { id: 'Aston Martin', color: '#52e252' }, { id: 'Alpine', color: '#0093cc' },
  { id: 'Racing Bulls', color: '#6692ff' }, { id: 'Williams', color: '#005aff' },
  { id: 'Haas', color: '#b6babd' }, { id: 'Audi', color: '#c92d4b' },
  { id: 'Cadillac', color: '#888' },
]

const F1_CIRCUITS = [
  { id: 'Monaco', flag: '🇲🇨', nick: 'The Jewel' },
  { id: 'Spa-Francorchamps', flag: '🇧🇪', nick: 'The Cathedral' },
  { id: 'Silverstone', flag: '🇬🇧', nick: 'Home of Racing' },
  { id: 'Monza', flag: '🇮🇹', nick: 'Temple of Speed' },
  { id: 'Suzuka', flag: '🇯🇵', nick: 'The Figure Eight' },
  { id: 'Interlagos', flag: '🇧🇷', nick: 'The Cauldron' },
  { id: 'Singapore', flag: '🇸🇬', nick: 'Night Race' },
  { id: 'COTA', flag: '🇺🇸', nick: 'Circuit of the Americas' },
  { id: 'Baku', flag: '🇦🇿', nick: 'Street Fight' },
  { id: 'Abu Dhabi', flag: '🇦🇪', nick: 'Yas Marina' },
  { id: 'Melbourne', flag: '🇦🇺', nick: 'Albert Park' },
  { id: 'Bahrain', flag: '🇧🇭', nick: 'The Desert' },
  { id: 'Barcelona', flag: '🇪🇸', nick: 'Circuit de Catalunya' },
  { id: 'Hungaroring', flag: '🇭🇺', nick: 'Monaco of the East' },
  { id: 'Zandvoort', flag: '🇳🇱', nick: 'The Oranje Army' },
]

const FAN_IDENTITY = {
  'Ferrari': { label: 'Tifosi', emoji: '🔴', desc: 'You bleed red. Every race is an emotional rollercoaster.' },
  'McLaren': { label: 'McLaren Army', emoji: '🟠', desc: 'Papaya dreams. You believed before it was cool again.' },
  'Red Bull Racing': { label: 'Red Bull Faithful', emoji: '🐂', desc: 'Winning is expected. Anything less is unacceptable.' },
  'Mercedes': { label: 'Silver Arrow Supporter', emoji: '⭐', desc: 'You remember the glory days and want them back.' },
  'Aston Martin': { label: 'Green Machine Fan', emoji: '🟢', desc: 'British, stylish, and perpetually hopeful.' },
  'Alpine': { label: 'Alpine Optimist', emoji: '🔵', desc: 'You believe in the project. Always the project.' },
  'Williams': { label: 'Grove Faithful', emoji: '💙', desc: 'Historical loyalty. You remember the glory days.' },
  'Racing Bulls': { label: 'Toro Rosso Realist', emoji: '🐂', desc: 'You want a seat but not the constructor title.' },
  'Haas': { label: 'American Dreamer', emoji: '🇺🇸', desc: 'You root for the underdogs with big opinions.' },
  'Audi': { label: 'Quattro Fan', emoji: '⚙️', desc: 'You trust the German engineering will deliver.' },
  'Cadillac': { label: 'Cadillac Pioneer', emoji: '🏁', desc: 'First on the grid for a new American era.' },
}

const YEARS = Array.from({ length: 30 }, (_, i) => new Date().getFullYear() - i)

function teamColor(team) { return F1_TEAMS.find(t => t.id === team)?.color || '#e10600' }

function getActivityTags(votes, preds, ratings, hotTakesCount) {
  const tags = []
  // DOTD voting (vote = 5pts, so 20 votes = 100pts = Team Principal)
  if (votes >= 20) tags.push({ label: 'DOTD Oracle', icon: '🔮', color: '#f5c842' })
  else if (votes >= 10) tags.push({ label: 'DOTD Devotee', icon: '🗳️', color: '#00d2be' })
  else if (votes >= 3) tags.push({ label: 'Regular Voter', icon: '✅', color: '#34d399' })
  else if (votes >= 1) tags.push({ label: 'First Vote', icon: '🗳️', color: '#555' })
  // Predictions (prediction = 10pts)
  if (preds >= 10) tags.push({ label: 'Grid Guru', icon: '🎯', color: '#c0c0c0' })
  else if (preds >= 4) tags.push({ label: 'Race Prophet', icon: '🎯', color: '#8b5cf6' })
  else if (preds >= 1) tags.push({ label: 'Predictor', icon: '🎯', color: '#555' })
  // Ratings (no points — just personal fun)
  if (ratings >= 20) tags.push({ label: 'Chief Analyst', icon: '📊', color: '#f59e0b' })
  else if (ratings >= 8) tags.push({ label: 'Driver Scout', icon: '👀', color: '#6692ff' })
  // Hot takes (hot take = 3pts)
  if (hotTakesCount >= 15) tags.push({ label: 'Hot Takes Legend', icon: '🔥', color: '#ef4444' })
  else if (hotTakesCount >= 5) tags.push({ label: 'Controversialist', icon: '🌶️', color: '#f97316' })
  else if (hotTakesCount >= 1) tags.push({ label: 'Takes Haver', icon: '💬', color: '#555' })
  // Cross-category
  const diversity = [votes > 0, preds > 0, hotTakesCount > 0, ratings > 0].filter(Boolean).length
  if (diversity >= 4) tags.push({ label: 'All-Around Fan', icon: '🌍', color: '#a855f7' })
  return tags
}

function getPaddockRank(pts) {
  if (pts >= 200) return { label: 'World Champion', color: '#f5c842', icon: '👑', next: null }
  if (pts >= 100) return { label: 'Team Principal', color: '#c0c0c0', icon: '🏆', next: 200, nextLabel: 'World Champion' }
  if (pts >= 50) return { label: 'Race Engineer', color: '#cd7f32', icon: '🎧', next: 100, nextLabel: 'Team Principal' }
  if (pts >= 15) return { label: 'Junior Engineer', color: '#00d2be', icon: '🔧', next: 50, nextLabel: 'Race Engineer' }
  return { label: 'Pit Lane Visitor', color: '#666', icon: '🪪', next: 15, nextLabel: 'Junior Engineer' }
}

function Avatar({ profile, size = 64, fontSize }) {
  const [hov, setHov] = useState(false)
  const color = teamColor(profile?.fav_team)
  const label = profile?.username?.[0]?.toUpperCase() || '?'
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: `linear-gradient(135deg, ${color}, ${color}99)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: profile?.avatar ? (fontSize || size * 0.45) : (fontSize || size * 0.35),
        fontWeight: '800', color: '#fff',
        boxShadow: hov
          ? `0 0 0 3px ${color}, 0 0 ${size * 0.5}px ${color}66`
          : `0 0 ${size * 0.4}px ${color}44`,
        border: `${size * 0.04}px solid ${color}33`,
        transition: 'box-shadow 0.3s ease',
        cursor: 'default',
      }}>
      {profile?.avatar || label}
    </div>
  )
}

const card = { background: 'var(--bg-card)', border: '0.5px solid var(--border-subtle)', borderRadius: '12px', padding: '18px', marginBottom: '12px' }
const inputStyle = { width: '100%', boxSizing: 'border-box', background: '#141414', border: '1.5px solid #222', borderRadius: '8px', color: '#fff', padding: '10px 12px', fontSize: '14px', outline: 'none' }

const YEAR = String(new Date().getFullYear())
const DRIVERS_NOW = ALL_DRIVERS_BY_YEAR[YEAR] || ALL_DRIVERS_BY_YEAR['2025'] || []

export default function Profile() {
  const { user, profile, updateProfile, loading } = useAuth()
  const [showAuth, setShowAuth] = useState(false)
  const [tab, setTab] = useState('activity')

  const [votes, setVotes] = useState([])
  const [preds, setPreds] = useState([])
  const [ratings, setRatings] = useState([])
  const [hotTakesCount, setHotTakesCount] = useState(0)
  const [dataLoading, setDataLoading] = useState(true)

  const [barWidth, setBarWidth] = useState(0)
  const [editUsername, setEditUsername] = useState('')
  const [editAvatar, setEditAvatar] = useState('')
  const [editTeam, setEditTeam] = useState('')
  const [editDriver, setEditDriver] = useState('')
  const [editCircuit, setEditCircuit] = useState('')
  const [editFanSince, setEditFanSince] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')
  const [saveErr, setSaveErr] = useState('')

  useEffect(() => {
    if (profile) {
      setEditUsername(profile.username || '')
      setEditAvatar(profile.avatar || '')
      setEditTeam(profile.fav_team || '')
      setEditDriver(profile.fav_driver || '')
      setEditCircuit(profile.fav_circuit || '')
      setEditFanSince(profile.fan_since ? String(profile.fan_since) : '')
    }
  }, [profile])

  // Animate progress bar after data loads
  useEffect(() => {
    if (dataLoading) return
    const rank = getPaddockRank(votes.length * 5 + preds.length * 10 + hotTakesCount * 3)
    if (!rank.next) return
    const target = Math.min(100, ((votes.length * 5 + preds.length * 10 + hotTakesCount * 3) / rank.next) * 100)
    const timer = setTimeout(() => setBarWidth(target), 400)
    return () => clearTimeout(timer)
  }, [dataLoading, votes.length, preds.length, hotTakesCount])

  useEffect(() => {
    if (!user) { setDataLoading(false); return }
    Promise.all([
      supabase.from('votes').select('race_name, driver_code').eq('user_id', user.id).order('race_name'),
      supabase.from('predictions').select('race_name, p1, p2, p3').eq('user_id', user.id).order('race_name'),
      supabase.from('ratings').select('driver_code, rating, year').eq('user_id', user.id).order('year', { ascending: false }),
      supabase.from('hot_takes').select('id', { count: 'exact', head: true }).eq('user_id', user.id),
    ]).then(([v, p, r, ht]) => {
      setVotes(v.data || [])
      setPreds(p.data || [])
      setRatings(r.data || [])
      setHotTakesCount(ht.count || 0)
      setDataLoading(false)
    })
  }, [user])

  async function handleSave() {
    setSaving(true); setSaveMsg(''); setSaveErr('')
    const u = editUsername.trim()
    if (!u || u.length < 3) { setSaveErr('Username must be at least 3 characters.'); setSaving(false); return }
    if (!/^[a-zA-Z0-9_]+$/.test(u)) { setSaveErr('Only letters, numbers, and underscores.'); setSaving(false); return }
    const { error } = await updateProfile({
      username: u,
      avatar: editAvatar || null,
      fav_team: editTeam || null,
      fav_driver: editDriver || null,
      fav_circuit: editCircuit || null,
      fan_since: editFanSince ? parseInt(editFanSince) : null,
    })
    if (error) setSaveErr(error.message?.includes('unique') ? 'Username already taken.' : error.message)
    else { setSaveMsg('Profile updated!'); setTimeout(() => setSaveMsg(''), 3000) }
    setSaving(false)
  }

  if (!loading && !user) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center' }}>
        <Helmet><title>My Profile — PitWall</title></Helmet>
        <div style={{ fontSize: '48px', marginBottom: '16px' }}>👤</div>
        <div style={{ fontSize: '24px', fontWeight: '800', color: '#fff', marginBottom: '8px' }}>Sign in to see your profile</div>
        <div style={{ fontSize: '13px', color: '#555', marginBottom: '24px' }}>Your votes, predictions, ratings and rank all in one place</div>
        <button onClick={() => setShowAuth(true)} style={{ background: '#e10600', color: '#fff', border: 'none', padding: '12px 32px', borderRadius: '10px', fontSize: '15px', fontWeight: '700', cursor: 'pointer' }}>Sign In</button>
        {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      </div>
    )
  }

  const totalPoints = votes.length * 5 + preds.length * 10 + hotTakesCount * 3
  // Animated counters for stats — count up when data loads
  const animPts = useCountUpOnMount(dataLoading ? 0 : totalPoints, 900, 300)
  const animVotes = useCountUpOnMount(dataLoading ? 0 : votes.length, 700, 400)
  const animPreds = useCountUpOnMount(dataLoading ? 0 : preds.length, 700, 500)
  const animRatings = useCountUpOnMount(dataLoading ? 0 : ratings.length, 700, 600)
  const rank = getPaddockRank(totalPoints)
  const color = teamColor(profile?.fav_team)
  const fanId = profile?.fav_team ? FAN_IDENTITY[profile.fav_team] : null
  const circuit = F1_CIRCUITS.find(c => c.id === profile?.fav_circuit)
  const isCreator = CREATOR_EMAILS.has(user?.email)
  const activityTags = getActivityTags(votes.length, preds.length, ratings.length, hotTakesCount)

  return (
    <div style={{ padding: '20px 16px', maxWidth: '760px', margin: '0 auto', minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)' }}>
      <Helmet><title>{profile?.username ? `${profile.username} — PitWall` : 'My Profile — PitWall'}</title></Helmet>
      <style>{`
        @keyframes popIn { 0%{opacity:0;transform:scale(0.7)} 65%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ribbonFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
      `}</style>

      {/* Hero card */}
      <div style={{ position: 'relative', overflow: 'hidden', marginBottom: '16px', borderRadius: '16px', background: 'var(--bg-card)', border: '0.5px solid var(--border-subtle)' }}>
        {/* Team color gradient header banner */}
        <div style={{
          height: '80px',
          background: `linear-gradient(135deg, ${color}40 0%, ${color}18 50%, transparent 100%)`,
          borderBottom: `0.5px solid ${color}25`,
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* Racing stripes */}
          <div style={{ position: 'absolute', inset: 0, background: `repeating-linear-gradient(135deg, transparent, transparent 20px, ${color}06 20px, ${color}06 21px)` }} />
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color} 0%, ${color}55 40%, transparent 100%)` }} />
          {/* Corner decoration */}
          <div style={{ position: 'absolute', top: '12px', right: '16px', fontFamily: "'Space Mono', monospace", fontSize: '9px', color: `${color}66`, letterSpacing: '2px', textTransform: 'uppercase' }}>F1 Fan Profile</div>
        </div>

        <div style={{ padding: '0 22px 22px' }}>
          {/* Avatar overlapping the banner */}
          <div style={{ marginTop: '-36px', marginBottom: '14px', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px' }}>
            <Avatar profile={profile} size={72} />
            {/* Points chip */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: `${rank.color}15`, border: `0.5px solid ${rank.color}44`, borderRadius: '20px', padding: '6px 14px' }}>
              <span style={{ fontSize: '14px' }}>{rank.icon}</span>
              <div>
                <div style={{ fontSize: '11px', fontWeight: '800', color: rank.color }}>{rank.label}</div>
                <div style={{ fontSize: '9px', color: '#444', marginTop: '1px', fontFamily: "'Space Mono', monospace" }}>{animPts} pts</div>
              </div>
            </div>
          </div>

          {/* Name + badges */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap', marginBottom: '4px' }}>
            <div style={{ fontSize: '24px', fontWeight: '900', color: '#fff', letterSpacing: '-0.5px' }}>
              {profile?.username || 'Set a username'}
            </div>
            {/* Creator badge */}
            {isCreator && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'linear-gradient(135deg, rgba(225,6,0,0.18), rgba(245,200,66,0.1))', border: '0.5px solid rgba(245,200,66,0.55)', borderRadius: '20px', padding: '3px 12px', boxShadow: '0 0 14px rgba(245,200,66,0.2)' }}>
                <span style={{ fontSize: '11px' }}>🛠️</span>
                <span style={{ fontSize: '10px', fontWeight: '800', background: 'linear-gradient(90deg, #e10600, #f5c842, #e10600)', backgroundSize: '200% 100%', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', animation: 'ribbonFlow 2.5s ease infinite' }}>Creator</span>
              </div>
            )}
          </div>
          <div style={{ fontSize: '11px', color: '#3a3a3a', marginBottom: '12px' }}>{user?.email}</div>

          {/* Identity tags */}
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
            {profile?.fav_team && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '5px', background: `${color}18`, border: `0.5px solid ${color}44`, borderRadius: '20px', padding: '4px 12px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                <span style={{ fontSize: '11px', color: color, fontWeight: '700' }}>{profile.fav_team}</span>
              </div>
            )}
            {profile?.fav_driver && (
              <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '20px', padding: '4px 12px' }}>
                <span style={{ fontSize: '11px', color: '#aaa', fontWeight: '600', fontFamily: "'Space Mono', monospace" }}>#{profile.fav_driver}</span>
              </div>
            )}
            {circuit && (
              <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '20px', padding: '4px 12px' }}>
                <span style={{ fontSize: '11px', color: '#888' }}>{circuit.flag} {circuit.id}</span>
              </div>
            )}
            {profile?.fan_since && (
              <div style={{ background: '#1a1a1a', border: '0.5px solid #2a2a2a', borderRadius: '20px', padding: '4px 12px' }}>
                <span style={{ fontSize: '11px', color: '#555' }}>Since {profile.fan_since}</span>
              </div>
            )}
          </div>

          {/* Activity achievement tags */}
          {!dataLoading && activityTags.length > 0 && (
            <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap', marginBottom: '12px' }}>
              {activityTags.map((tag, idx) => (
                <div key={tag.label} title={tag.label} style={{
                  display: 'flex', alignItems: 'center', gap: '4px',
                  background: `${tag.color}12`, border: `0.5px solid ${tag.color}44`,
                  borderRadius: '20px', padding: '3px 9px',
                  opacity: 0,
                  animation: `popIn 0.35s cubic-bezier(0.34,1.56,0.64,1) forwards`,
                  animationDelay: `${idx * 0.07 + 0.1}s`,
                }}>
                  <span style={{ fontSize: '10px' }}>{tag.icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: '700', color: tag.color }}>{tag.label}</span>
                </div>
              ))}
            </div>
          )}

          {/* Fan identity banner */}
          {fanId && (
            <div style={{ padding: '10px 14px', background: `${color}0d`, border: `0.5px solid ${color}25`, borderRadius: '10px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <div style={{ fontSize: '20px', flexShrink: 0 }}>{fanId.emoji}</div>
              <div>
                <div style={{ fontSize: '12px', fontWeight: '700', color: color }}>{fanId.label}</div>
                <div style={{ fontSize: '11px', color: '#444', marginTop: '1px' }}>{fanId.desc}</div>
              </div>
            </div>
          )}

        {/* Stats row */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '8px', marginTop: '20px', paddingTop: '18px', borderTop: '0.5px solid #1a1a1a' }}>
          {[
            { label: 'Paddock Pts', value: animPts, icon: rank.icon, color: rank.color },
            { label: 'DOTD Votes', value: animVotes, icon: '🏆', color: '#e10600' },
            { label: 'Predictions', value: animPreds, icon: '🔮', color: '#6692ff' },
            { label: 'Ratings', value: animRatings, icon: '⭐', color: '#f5c842' },
          ].map(s => (
            <div key={s.label} style={{ textAlign: 'center', padding: '12px 4px', background: 'rgba(255,255,255,0.025)', borderRadius: '10px', border: '0.5px solid rgba(255,255,255,0.05)', transition: 'all 0.2s' }}
              onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = `${s.color}33` }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.025)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
            >
              <div style={{ fontSize: '18px', marginBottom: '3px' }}>{s.icon}</div>
              <div style={{ fontSize: '22px', fontWeight: '900', color: s.color, fontFamily: "'Space Mono', monospace" }}>{s.value}</div>
              <div style={{ fontSize: '9px', color: '#444', marginTop: '3px', textTransform: 'uppercase', letterSpacing: '0.7px' }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Rank progress */}
        {rank.next !== null && (
          <div style={{ marginTop: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: '#444', marginBottom: '6px' }}>
              <span>{rank.icon} {rank.label}</span>
              <span>{Math.max(0, rank.next - totalPoints)} pts to {rank.nextLabel}</span>
            </div>
            <div style={{ height: '5px', background: '#1a1a1a', borderRadius: '3px', overflow: 'visible', position: 'relative' }}>
              <div style={{
                height: '100%', borderRadius: '3px',
                width: `${barWidth}%`,
                background: `linear-gradient(90deg, ${rank.color}bb, ${rank.color}, ${color})`,
                backgroundSize: '200% 100%',
                animation: 'ribbonFlow 2s ease infinite',
                transition: 'width 1.2s cubic-bezier(0.16,1,0.3,1)',
                boxShadow: `0 0 8px ${rank.color}66`,
                position: 'relative',
              }}>
                <div style={{ position: 'absolute', right: '-3px', top: '50%', transform: 'translateY(-50%)', width: '8px', height: '8px', borderRadius: '50%', background: rank.color, boxShadow: `0 0 8px ${rank.color}, 0 0 16px ${rank.color}88`, opacity: barWidth > 2 ? 1 : 0, transition: 'opacity 0.5s 0.8s' }} />
              </div>
            </div>
          </div>
        )}
        </div>{/* closes padding div */}
      </div>{/* closes outer hero card */}

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
            <div style={{ textAlign: 'center', padding: '40px', color: '#555' }}>Loading...</div>
          ) : (
            <>
              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>🏆 Driver of the Day Votes</div>
                {votes.length === 0
                  ? <div style={{ fontSize: '13px', color: '#555' }}>No votes yet — head to The Paddock!</div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {votes.map((v, i) => {
                      const driver = DRIVERS_NOW.find(d => d.code === v.driver_code)
                      return (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                          <div style={{ fontSize: '12px', color: '#555' }}>{v.race_name.replace(' Grand Prix', ' GP')}</div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '13px', fontWeight: '800', color: '#e10600' }}>{v.driver_code}</span>
                            {driver && <span style={{ fontSize: '11px', color: '#555' }}>{driver.name.split(' ').slice(1).join(' ')}</span>}
                            <span>🔒</span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                }
              </div>

              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>🔮 Podium Predictions</div>
                {preds.length === 0
                  ? <div style={{ fontSize: '13px', color: '#555' }}>No predictions yet — lock in your picks!</div>
                  : <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {preds.map((p, i) => (
                      <div key={i} style={{ padding: '10px 12px', background: 'var(--bg-input)', borderRadius: '8px' }}>
                        <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px', display: 'flex', justifyContent: 'space-between' }}>
                          <span>{p.race_name.replace(' Grand Prix', ' GP')}</span><span>🔒</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                          {[['🥇', p.p1], ['🥈', p.p2], ['🥉', p.p3]].map(([m, c], j) => (
                            <span key={j} style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{m} {c}</span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                }
              </div>

              <div style={card}>
                <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '12px' }}>⭐ Driver Ratings</div>
                {ratings.length === 0
                  ? <div style={{ fontSize: '13px', color: '#555' }}>No ratings yet — rate drivers in The Paddock!</div>
                  : <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                    {ratings.map((r, i) => (
                      <div key={i} style={{ background: 'var(--bg-input)', borderRadius: '8px', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: '#e10600' }}>{r.driver_code}</span>
                        <span style={{ fontSize: '11px', color: '#555' }}>{r.year}</span>
                        <span style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>{r.rating}/10</span>
                      </div>
                    ))}
                  </div>
                }
              </div>
            </>
          )}
        </div>
      )}

      {/* Settings Tab */}
      {tab === 'settings' && (
        <div style={card}>
          <div style={{ fontSize: '14px', fontWeight: '700', color: '#fff', marginBottom: '20px' }}>Edit Profile</div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {/* Username */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '6px' }}>Username</label>
              <input value={editUsername} onChange={e => setEditUsername(e.target.value)} placeholder="your_username" maxLength={20}
                style={inputStyle} onFocus={e => e.target.style.borderColor = '#e10600'} onBlur={e => e.target.style.borderColor = '#222'} />
            </div>

            {/* Avatar */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Avatar emoji</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(10, 1fr)', gap: '6px', marginBottom: '8px' }}>
                <button onClick={() => setEditAvatar('')} style={{
                  height: '40px', background: !editAvatar ? 'rgba(225,6,0,0.12)' : '#141414',
                  border: `1.5px solid ${!editAvatar ? '#e10600' : '#222'}`,
                  borderRadius: '8px', fontSize: '10px', color: !editAvatar ? '#e10600' : '#555',
                  cursor: 'pointer', fontWeight: '700',
                }}>A</button>
                {AVATAR_OPTIONS.map(emoji => (
                  <button key={emoji} onClick={() => setEditAvatar(emoji)} style={{
                    height: '40px', background: editAvatar === emoji ? 'rgba(225,6,0,0.12)' : '#141414',
                    border: `1.5px solid ${editAvatar === emoji ? '#e10600' : '#222'}`,
                    borderRadius: '8px', fontSize: '20px', cursor: 'pointer', transition: 'all .1s',
                  }}>{emoji}</button>
                ))}
                {isCreator && (
                  <button onClick={() => setEditAvatar(CREATOR_AVATAR)} title="Creator exclusive" style={{
                    height: '40px', background: editAvatar === CREATOR_AVATAR ? 'rgba(245,200,66,0.15)' : 'rgba(245,200,66,0.04)',
                    border: `1.5px solid ${editAvatar === CREATOR_AVATAR ? '#f5c842' : 'rgba(245,200,66,0.25)'}`,
                    borderRadius: '8px', fontSize: '20px', cursor: 'pointer', transition: 'all .1s',
                    boxShadow: '0 0 8px rgba(245,200,66,0.1)',
                  }}>{CREATOR_AVATAR}</button>
                )}
              </div>
              <div style={{ fontSize: '11px', color: '#444' }}>Select "A" to use your initial instead</div>
            </div>

            {/* Fan since */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '6px' }}>F1 fan since</label>
              <select value={editFanSince} onChange={e => setEditFanSince(e.target.value)} style={{ ...inputStyle, cursor: 'pointer' }}>
                <option value="">Select year</option>
                {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>

            {/* Favourite circuit */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Favourite circuit</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '6px' }}>
                {F1_CIRCUITS.map(c => {
                  const sel = editCircuit === c.id
                  return (
                    <button key={c.id} onClick={() => setEditCircuit(sel ? '' : c.id)} style={{
                      background: sel ? 'rgba(225,6,0,0.1)' : '#141414',
                      border: `1.5px solid ${sel ? '#e10600' : '#222'}`,
                      borderRadius: '8px', padding: '8px 10px', cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                    }}>
                      <div style={{ fontSize: '16px', marginBottom: '3px' }}>{c.flag}</div>
                      <div style={{ fontSize: '11px', fontWeight: '700', color: sel ? '#e10600' : '#aaa' }}>{c.id}</div>
                      <div style={{ fontSize: '9px', color: '#444', marginTop: '1px' }}>{c.nick}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Favourite team */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Favourite team</label>
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
                      <div style={{ fontSize: '10px', fontWeight: '700', color: sel ? t.color : '#888' }}>{t.id}</div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Favourite driver */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Favourite driver</label>
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

            <button onClick={handleSave} disabled={saving} style={{
              background: saving ? '#1a1a1a' : 'linear-gradient(135deg, #e10600, #c00500)',
              color: saving ? '#444' : '#fff', border: 'none', padding: '13px',
              borderRadius: '10px', fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
              boxShadow: saving ? 'none' : '0 4px 20px rgba(225,6,0,0.25)', transition: 'all .2s',
            }}>{saving ? 'Saving…' : 'Save Changes'}</button>
          </div>
        </div>
      )}
    </div>
  )
}

export { Avatar }
