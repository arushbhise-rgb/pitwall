import { useState, useEffect, useCallback, useRef } from 'react'
import { Helmet } from 'react-helmet-async'
import { API } from '../config'
import { ALL_DRIVERS_BY_YEAR, DRIVER_COLORS_BY_YEAR } from '../constants/driverData'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import AuthModal from '../components/AuthModal'
import { spawnConfetti } from '../utils/animations'

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

// Points system
export const PTS = { vote: 5, prediction: 10, hotTake: 3 }

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

function PaddockAvatar({ profile, size = 36 }) {
  const color = profile?.fav_team ? (TEAM_COLORS[profile.fav_team] || '#e10600') : '#e10600'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: `linear-gradient(135deg, ${color}, ${color}99)`,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: profile?.avatar ? size * 0.48 : size * 0.37,
      fontWeight: '800', color: '#fff',
      boxShadow: `0 0 ${size * 0.35}px ${color}33`,
    }}>
      {profile?.avatar || profile?.username?.[0]?.toUpperCase() || '?'}
    </div>
  )
}

function SkeletonCard() {
  const shimmer = {
    background: 'linear-gradient(90deg, #111 0%, #1e1e1e 40%, #252525 50%, #1e1e1e 60%, #111 100%)',
    backgroundSize: '200% 100%',
    animation: 'shimmerSlide 1.5s ease-in-out infinite',
    borderRadius: '8px',
  }
  return (
    <div style={{ background: 'rgba(255,255,255,0.02)', border: '0.5px solid rgba(255,255,255,0.05)', borderRadius: '14px', padding: '18px', marginBottom: '10px' }}>
      <div style={{ ...shimmer, height: '15px', width: '55%', marginBottom: '10px' }} />
      <div style={{ ...shimmer, height: '11px', width: '38%' }} />
    </div>
  )
}

function F1NewsPanel() {
  const [news, setNews] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(0)
  const [collapsed, setCollapsed] = useState(false)
  const PAGE_SIZE = 4

  useEffect(() => {
    fetch(`${API}/news/f1`)
      .then(r => r.json())
      .then(d => { setNews(d.news || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [])

  const formatDate = (str) => {
    if (!str) return ''
    try { return new Date(str).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) }
    catch { return '' }
  }

  const totalPages = Math.max(1, Math.ceil(news.length / PAGE_SIZE))
  const pageItems = news.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE)
  const featured = pageItems[0]
  const rest = pageItems.slice(1)

  const shimmer = {
    background: 'linear-gradient(90deg,#111 0%,#1e1e1e 40%,#252525 50%,#1e1e1e 60%,#111 100%)',
    backgroundSize: '200% 100%',
    animation: 'pwShimmer 1.4s ease-in-out infinite',
  }

  if (!loading && news.length === 0) return null

  return (
    <div style={{ borderBottom: '0.5px solid #1a1a1a', background: 'rgba(255,255,255,0.02)' }}>
      <style>{`
        @keyframes pwShimmer{0%{background-position:-200% 0}100%{background-position:200% 0}}
        @keyframes pwNewsIn{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
      `}</style>

      {/* Header bar */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '10px 20px', borderBottom: collapsed ? 'none' : '0.5px solid rgba(255,255,255,0.04)',
        background: 'rgba(0,0,0,0.3)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#e10600', boxShadow: '0 0 8px rgba(225,6,0,0.8)' }} />
          <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '2px', textTransform: 'uppercase', color: '#e10600', fontWeight: '700' }}>F1 News</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {!collapsed && (
            <div style={{ display: 'flex', gap: '4px' }}>
              <button onClick={() => setPage(p => Math.max(0, p - 1))} disabled={page === 0} style={{
                width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '5px', color: page === 0 ? '#333' : '#888', fontSize: '11px', cursor: page === 0 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
              }}>←</button>
              <button onClick={() => setPage(p => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} style={{
                width: '24px', height: '24px', background: 'rgba(255,255,255,0.05)', border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '5px', color: page >= totalPages - 1 ? '#333' : '#888', fontSize: '11px', cursor: page >= totalPages - 1 ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'all .15s',
              }}>→</button>
            </div>
          )}
          <button onClick={() => setCollapsed(c => !c)} style={{
            background: 'none', border: 'none', cursor: 'pointer',
            fontSize: '10px', color: '#444', fontFamily: "'Space Mono', monospace",
            letterSpacing: '1px', padding: '4px 8px', borderRadius: '4px',
            transition: 'color .15s',
          }}
            onMouseEnter={e => e.currentTarget.style.color = '#888'}
            onMouseLeave={e => e.currentTarget.style.color = '#444'}
          >{collapsed ? '▼ F1 News' : '▲ Hide'}</button>
        </div>
      </div>

      {/* Panel body */}
      {!collapsed && (
        <div style={{ padding: '16px 20px' }}>
          {loading ? (
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <div style={{ ...shimmer, height: '160px', borderRadius: '12px', flex: '1 1 280px', minWidth: '220px' }} />
              <div style={{ display: 'flex', gap: '10px', flex: '2 1 400px', overflowX: 'auto' }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ ...shimmer, height: '160px', borderRadius: '10px', minWidth: '160px', flex: '1 1 160px' }} />
                ))}
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {/* Featured article */}
              {featured && (
                <a href={featured.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: '1 1 260px', minWidth: '220px', maxWidth: '340px', animation: 'pwNewsIn .3s ease forwards' }}>
                  <div style={{
                    background: 'rgba(255,255,255,0.03)', border: '0.5px solid rgba(255,255,255,0.07)',
                    borderRadius: '12px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s', height: '100%',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  >
                    {featured.thumbnail && (
                      <div style={{ height: '160px', overflow: 'hidden', background: '#111' }}>
                        <img src={featured.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }}
                          onError={e => { e.target.parentElement.style.display = 'none' }} />
                      </div>
                    )}
                    <div style={{ padding: '14px' }}>
                      <div style={{ fontSize: '16px', fontWeight: '700', color: '#eee', lineHeight: 1.35, marginBottom: '8px', fontFamily: "'Outfit', sans-serif", display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                        {featured.title}
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span style={{ fontSize: '10px', color: '#444', fontFamily: "'Space Mono', monospace" }}>{formatDate(featured.pubDate)}</span>
                        <span style={{ fontSize: '11px', color: '#e10600', fontWeight: '700' }}>Read →</span>
                      </div>
                    </div>
                  </div>
                </a>
              )}

              {/* Smaller article cards */}
              <div style={{ flex: '2 1 380px', display: 'flex', gap: '10px', overflowX: 'auto', paddingBottom: '4px', scrollbarWidth: 'none' }}>
                {rest.map((item, i) => (
                  <a key={i} href={item.link} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', flex: '0 0 170px', animation: `pwNewsIn .3s ease ${(i + 1) * 0.07}s forwards`, opacity: 0 }}>
                    <div style={{
                      background: 'rgba(255,255,255,0.025)', border: '0.5px solid rgba(255,255,255,0.06)',
                      borderRadius: '10px', overflow: 'hidden', cursor: 'pointer', transition: 'all .2s', height: '100%',
                    }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.35)'; e.currentTarget.style.background = 'rgba(255,255,255,0.045)' }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)'; e.currentTarget.style.background = 'rgba(255,255,255,0.025)' }}
                    >
                      {item.thumbnail && (
                        <div style={{ height: '90px', overflow: 'hidden', background: '#111' }}>
                          <img src={item.thumbnail} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.85 }}
                            onError={e => { e.target.parentElement.style.display = 'none' }} />
                        </div>
                      )}
                      <div style={{ padding: '10px' }}>
                        <div style={{ fontSize: '12px', fontWeight: '600', color: '#ccc', lineHeight: 1.35, marginBottom: '6px', fontFamily: "'Outfit', sans-serif", display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {item.title}
                        </div>
                        <div style={{ fontSize: '9px', color: '#333', fontFamily: "'Space Mono', monospace" }}>{formatDate(item.pubDate)}</div>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function Community() {
  const [tab, setTab] = useState('dotd')
  const [showAuth, setShowAuth] = useState(false)
  const { user, loading } = useAuth()

  const tabs = [
    { id: 'dotd', label: '🏆', full: 'Driver of the Day' },
    { id: 'predict', label: '🔮', full: 'Predictions' },
    { id: 'rate', label: '⭐', full: 'Driver Ratings' },
    { id: 'hottakes', label: '🔥', full: 'Hot Takes' },
    { id: 'discuss', label: '💬', full: 'Discuss' },
    { id: 'leaderboard', label: '🥇', full: 'Leaderboard' },
  ]

  if (!loading && !user) {
    return (
      <div style={{ minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <Helmet><title>The Paddock — PitWall</title></Helmet>
        <div style={{ position: 'absolute', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(225,6,0,0.06), transparent 65%)', pointerEvents: 'none', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }} />
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundImage: 'repeating-linear-gradient(45deg, transparent, transparent 30px, rgba(225,6,0,0.015) 30px, rgba(225,6,0,0.015) 31px)', pointerEvents: 'none' }} />
        <div style={{ position: 'relative' }}>
          <div style={{ width: '72px', height: '72px', background: 'linear-gradient(135deg, #e10600, #b30500)', borderRadius: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px', margin: '0 auto 24px', boxShadow: '0 0 40px rgba(225,6,0,0.4)', animation: 'pwFloat 3s ease-in-out infinite' }}>🏁</div>
          <div style={{ fontSize: '32px', fontWeight: '900', color: '#fff', letterSpacing: '-0.8px', marginBottom: '8px' }}>The Paddock</div>
          <div style={{ fontSize: '14px', color: '#444', marginBottom: '36px', maxWidth: '360px', lineHeight: 1.7, margin: '0 auto 36px' }}>
            Vote DOTD, predict podiums, drop hot takes, and climb the leaderboard. Your F1 opinions, locked in forever.
          </div>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '36px' }}>
            {[
              { icon: '🏆', label: 'Driver of the Day', pts: '+5 pts' },
              { icon: '🔮', label: 'Race Predictions', pts: '+10 pts' },
              { icon: '🔥', label: 'Hot Takes', pts: '+3 pts' },
              { icon: '🥇', label: 'Leaderboard', pts: '' },
            ].map(f => (
              <div key={f.label} style={{ background: '#0f0f0f', border: '0.5px solid #1a1a1a', borderRadius: '12px', padding: '10px 16px', fontSize: '12px', color: '#666', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '16px' }}>{f.icon}</span>
                <span>{f.label}</span>
                {f.pts && <span style={{ color: '#e10600', fontWeight: '700', fontSize: '11px' }}>{f.pts}</span>}
              </div>
            ))}
          </div>
          <button onClick={() => setShowAuth(true)} style={{
            background: 'linear-gradient(135deg, #e10600, #c00500)', border: 'none', color: '#fff',
            padding: '15px 44px', borderRadius: '12px', fontSize: '15px', fontWeight: '800', cursor: 'pointer',
            boxShadow: '0 0 30px rgba(225,6,0,0.4)', transition: 'all 0.2s',
            letterSpacing: '-0.2px',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.04)'; e.currentTarget.style.boxShadow = '0 0 40px rgba(225,6,0,0.5)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 0 30px rgba(225,6,0,0.4)' }}
          >Enter The Paddock →</button>
        </div>
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
    <div style={{ padding: '0', maxWidth: '900px', margin: '0 auto', minHeight: 'calc(100vh - 52px)', background: 'var(--bg-primary)' }}>
      <Helmet>
        <title>The Paddock — PitWall F1 Community</title>
        <meta name="description" content="Vote Driver of the Day, make race predictions, and rate F1 drivers — The Paddock on PitWall." />
      </Helmet>

      {/* Header */}
      <div style={{ position: 'relative', overflow: 'hidden', padding: '32px 20px 24px' }}>
        {/* Background atmosphere */}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(225,6,0,0.06) 0%, transparent 60%)', pointerEvents: 'none' }} />
        <div style={{ position: 'absolute', top: 0, right: '-20px', width: '280px', height: '280px', background: 'radial-gradient(circle, rgba(225,6,0,0.1), transparent 70%)', pointerEvents: 'none' }} />
        {/* Top accent */}
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, #e10600 0%, #ff4040 30%, transparent 70%)' }} />

        <div style={{ position: 'relative' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#e10600', boxShadow: '0 0 10px rgba(225,6,0,0.9)', animation: 'pwPulse 1.5s ease-in-out infinite', flexShrink: 0 }} />
            <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '9px', color: '#e10600', letterSpacing: '2px', textTransform: 'uppercase' }}>Live Community</span>
          </div>
          <div style={{ fontSize: '36px', fontWeight: '900', color: '#fff', letterSpacing: '-1px', lineHeight: 1.1, marginBottom: '6px' }}>
            The Paddock
          </div>
          <div style={{ fontSize: '13px', color: '#444', maxWidth: '340px' }}>Your picks, locked in forever. Your legacy, earned in real time.</div>
        </div>
      </div>

      {/* News panel */}
      <F1NewsPanel />

      {/* Tabs */}
      <div style={{ padding: '0 20px 0', position: 'sticky', top: '52px', zIndex: 10, background: 'rgba(10,10,10,0.95)', backdropFilter: 'blur(16px)', WebkitBackdropFilter: 'blur(16px)', borderBottom: '0.5px solid #1a1a1a' }}>
        <div style={{ display: 'flex', gap: '0', overflowX: 'auto', scrollbarWidth: 'none' }}>
          {tabs.map(t => {
            const active = tab === t.id
            return (
              <button key={t.id} onClick={() => setTab(t.id)} style={{
                flex: '0 0 auto',
                background: 'none',
                border: 'none',
                borderBottom: active ? '2px solid #e10600' : '2px solid transparent',
                color: active ? '#fff' : '#444',
                padding: '14px 16px 12px',
                fontSize: '12px',
                fontWeight: active ? '700' : '400',
                cursor: 'pointer',
                transition: 'all .2s',
                whiteSpace: 'nowrap',
                display: 'flex', alignItems: 'center', gap: '6px',
              }}
                onMouseEnter={e => { if (!active) e.currentTarget.style.color = '#888' }}
                onMouseLeave={e => { if (!active) e.currentTarget.style.color = '#444' }}
              >
                <span>{t.label}</span>
                <span className="tab-label">{t.full}</span>
              </button>
            )
          })}
        </div>
      </div>

      <div style={{ padding: '20px 20px 40px' }}>
        {tab === 'dotd' && <DriverOfTheDay />}
        {tab === 'predict' && <RacePredictions />}
        {tab === 'rate' && <DriverRatings />}
        {tab === 'hottakes' && <HotTakes />}
        {tab === 'discuss' && <Discussions />}
        {tab === 'leaderboard' && <Leaderboard />}

        {/* What If Machine teaser — always visible */}
        <WhatIfTeaser />
      </div>

      <style>{`
        @keyframes pwPulse { 0%,100%{opacity:1} 50%{opacity:.6} }
        @keyframes pwFloat { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-6px)} }
        @keyframes pwFadeUp { from{opacity:0;transform:translateY(10px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pwSlideIn { from{opacity:0;transform:translateX(-8px)} to{opacity:1;transform:translateX(0)} }
        @keyframes pwBarFill { from{width:0} to{width:var(--target-width)} }
        @keyframes pwBounce { 0%,100%{transform:scale(1)} 50%{transform:scale(1.1)} }
        @keyframes spin { to{transform:rotate(360deg)} }
        @keyframes shimmerSlide { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
        @keyframes popIn { 0%{opacity:0;transform:scale(0.7)} 65%{transform:scale(1.08)} 100%{opacity:1;transform:scale(1)} }
        @keyframes ribbonFlow { 0%{background-position:0% 50%} 50%{background-position:100% 50%} 100%{background-position:0% 50%} }
        @keyframes borderGlow { 0%,100%{border-color:rgba(225,6,0,0.25)} 50%{border-color:rgba(225,6,0,0.7)} }
        .tab-label { display:inline }
        @media(max-width:500px){.tab-label{display:none}}
        .driver-card:hover { transform:translateY(-2px) !important; box-shadow: 0 4px 16px rgba(0,0,0,0.4) !important; }
        .pw-discuss-form { animation: pwFadeUp .25s ease; }
      `}</style>
    </div>
  )
}

// ── Discussions ──────────────────────────────────────────────────────────────
function Discussions() {
  const { user, profile } = useAuth()
  const [discussions, setDiscussions] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [posting, setPosting] = useState(false)
  const [myUpvotes, setMyUpvotes] = useState({}) // discussion_id -> true
  const [offset, setOffset] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const PAGE = 10

  const relTime = (str) => {
    if (!str) return ''
    const diff = Date.now() - new Date(str).getTime()
    const m = Math.floor(diff / 60000)
    if (m < 60) return `${m}m ago`
    const h = Math.floor(m / 60)
    if (h < 24) return `${h}h ago`
    const d = Math.floor(h / 24)
    return `${d}d ago`
  }

  async function loadDiscussions(reset = false) {
    const start = reset ? 0 : offset
    const { data } = await supabase
      .from('discussions')
      .select('*')
      .order('created_at', { ascending: false })
      .range(start, start + PAGE - 1)
    if (!data) return
    setDiscussions(prev => reset ? data : [...prev, ...data])
    setOffset(start + data.length)
    setHasMore(data.length === PAGE)
  }

  async function loadMyUpvotes() {
    if (!user) return
    const { data } = await supabase
      .from('discussion_upvotes')
      .select('discussion_id')
      .eq('user_id', user.id)
    if (data) {
      const map = {}
      data.forEach(d => { map[d.discussion_id] = true })
      setMyUpvotes(map)
    }
  }

  useEffect(() => {
    async function init() {
      setLoading(true)
      await loadDiscussions(true)
      await loadMyUpvotes()
      setLoading(false)
    }
    init()
  }, [user])

  async function submit() {
    if (!user || !title.trim() || posting) return
    setPosting(true)
    const { data, error } = await supabase.from('discussions').insert({
      user_id: user.id,
      username: profile?.username || user.email?.split('@')[0] || 'Anonymous',
      avatar: profile?.avatar || null,
      title: title.trim().slice(0, 80),
      body: body.trim().slice(0, 500),
      upvotes: 0,
    }).select().single()
    if (!error && data) {
      setDiscussions(prev => [data, ...prev])
      spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.4, '#e10600')
      setTitle('')
      setBody('')
      setShowForm(false)
    }
    setPosting(false)
  }

  async function toggleUpvote(discussion) {
    if (!user) return
    const alreadyUpvoted = myUpvotes[discussion.id]
    // Optimistic UI
    setMyUpvotes(m => {
      const next = { ...m }
      if (alreadyUpvoted) delete next[discussion.id]
      else next[discussion.id] = true
      return next
    })
    setDiscussions(prev => prev.map(d =>
      d.id === discussion.id ? { ...d, upvotes: d.upvotes + (alreadyUpvoted ? -1 : 1) } : d
    ))
    if (alreadyUpvoted) {
      await supabase.from('discussion_upvotes').delete()
        .eq('discussion_id', discussion.id).eq('user_id', user.id)
      await supabase.from('discussions').update({ upvotes: Math.max(0, discussion.upvotes - 1) })
        .eq('id', discussion.id)
    } else {
      await supabase.from('discussion_upvotes').insert({ discussion_id: discussion.id, user_id: user.id })
      await supabase.from('discussions').update({ upvotes: discussion.upvotes + 1 })
        .eq('id', discussion.id)
    }
  }

  async function loadMore() {
    setLoadingMore(true)
    await loadDiscussions(false)
    setLoadingMore(false)
  }

  return (
    <div style={{ animation: 'pwFadeUp .3s ease' }}>
      {/* Header row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
        <div>
          <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>Community Discussions</div>
          <div style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>Share thoughts, ask questions, spark debate</div>
        </div>
        {user && (
          <button onClick={() => setShowForm(s => !s)} style={{
            background: showForm ? 'rgba(225,6,0,0.15)' : 'linear-gradient(135deg,#e10600,#c00500)',
            border: showForm ? '1px solid rgba(225,6,0,0.4)' : 'none',
            color: '#fff', borderRadius: '10px', padding: '9px 18px',
            fontSize: '13px', fontWeight: '800', cursor: 'pointer', transition: 'all .2s',
          }}>
            {showForm ? '✕ Cancel' : '+ New Discussion'}
          </button>
        )}
      </div>

      {/* Inline new discussion form */}
      {showForm && user && (
        <div className="pw-discuss-form" style={{ background: '#0a0a0a', border: '0.5px solid rgba(225,6,0,0.2)', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
          <div style={{ marginBottom: '12px' }}>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Title <span style={{ color: '#333' }}>(max 80)</span></div>
            <input
              value={title}
              onChange={e => setTitle(e.target.value.slice(0, 80))}
              placeholder="What's on your mind?"
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#111', border: '1.5px solid #222', borderRadius: '8px',
                color: '#fff', padding: '10px 14px', fontSize: '14px', fontWeight: '600',
                outline: 'none', fontFamily: "'Outfit', sans-serif", transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#e10600'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
            <div style={{ fontSize: '10px', color: '#2a2a2a', marginTop: '4px', textAlign: 'right' }}>{title.length}/80</div>
          </div>
          <div style={{ marginBottom: '14px' }}>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '.5px' }}>Body <span style={{ color: '#333' }}>(optional, max 500)</span></div>
            <textarea
              value={body}
              onChange={e => setBody(e.target.value.slice(0, 500))}
              placeholder="Add more context..."
              rows={4}
              style={{
                width: '100%', boxSizing: 'border-box',
                background: '#111', border: '1.5px solid #222', borderRadius: '8px',
                color: '#fff', padding: '10px 14px', fontSize: '13px',
                outline: 'none', resize: 'none', fontFamily: "'Outfit', sans-serif", lineHeight: 1.5,
                transition: 'border-color .15s',
              }}
              onFocus={e => e.target.style.borderColor = '#e10600'}
              onBlur={e => e.target.style.borderColor = '#222'}
            />
            <div style={{ fontSize: '10px', color: '#2a2a2a', marginTop: '4px', textAlign: 'right' }}>{body.length}/500</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: '11px', color: '#333' }}>Posting as <span style={{ color: '#888' }}>{profile?.username || 'you'}</span></div>
            <button onClick={submit} disabled={!title.trim() || posting} style={{
              background: !title.trim() ? '#111' : 'linear-gradient(135deg,#e10600,#c00500)',
              color: !title.trim() ? '#333' : '#fff', border: 'none', borderRadius: '8px',
              padding: '10px 22px', fontSize: '14px', fontWeight: '800',
              cursor: title.trim() ? 'pointer' : 'not-allowed', transition: 'all .2s',
              boxShadow: title.trim() ? '0 4px 16px rgba(225,6,0,0.3)' : 'none',
            }}>
              {posting ? 'Posting…' : '💬 Post Discussion'}
            </button>
          </div>
        </div>
      )}

      {/* Not logged in CTA */}
      {!user && (
        <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px', padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
          <div style={{ fontSize: '32px', marginBottom: '10px' }}>💬</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>Join the Paddock to start a discussion</div>
          <div style={{ fontSize: '12px', color: '#444' }}>Sign in to post and upvote discussions</div>
        </div>
      )}

      {/* Feed */}
      {loading ? (
        <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
      ) : discussions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'pwFloat 3s ease-in-out infinite' }}>💬</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>No discussions yet</div>
          <div style={{ fontSize: '12px', color: '#444' }}>Be the first to start a conversation</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {discussions.map((d, idx) => {
            const upvoted = myUpvotes[d.id]
            const avatarDisplay = d.avatar || (d.username ? d.username[0].toUpperCase() : '?')
            return (
              <div key={d.id} style={{
                background: '#0a0a0a', border: '0.5px solid #1a1a1a',
                borderRadius: '14px', padding: '16px', transition: 'border-color .2s',
                animation: `pwFadeUp .3s ease ${Math.min(idx * 0.03, 0.3)}s both`,
                position: 'relative', overflow: 'hidden',
              }}
                onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.05)' }}
              >
                {/* top accent */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: 'linear-gradient(90deg, rgba(225,6,0,0.5), transparent)' }} />
                <div style={{ display: 'flex', gap: '12px' }}>
                  {/* Avatar */}
                  <div style={{
                    width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                    background: 'linear-gradient(135deg, #e10600, #c00500)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: d.avatar ? '18px' : '14px', fontWeight: '900', color: '#fff',
                  }}>
                    {avatarDisplay}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    {/* Meta row */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{d.username || 'Anonymous'}</span>
                      <span style={{ fontSize: '10px', color: '#333', fontFamily: "'Space Mono', monospace", marginLeft: 'auto' }}>{relTime(d.created_at)}</span>
                    </div>

                    {/* Title */}
                    <div style={{ fontSize: '15px', fontWeight: '700', color: '#eee', marginBottom: d.body ? '6px' : '10px', fontFamily: "'Outfit', sans-serif", lineHeight: 1.3 }}>
                      {d.title}
                    </div>

                    {/* Body preview */}
                    {d.body && (
                      <div style={{
                        fontSize: '13px', color: '#666', lineHeight: 1.55, marginBottom: '10px',
                        fontFamily: "'Outfit', sans-serif",
                        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                      }}>
                        {d.body}
                      </div>
                    )}

                    {/* Upvote */}
                    <button onClick={() => toggleUpvote(d)} style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      background: upvoted ? 'rgba(225,6,0,0.12)' : '#111',
                      border: `1px solid ${upvoted ? 'rgba(225,6,0,0.4)' : '#1a1a1a'}`,
                      borderRadius: '20px', padding: '5px 14px', cursor: user ? 'pointer' : 'default',
                      fontSize: '12px', fontWeight: '800',
                      color: upvoted ? '#e10600' : '#444',
                      transition: 'all .15s',
                      transform: upvoted ? 'scale(1.05)' : 'scale(1)',
                    }}>
                      <span>{upvoted ? '♥' : '♡'}</span>
                      <span style={{ fontFamily: "'Space Mono', monospace", fontSize: '11px' }}>{d.upvotes || 0}</span>
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Load more */}
      {hasMore && !loading && (
        <button onClick={loadMore} disabled={loadingMore} style={{
          display: 'block', margin: '16px auto 0', background: '#111', border: '0.5px solid #222',
          color: loadingMore ? '#333' : '#666', borderRadius: '10px', padding: '10px 28px',
          fontSize: '13px', fontWeight: '600', cursor: loadingMore ? 'default' : 'pointer', transition: 'all .2s',
        }}
          onMouseEnter={e => { if (!loadingMore) e.currentTarget.style.borderColor = '#333'; e.currentTarget.style.color = '#aaa' }}
          onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#666' }}
        >
          {loadingMore ? 'Loading…' : 'Load more'}
        </button>
      )}
    </div>
  )
}

// ── What If Machine Teaser ────────────────────────────────────────────────────
function WhatIfTeaser() {
  const [notified, setNotified] = useState(false)
  return (
    <div style={{
      marginTop: '32px',
      background: 'linear-gradient(135deg, rgba(225,6,0,0.04) 0%, rgba(102,146,255,0.04) 100%)',
      border: '1px solid rgba(225,6,0,0.25)',
      borderRadius: '16px', padding: '28px 24px', position: 'relative', overflow: 'hidden',
      animation: 'borderGlow 3s ease-in-out infinite',
    }}>
      {/* Background glow */}
      <div style={{ position: 'absolute', top: '-40px', right: '-40px', width: '180px', height: '180px', background: 'radial-gradient(circle, rgba(225,6,0,0.08), transparent 65%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-40px', left: '-20px', width: '160px', height: '160px', background: 'radial-gradient(circle, rgba(102,146,255,0.06), transparent 65%)', pointerEvents: 'none' }} />

      <div style={{ position: 'relative' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '28px' }}>🔮</span>
          <div>
            <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '8px', letterSpacing: '3px', textTransform: 'uppercase', color: '#e10600', marginBottom: '3px' }}>Coming Soon</div>
            <div style={{ fontSize: '20px', fontWeight: '900', color: '#fff', letterSpacing: '-0.4px', lineHeight: 1.1 }}>What If Machine</div>
          </div>
        </div>

        <div style={{ fontSize: '14px', color: '#666', marginBottom: '12px', fontFamily: "'Outfit', sans-serif", lineHeight: 1.65, maxWidth: '500px' }}>
          Replay any season, change any result, see how the championship changes.
        </div>

        <div style={{
          display: 'inline-block', background: 'rgba(255,255,255,0.04)', border: '0.5px solid rgba(255,255,255,0.08)',
          borderRadius: '8px', padding: '8px 14px', fontSize: '13px', color: '#888',
          fontFamily: "'Outfit', sans-serif", fontStyle: 'italic', marginBottom: '18px',
        }}>
          "What if Norris won Abu Dhabi 2024?"
        </div>

        <div>
          <button onClick={() => setNotified(true)} style={{
            background: notified ? 'rgba(52,211,153,0.12)' : 'linear-gradient(135deg,#e10600,#c00500)',
            border: notified ? '1px solid rgba(52,211,153,0.4)' : 'none',
            color: notified ? '#34d399' : '#fff', borderRadius: '10px', padding: '10px 22px',
            fontSize: '13px', fontWeight: '800', cursor: notified ? 'default' : 'pointer',
            boxShadow: notified ? 'none' : '0 4px 20px rgba(225,6,0,0.3)',
            transition: 'all .3s',
          }}>
            {notified ? '✓ You\'ll be the first to know' : 'Notify me when live →'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Driver of the Day ────────────────────────────────────────────────────────
function DriverOfTheDay() {
  const { user } = useAuth()
  const year = String(new Date().getFullYear())
  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2025'] || []
  const DRIVER_COLORS = DRIVER_COLORS_BY_YEAR[year] || DRIVER_COLORS_BY_YEAR['2025'] || {}
  const { past } = useCalendar()
  const [selectedRace, setSelectedRace] = useState(null)
  const [myVote, setMyVote] = useState(null)
  const [voteCounts, setVoteCounts] = useState({})
  const [saving, setSaving] = useState(false)
  const [allVotes, setAllVotes] = useState([])
  const [justVoted, setJustVoted] = useState(false)

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
  useEffect(() => { setMyVote(null); setJustVoted(false) }, [selectedRace])

  async function vote(code, event) {
    if (!user || saving || myVote) return
    setSaving(true)
    // Get click position for confetti
    const rect = event?.currentTarget?.getBoundingClientRect()
    const cx = rect ? rect.left + rect.width / 2 : window.innerWidth / 2
    const cy = rect ? rect.top + rect.height / 2 : window.innerHeight / 2
    const { error } = await supabase.from('votes').insert({ user_id: user.id, race_name: selectedRace, driver_code: code })
    if (!error) {
      setMyVote(code)
      setJustVoted(true)
      spawnConfetti(cx, cy, '#e10600')
      await loadVotes()
    }
    setSaving(false)
  }

  const totalVotes = allVotes.length
  const selectedRaceObj = past.find(r => r.name === selectedRace)
  const leadCode = Object.entries(voteCounts).sort((a, b) => b[1] - a[1])[0]?.[0]

  return (
    <div style={{ animation: 'pwFadeUp .3s ease' }}>
      {/* Race selector */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px', fontWeight: '600' }}>Select a race</div>
        {past.length === 0 ? (
          <div style={{ display: 'flex', gap: '8px' }}>{[1,2,3,4].map(i => <div key={i} style={{ height: '36px', width: '100px', background: '#0f0f0f', borderRadius: '8px', animation: 'pwPulse 1.5s infinite' }} />)}</div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {past.slice(0, 12).map(r => {
              const isSel = selectedRace === r.name
              return (
                <button key={r.name} onClick={() => setSelectedRace(r.name)} style={{
                  background: isSel ? 'rgba(225,6,0,0.14)' : '#0f0f0f',
                  border: `1px solid ${isSel ? '#e10600' : '#1a1a1a'}`,
                  borderRadius: '10px', padding: '7px 13px', cursor: 'pointer',
                  fontSize: '12px', color: isSel ? '#e10600' : '#555',
                  fontWeight: isSel ? '800' : '500', transition: 'all .15s',
                  boxShadow: isSel ? '0 0 12px rgba(225,6,0,0.2)' : 'none',
                }}>
                  {COUNTRY_FLAGS[r.country] || '🏁'} {r.name.replace(' Grand Prix', '').replace(' Grande Prémio', '')}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Race info + vote count */}
      {selectedRaceObj && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', padding: '12px 16px', background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '10px' }}>
          <div>
            <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff' }}>
              {COUNTRY_FLAGS[selectedRaceObj.country] || '🏁'} {selectedRaceObj.name}
            </div>
            <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>
              {new Date(selectedRaceObj.date).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
            </div>
          </div>
          {totalVotes > 0 && (
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '20px', fontWeight: '900', color: '#e10600' }}>{totalVotes}</div>
              <div style={{ fontSize: '10px', color: '#444' }}>vote{totalVotes !== 1 ? 's' : ''}</div>
            </div>
          )}
        </div>
      )}

      {/* Vote confirmation */}
      {myVote && (
        <div style={{
          background: justVoted ? 'rgba(225,6,0,0.1)' : 'rgba(255,255,255,0.03)',
          border: `1px solid ${justVoted ? 'rgba(225,6,0,0.4)' : '#1a1a1a'}`,
          borderRadius: '12px', padding: '14px 18px', marginBottom: '18px',
          display: 'flex', alignItems: 'center', gap: '14px',
          animation: justVoted ? 'pwBounce .4s ease' : 'none',
          transition: 'all .5s ease',
        }}>
          <div style={{ fontSize: '22px' }}>{justVoted ? '🎉' : '🔒'}</div>
          <div>
            <div style={{ fontSize: '14px', fontWeight: '800', color: justVoted ? '#e10600' : '#fff' }}>
              {justVoted ? `Voted for ${drivers.find(d => d.code === myVote)?.name || myVote}!` : `Your vote: ${drivers.find(d => d.code === myVote)?.name || myVote}`}
            </div>
            <div style={{ fontSize: '11px', color: '#444', marginTop: '2px' }}>
              {justVoted ? `+${PTS.vote} Paddock Points earned 🏆` : 'Vote locked in permanently'}
            </div>
          </div>
        </div>
      )}

      {/* Driver grid — F1 team color cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
        {drivers.map((d, idx) => {
          const isVoted = myVote === d.code
          const isLeader = !myVote && leadCode === d.code && voteCounts[d.code] > 0
          const count = voteCounts[d.code] || 0
          const pct = totalVotes > 0 ? Math.round((count / totalVotes) * 100) : 0
          const locked = !!myVote
          const dClr = DRIVER_COLORS[d.code] || '#444'
          return (
            <button key={d.code} className="driver-card" onClick={(e) => vote(d.code, e)}
              disabled={saving || locked}
              style={{
                background: isVoted
                  ? `linear-gradient(160deg, rgba(225,6,0,0.18) 0%, #0a0a0a 100%)`
                  : `linear-gradient(160deg, ${dClr}14 0%, #080808 100%)`,
                border: `1px solid ${isVoted ? 'rgba(225,6,0,0.55)' : isLeader ? 'rgba(245,200,66,0.45)' : `${dClr}28`}`,
                borderRadius: '12px', padding: '14px 12px 12px', cursor: locked ? 'default' : 'pointer',
                textAlign: 'left', transition: 'all .18s', color: '#fff',
                position: 'relative', overflow: 'hidden',
                opacity: locked && !isVoted ? 0.3 : 1,
                boxShadow: isVoted
                  ? '0 0 24px rgba(225,6,0,0.28), inset 0 0.5px 0 rgba(255,255,255,0.06)'
                  : locked ? 'none' : `0 2px 14px ${dClr}18, inset 0 0.5px 0 rgba(255,255,255,0.04)`,
                animation: `pwFadeUp .25s ease ${idx * 0.016}s both`,
              }}>
              {/* Team colour top strip */}
              <div style={{
                position: 'absolute', top: 0, left: 0, right: 0, height: '3px',
                background: isVoted ? 'linear-gradient(90deg, #e10600, #ff4040)' : `linear-gradient(90deg, ${dClr}, ${dClr}55)`,
                boxShadow: isVoted ? '0 0 8px rgba(225,6,0,0.7)' : `0 0 6px ${dClr}55`,
              }} />

              {/* Leader / voted badge */}
              {isLeader && !myVote && count > 0 && (
                <div style={{ position: 'absolute', top: '9px', right: '9px', fontSize: '12px', animation: 'pwFloat 2s ease-in-out infinite' }}>🔥</div>
              )}
              {isVoted && (
                <span style={{ position: 'absolute', top: '8px', right: '8px', fontSize: '8px', background: 'rgba(225,6,0,0.22)', color: '#e10600', border: '0.5px solid rgba(225,6,0,0.45)', borderRadius: '8px', padding: '2px 6px', fontWeight: '900', letterSpacing: '0.5px' }}>VOTED</span>
              )}

              {/* Driver code — big, team colour */}
              <div style={{
                fontFamily: "'Space Mono', monospace",
                fontSize: '17px', fontWeight: '700',
                color: isVoted ? '#e10600' : dClr,
                letterSpacing: '-0.3px',
                marginTop: '4px',
                textShadow: isVoted ? '0 0 16px rgba(225,6,0,0.5)' : `0 0 12px ${dClr}44`,
              }}>{d.code}</div>

              {/* Last name */}
              <div style={{ fontSize: '10px', color: locked ? '#383838' : '#4a4a4a', marginTop: '3px', fontWeight: '500' }}>
                {d.name.split(' ').slice(1).join(' ')}
              </div>

              {/* Vote bar + pct when voted */}
              {myVote && (
                <div style={{ marginTop: '10px' }}>
                  <div style={{ height: '2px', background: 'rgba(255,255,255,0.05)', borderRadius: '1px', overflow: 'hidden' }}>
                    <div style={{
                      height: '100%',
                      width: `${pct}%`,
                      background: isVoted ? '#e10600' : `${dClr}66`,
                      transition: 'width 1s cubic-bezier(0.16,1,0.3,1)',
                      borderRadius: '1px',
                    }} />
                  </div>
                  <div style={{ fontSize: '10px', fontWeight: '800', marginTop: '5px', color: isVoted ? '#e10600' : '#2e2e2e', fontFamily: "'Space Mono', monospace" }}>
                    {pct > 0 ? `${pct}%` : '—'}
                  </div>
                </div>
              )}
            </button>
          )
        })}
      </div>
      {!myVote && <div style={{ fontSize: '11px', color: '#2a2a2a', marginTop: '14px', textAlign: 'center', letterSpacing: '0.3px' }}>Tap a driver to vote · locks permanently · +{PTS.vote} pts</div>}
    </div>
  )
}

// ── Race Predictions ─────────────────────────────────────────────────────────
function RacePredictions() {
  const { user } = useAuth()
  const year = String(new Date().getFullYear())
  const drivers = ALL_DRIVERS_BY_YEAR[year] || ALL_DRIVERS_BY_YEAR['2025'] || []
  const { upcoming } = useCalendar()
  const [selectedRace, setSelectedRace] = useState(null)
  const [myPreds, setMyPreds] = useState({})
  const [pick, setPick] = useState({ p1: '', p2: '', p3: '' })
  const [saving, setSaving] = useState(false)
  const [justLocked, setJustLocked] = useState(false)

  useEffect(() => {
    if (upcoming.length > 0 && !selectedRace) setSelectedRace(upcoming[0].name)
  }, [upcoming])

  useEffect(() => {
    const saved = myPreds[selectedRace]
    if (saved) setPick({ p1: saved.p1, p2: saved.p2, p3: saved.p3 })
    else setPick({ p1: '', p2: '', p3: '' })
    setJustLocked(false)
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
    if (myPreds[selectedRace]?.locked) return
    setSaving(true)
    const { error } = await supabase.from('predictions').insert(
      { user_id: user.id, race_name: selectedRace, p1: pick.p1, p2: pick.p2, p3: pick.p3 }
    )
    if (!error) {
      setMyPreds(p => ({ ...p, [selectedRace]: { ...pick, locked: true } }))
      setJustLocked(true)
      spawnConfetti(window.innerWidth / 2, window.innerHeight * 0.4, '#6692ff')
    }
    setSaving(false)
  }

  const saved = selectedRace && myPreds[selectedRace]
  const isLocked = saved?.locked
  const canSubmit = pick.p1 && pick.p2 && pick.p3 && new Set([pick.p1, pick.p2, pick.p3]).size === 3

  return (
    <div style={{ animation: 'pwFadeUp .3s ease' }}>
      {/* Race selector */}
      <div style={{ marginBottom: '18px' }}>
        <div style={{ fontSize: '11px', color: '#444', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '10px', fontWeight: '600' }}>Upcoming races</div>
        {upcoming.length === 0 ? (
          <div style={{ fontSize: '13px', color: '#444', padding: '20px', textAlign: 'center', background: '#0a0a0a', borderRadius: '10px' }}>No upcoming races to predict</div>
        ) : (
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {upcoming.map(r => {
              const isSel = selectedRace === r.name
              const isLocked = myPreds[r.name]?.locked
              return (
                <button key={r.name} onClick={() => setSelectedRace(r.name)} style={{
                  background: isSel ? 'rgba(102,146,255,0.12)' : '#0f0f0f',
                  border: `1px solid ${isSel ? '#6692ff' : isLocked ? 'rgba(52,211,153,0.3)' : '#1a1a1a'}`,
                  borderRadius: '10px', padding: '7px 13px', cursor: 'pointer',
                  fontSize: '12px', color: isSel ? '#6692ff' : isLocked ? '#34d399' : '#555',
                  fontWeight: isSel ? '800' : '500', transition: 'all .15s',
                }}>
                  {COUNTRY_FLAGS[r.country] || '🏁'} {r.name.replace(' Grand Prix', '').replace(' Grande Prémio', '')}
                  {isLocked && <span style={{ marginLeft: '5px' }}>🔒</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {selectedRace && (
        <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px', padding: '22px', marginBottom: '12px' }}>
          {isLocked ? (
            <div style={{ animation: 'pwFadeUp .3s ease' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginBottom: '16px' }}>
                <div style={{ width: '48px', height: '48px', background: justLocked ? 'rgba(225,6,0,0.15)' : 'rgba(52,211,153,0.1)', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', flexShrink: 0 }}>
                  {justLocked ? '🎉' : '🔒'}
                </div>
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff' }}>
                    {justLocked ? 'Prediction locked!' : 'Your prediction'}
                  </div>
                  <div style={{ fontSize: '12px', color: '#444', marginTop: '2px' }}>
                    {justLocked ? `+${PTS.prediction} Paddock Points earned` : selectedRace.replace(' Grand Prix', ' GP')}
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: '10px' }}>
                {[['🥇', saved.p1, '#f5c842'], ['🥈', saved.p2, '#c0c0c0'], ['🥉', saved.p3, '#cd7f32']].map(([m, code, clr]) => (
                  <div key={m} style={{ flex: 1, background: '#111', border: '0.5px solid #1a1a1a', borderRadius: '10px', padding: '12px', textAlign: 'center' }}>
                    <div style={{ fontSize: '20px', marginBottom: '4px' }}>{m}</div>
                    <div style={{ fontSize: '14px', fontWeight: '900', color: clr }}>{code}</div>
                    <div style={{ fontSize: '10px', color: '#444', marginTop: '2px' }}>{(ALL_DRIVERS_BY_YEAR[String(new Date().getFullYear())] || []).find(d => d.code === code)?.name?.split(' ').slice(1).join(' ') || ''}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: '15px', fontWeight: '800', color: '#fff', marginBottom: '4px' }}>Predict the podium</div>
              <div style={{ fontSize: '12px', color: '#444', marginBottom: '20px' }}>Pick P1, P2, P3 — locked forever · earns {PTS.prediction} pts</div>
              <div style={{ display: 'flex', gap: '10px', marginBottom: '18px', flexWrap: 'wrap' }}>
                {['p1', 'p2', 'p3'].map((pos, i) => (
                  <div key={pos} style={{ flex: 1, minWidth: '110px' }}>
                    <div style={{ fontSize: '11px', color: ['#f5c842', '#c0c0c0', '#cd7f32'][i], fontWeight: '700', marginBottom: '7px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
                      {['🥇 P1', '🥈 P2', '🥉 P3'][i]}
                    </div>
                    <select value={pick[pos]} onChange={e => setPick(p => ({ ...p, [pos]: e.target.value }))} style={{
                      width: '100%', background: '#111', border: `1.5px solid ${pick[pos] ? ['rgba(245,200,66,0.4)', 'rgba(192,192,192,0.4)', 'rgba(205,127,50,0.4)'][i] : '#222'}`,
                      borderRadius: '10px', color: pick[pos] ? '#fff' : '#555', padding: '10px 12px', fontSize: '13px', fontWeight: pick[pos] ? '700' : '400',
                      transition: 'border-color .15s',
                    }}>
                      <option value="">Pick driver</option>
                      {drivers.filter(d => !Object.entries(pick).filter(([k]) => k !== pos).map(([, v]) => v).includes(d.code)).map(d => (
                        <option key={d.code} value={d.code}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
              <button onClick={savePick} disabled={saving || !canSubmit} style={{
                background: !canSubmit ? '#111' : saving ? '#333' : 'linear-gradient(135deg, #e10600, #c00500)',
                color: !canSubmit ? '#333' : '#fff',
                border: 'none', borderRadius: '10px', padding: '12px 24px',
                fontSize: '14px', fontWeight: '800', cursor: canSubmit ? 'pointer' : 'not-allowed',
                boxShadow: canSubmit ? '0 4px 20px rgba(225,6,0,0.3)' : 'none',
                transition: 'all .2s', display: 'flex', alignItems: 'center', gap: '8px',
              }}
                onMouseEnter={e => { if (canSubmit) e.currentTarget.style.transform = 'scale(1.02)' }}
                onMouseLeave={e => e.currentTarget.style.transform = 'scale(1)'}
              >{saving ? 'Locking in…' : '🔒 Lock Prediction'}</button>
            </>
          )}
        </div>
      )}

      {/* Past predictions */}
      {Object.keys(myPreds).filter(r => !upcoming.find(u => u.name === r)).length > 0 && (
        <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '12px', padding: '18px', marginTop: '16px' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#555', textTransform: 'uppercase', letterSpacing: '.6px', marginBottom: '12px' }}>Past predictions</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {Object.entries(myPreds).filter(([r]) => !upcoming.find(u => u.name === r)).map(([race, p]) => (
              <div key={race} style={{ padding: '10px 14px', background: '#111', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
                <div style={{ fontSize: '11px', color: '#444', flex: 1 }}>{race.replace(' Grand Prix', ' GP')}</div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  {[['🥇', p.p1], ['🥈', p.p2], ['🥉', p.p3]].map(([m, c], i) => (
                    <span key={i} style={{ fontSize: '12px', fontWeight: '700', color: '#fff' }}>{m} {c}</span>
                  ))}
                </div>
                <span style={{ fontSize: '12px' }}>🔒</span>
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

  const ratedCount = drivers.filter(d => ratings[`${year}_${d.code}`]).length

  return (
    <div style={{ animation: 'pwFadeUp .3s ease' }}>
      <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px', padding: '22px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <div style={{ fontSize: '16px', fontWeight: '800', color: '#fff' }}>Rate every driver</div>
            <div style={{ fontSize: '12px', color: '#444', marginTop: '3px' }}>Personal 1–10 season ratings · can be updated anytime · no points</div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {ratedCount > 0 && <div style={{ fontSize: '11px', color: '#e10600', fontWeight: '700' }}>{ratedCount}/{drivers.length} rated</div>}
            <select value={year} onChange={e => setYear(e.target.value)} style={{
              background: '#111', border: '0.5px solid #1a1a1a', borderRadius: '8px',
              color: '#aaa', padding: '8px 12px', fontSize: '13px',
            }}>
              {['2026', '2025', '2024', '2023', '2022', '2021'].map(y => <option key={y}>{y}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {drivers.map((d, idx) => {
            const key = `${year}_${d.code}`
            const myRating = ratings[key] || 0
            const hov = hover[key] || 0
            const active = hov || myRating
            const isSaving = saving === d.code
            return (
              <div key={d.code} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '10px 14px',
                background: myRating ? `rgba(225,6,0,0.04)` : '#111',
                border: `0.5px solid ${myRating ? 'rgba(225,6,0,0.15)' : '#1a1a1a'}`,
                borderRadius: '10px', flexWrap: 'wrap',
                opacity: isSaving ? 0.6 : 1, transition: 'all .2s',
                animation: `pwFadeUp .3s ease ${idx * 0.015}s both`,
              }}>
                <div style={{ width: '40px', fontSize: '13px', fontWeight: '900', color: '#e10600', flexShrink: 0, letterSpacing: '-0.2px' }}>{d.code}</div>
                <div style={{ flex: 1, minWidth: '80px', fontSize: '12px', color: '#555' }}>{d.name}</div>
                <div style={{ display: 'flex', gap: '3px' }} onMouseLeave={() => setHover(h => ({ ...h, [key]: 0 }))}>
                  {[1,2,3,4,5,6,7,8,9,10].map(n => (
                    <button key={n}
                      onMouseEnter={() => setHover(h => ({ ...h, [key]: n }))}
                      onClick={() => rate(d.code, n)}
                      style={{
                        width: '24px', height: '24px', borderRadius: '5px', border: 'none',
                        background: n <= active ? (n >= 8 ? '#4caf50' : n >= 5 ? '#e10600' : '#e10600') : '#1a1a1a',
                        cursor: 'pointer', fontSize: '9px', fontWeight: '700',
                        color: n <= active ? '#fff' : '#333',
                        transition: 'all .1s', transform: n === hov ? 'scale(1.2)' : 'scale(1)',
                      }}>{n}</button>
                  ))}
                </div>
                {myRating > 0 && (
                  <div style={{ fontSize: '13px', fontWeight: '900', color: myRating >= 8 ? '#4caf50' : '#e10600', minWidth: '36px', textAlign: 'right' }}>
                    {myRating}<span style={{ fontSize: '9px', color: '#444' }}>/10</span>
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Hot Takes ────────────────────────────────────────────────────────────────
function HotTakes() {
  const { user, profile } = useAuth()
  const [takes, setTakes] = useState([])
  const [myReactions, setMyReactions] = useState({})
  const [text, setText] = useState('')
  const [posting, setPosting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [justPosted, setJustPosted] = useState(false)
  const textRef = useRef(null)

  async function loadTakes() {
    const { data: takesData } = await supabase
      .from('hot_takes')
      .select('id, content, created_at, user_id, profiles(username, avatar, fav_team)')
      .order('created_at', { ascending: false })
      .limit(50)

    const { data: reactionsData } = await supabase
      .from('hot_take_reactions')
      .select('take_id, reaction, user_id')

    const reactions = reactionsData || []
    const counts = {}
    reactions.forEach(r => {
      if (!counts[r.take_id]) counts[r.take_id] = { fire: 0, cold: 0 }
      if (r.reaction === '🔥') counts[r.take_id].fire++
      else counts[r.take_id].cold++
    })

    const mine = {}
    if (user) reactions.filter(r => r.user_id === user.id).forEach(r => { mine[r.take_id] = r.reaction })

    const processed = (takesData || []).map(t => ({
      ...t,
      counts: counts[t.id] || { fire: 0, cold: 0 },
      score: (counts[t.id]?.fire || 0) - (counts[t.id]?.cold || 0),
    }))
    // Sort: pinned by score if has reactions, otherwise chronological
    processed.sort((a, b) => {
      const aHasReactions = a.counts.fire + a.counts.cold > 0
      const bHasReactions = b.counts.fire + b.counts.cold > 0
      if (aHasReactions || bHasReactions) return b.score - a.score
      return 0
    })

    setTakes(processed)
    setMyReactions(mine)
    setLoading(false)
  }

  useEffect(() => { loadTakes() }, [user])

  async function postTake() {
    if (!user || !text.trim() || posting) return
    setPosting(true)
    await supabase.from('hot_takes').insert({ user_id: user.id, content: text.trim() })
    setText('')
    setJustPosted(true)
    setTimeout(() => setJustPosted(false), 3000)
    await loadTakes()
    setPosting(false)
  }

  async function react(takeId, emoji) {
    if (!user) return
    const current = myReactions[takeId]
    if (current === emoji) {
      await supabase.from('hot_take_reactions').delete().eq('take_id', takeId).eq('user_id', user.id)
      setMyReactions(m => { const n = { ...m }; delete n[takeId]; return n })
    } else {
      await supabase.from('hot_take_reactions').upsert(
        { take_id: takeId, user_id: user.id, reaction: emoji },
        { onConflict: 'take_id,user_id' }
      )
      setMyReactions(m => ({ ...m, [takeId]: emoji }))
    }
    await loadTakes()
  }

  async function deleteTake(id) {
    await supabase.from('hot_takes').delete().eq('id', id).eq('user_id', user.id)
    setTakes(t => t.filter(x => x.id !== id))
  }

  const charLeft = 140 - text.length
  const userColor = profile?.fav_team ? (TEAM_COLORS[profile.fav_team] || '#e10600') : '#e10600'

  return (
    <div style={{ animation: 'pwFadeUp .3s ease' }}>
      {/* Post box */}
      <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px', padding: '18px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', gap: '12px' }}>
          {user && profile && (
            <div style={{ flexShrink: 0, marginTop: '2px' }}>
              <PaddockAvatar profile={profile} size={38} />
            </div>
          )}
          <div style={{ flex: 1 }}>
            <div style={{ position: 'relative' }}>
              <textarea
                ref={textRef}
                value={text}
                onChange={e => setText(e.target.value.slice(0, 140))}
                onKeyDown={e => { if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) postTake() }}
                placeholder="Ferrari's pit wall cost them another championship..."
                rows={3}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#111', border: `1.5px solid ${text.length > 0 ? '#2a2a2a' : '#1a1a1a'}`,
                  borderRadius: '10px', color: '#fff', padding: '12px 14px 32px',
                  fontSize: '14px', outline: 'none', resize: 'none', fontFamily: 'inherit',
                  transition: 'border-color .15s', lineHeight: 1.5,
                }}
                onFocus={e => e.target.style.borderColor = '#e10600'}
                onBlur={e => e.target.style.borderColor = text.length > 0 ? '#2a2a2a' : '#1a1a1a'}
              />
              <div style={{ position: 'absolute', bottom: '10px', left: '14px', fontSize: '10px', color: '#333' }}>Ctrl+Enter to post</div>
              <div style={{ position: 'absolute', bottom: '10px', right: '12px', fontSize: '11px', color: charLeft < 20 ? '#e10600' : '#333', fontWeight: charLeft < 20 ? '700' : '400' }}>{charLeft}</div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '10px' }}>
              {justPosted ? (
                <div style={{ fontSize: '12px', color: '#e10600', fontWeight: '700', animation: 'pwFadeUp .2s ease' }}>🔥 +{PTS.hotTake} pts earned!</div>
              ) : (
                <div style={{ fontSize: '11px', color: '#333' }}>Earns {PTS.hotTake} Paddock Points</div>
              )}
              <button onClick={postTake} disabled={!text.trim() || posting || !user} style={{
                background: !text.trim() || !user ? '#111' : `linear-gradient(135deg, #e10600, #c00500)`,
                color: !text.trim() || !user ? '#333' : '#fff',
                border: `1px solid ${!text.trim() || !user ? '#1a1a1a' : 'transparent'}`,
                borderRadius: '8px', padding: '9px 18px',
                fontSize: '13px', fontWeight: '800', cursor: !text.trim() || !user ? 'not-allowed' : 'pointer',
                boxShadow: !text.trim() || !user ? 'none' : '0 4px 16px rgba(225,6,0,0.3)',
                transition: 'all .2s',
              }}>
                {posting ? 'Dropping…' : '🔥 Drop Take'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Takes feed */}
      {loading ? (
        <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
      ) : takes.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '56px 20px', background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'pwFloat 3s ease-in-out infinite' }}>🔥</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>No hot takes yet</div>
          <div style={{ fontSize: '12px', color: '#444' }}>Be the first to drop a spicy F1 opinion</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {takes.map((take, idx) => {
            const p = take.profiles
            const color = p?.fav_team ? (TEAM_COLORS[p.fav_team] || '#e10600') : '#e10600'
            const myR = myReactions[take.id]
            const isOwn = user?.id === take.user_id
            const isTrending = take.counts.fire >= 3 && take.score > 0
            const totalReactions = take.counts.fire + take.counts.cold
            const fireRatio = totalReactions > 0 ? take.counts.fire / totalReactions : 0.5
            const tempLabel = fireRatio >= 0.75 ? '🔥 Spicy' : fireRatio <= 0.25 ? '❄️ Cold take' : null

            return (
              <div key={take.id} style={{
                background: '#0a0a0a',
                border: `0.5px solid ${myR === '🔥' ? 'rgba(225,6,0,0.25)' : myR === '❄️' ? 'rgba(102,146,255,0.25)' : '#1a1a1a'}`,
                borderRadius: '14px', padding: '16px',
                transition: 'border-color .3s, box-shadow .3s',
                boxShadow: myR ? `0 0 20px ${myR === '🔥' ? 'rgba(225,6,0,0.08)' : 'rgba(102,146,255,0.08)'}` : 'none',
                animation: `pwFadeUp .3s ease ${Math.min(idx * 0.04, 0.4)}s both`,
                position: 'relative', overflow: 'hidden',
              }}>
                {/* Color accent strip */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '2px', background: `linear-gradient(90deg, ${color}88, transparent)` }} />

                {/* Trending badge */}
                {isTrending && (
                  <div style={{ position: 'absolute', top: '14px', right: '14px', background: 'rgba(225,6,0,0.15)', border: '0.5px solid rgba(225,6,0,0.3)', borderRadius: '20px', padding: '2px 10px', fontSize: '10px', color: '#e10600', fontWeight: '800' }}>
                    🔥 Trending
                  </div>
                )}

                <div style={{ display: 'flex', gap: '12px' }}>
                  <PaddockAvatar profile={p} size={38} />

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px', flexWrap: 'wrap' }}>
                      <span style={{ fontSize: '13px', fontWeight: '800', color: '#fff' }}>{p?.username || 'Anonymous'}</span>
                      {p?.fav_team && (
                        <span style={{ fontSize: '10px', color, fontWeight: '700', background: `${color}15`, padding: '1px 7px', borderRadius: '20px' }}>{p.fav_team}</span>
                      )}
                      <span style={{ fontSize: '10px', color: '#2a2a2a', marginLeft: 'auto' }}>
                        {new Date(take.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                      </span>
                    </div>

                    <div style={{ fontSize: '14px', color: '#ccc', lineHeight: '1.6', marginBottom: '12px', fontWeight: '400' }}>
                      {take.content}
                    </div>

                    {/* Temperature bar */}
                    {totalReactions >= 2 && (
                      <div style={{ marginBottom: '10px' }}>
                        <div style={{ height: '3px', background: '#6692ff33', borderRadius: '2px', overflow: 'hidden', marginBottom: '4px' }}>
                          <div style={{ height: '100%', width: `${fireRatio * 100}%`, background: 'linear-gradient(90deg, #e10600, #ff6b35)', borderRadius: '2px', transition: 'width .5s ease' }} />
                        </div>
                        {tempLabel && <div style={{ fontSize: '10px', color: fireRatio >= 0.75 ? '#e10600' : '#6692ff', fontWeight: '700' }}>{tempLabel}</div>}
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {[['🔥', 'fire', '#e10600', 'rgba(225,6,0,0.12)'], ['❄️', 'cold', '#6692ff', 'rgba(102,146,255,0.12)']].map(([emoji, key, clr, bg]) => (
                        <button key={emoji} onClick={() => react(take.id, emoji)} style={{
                          display: 'flex', alignItems: 'center', gap: '5px',
                          background: myR === emoji ? bg : '#111',
                          border: `1px solid ${myR === emoji ? clr : '#1a1a1a'}`,
                          borderRadius: '20px', padding: '5px 13px', cursor: user ? 'pointer' : 'default',
                          fontSize: '12px', fontWeight: '800',
                          color: myR === emoji ? clr : '#333',
                          transition: 'all .15s',
                          transform: myR === emoji ? 'scale(1.05)' : 'scale(1)',
                        }}>
                          <span>{emoji}</span>
                          <span>{take.counts[key]}</span>
                        </button>
                      ))}
                      {isOwn && (
                        <button onClick={() => deleteTake(take.id)} style={{
                          marginLeft: 'auto', background: 'none', border: 'none',
                          color: '#222', fontSize: '11px', cursor: 'pointer', padding: '5px 8px', borderRadius: '6px', transition: 'color .15s',
                        }}
                          onMouseEnter={e => e.currentTarget.style.color = '#e10600'}
                          onMouseLeave={e => e.currentTarget.style.color = '#222'}
                        >delete</button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
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
      const [votesRes, predsRes, takesRes, profilesRes] = await Promise.all([
        supabase.from('votes').select('user_id'),
        supabase.from('predictions').select('user_id'),
        supabase.from('hot_takes').select('user_id'),
        supabase.from('profiles').select('id, username, fav_team, avatar'),
      ])

      const votes = votesRes.data || []
      const preds = predsRes.data || []
      const takes = takesRes.data || []
      const profiles = profilesRes.data || []

      const userMap = {}
      const ensure = id => { if (!userMap[id]) userMap[id] = { votes: 0, preds: 0, takes: 0 } }
      votes.forEach(v => { ensure(v.user_id); userMap[v.user_id].votes++ })
      preds.forEach(p => { ensure(p.user_id); userMap[p.user_id].preds++ })
      takes.forEach(t => { ensure(t.user_id); userMap[t.user_id].takes++ })

      const leaderboard = Object.entries(userMap)
        .map(([userId, stats]) => {
          const profile = profiles.find(p => p.id === userId)
          const points = stats.votes * PTS.vote + stats.preds * PTS.prediction + stats.takes * PTS.hotTake
          return { userId, username: profile?.username || null, fav_team: profile?.fav_team || null, avatar: profile?.avatar || null, points, ...stats }
        })
        .filter(e => e.points > 0 && e.username)
        .sort((a, b) => b.points - a.points)
        .slice(0, 50)

      setEntries(leaderboard)
      setLoading(false)
    }
    load()
  }, [])

  return (
    <div style={{ animation: 'pwFadeUp .3s ease' }}>
      {loading ? (
        <><SkeletonCard /><SkeletonCard /><SkeletonCard /></>
      ) : entries.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px' }}>
          <div style={{ fontSize: '40px', marginBottom: '12px', animation: 'pwFloat 3s ease-in-out infinite' }}>🏁</div>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#fff', marginBottom: '6px' }}>No activity yet</div>
          <div style={{ fontSize: '12px', color: '#444' }}>Be the first to vote and claim the top spot!</div>
        </div>
      ) : (
        <>
          {/* Top 3 podium */}
          {entries.length >= 3 && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: '8px', marginBottom: '20px', padding: '0 4px' }}>
              {[entries[1], entries[0], entries[2]].map((entry, podiumIdx) => {
                const realIdx = podiumIdx === 0 ? 1 : podiumIdx === 1 ? 0 : 2
                const heights = ['120px', '150px', '100px']
                const medals = ['🥈', '🥇', '🥉']
                const colors = ['#c0c0c0', '#f5c842', '#cd7f32']
                const teamColor = entry.fav_team ? (TEAM_COLORS[entry.fav_team] || '#e10600') : '#e10600'
                const isMe = entry.userId === user?.id
                return (
                  <div key={entry.userId} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', animation: `pwFadeUp .4s ease ${podiumIdx * 0.1}s both` }}>
                    <div style={{ fontSize: '22px', animation: podiumIdx === 1 ? 'pwFloat 3s ease-in-out infinite' : 'none' }}>{medals[podiumIdx]}</div>
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%',
                      background: `linear-gradient(135deg, ${teamColor}, ${teamColor}99)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: entry.avatar ? '24px' : '18px', fontWeight: '900', color: '#fff',
                      border: `3px solid ${colors[podiumIdx]}`,
                      boxShadow: `0 0 20px ${colors[podiumIdx]}44`,
                    }}>
                      {entry.avatar || entry.username[0].toUpperCase()}
                    </div>
                    <div style={{ fontSize: '12px', fontWeight: '800', color: isMe ? '#e10600' : '#fff', textAlign: 'center', maxWidth: '80px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.username}{isMe ? ' 👈' : ''}
                    </div>
                    <div style={{
                      width: '100%', height: heights[podiumIdx],
                      background: `linear-gradient(180deg, ${colors[podiumIdx]}22, ${colors[podiumIdx]}08)`,
                      border: `1px solid ${colors[podiumIdx]}44`,
                      borderRadius: '8px 8px 0 0',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexDirection: 'column', gap: '2px',
                    }}>
                      <div style={{ fontSize: '18px', fontWeight: '900', color: colors[podiumIdx] }}>{entry.points}</div>
                      <div style={{ fontSize: '9px', color: colors[podiumIdx] + '88' }}>pts</div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* Rest of leaderboard */}
          {entries.length > 3 && (
            <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px', padding: '8px', marginBottom: '12px' }}>
              {entries.slice(3).map((entry, i) => {
                const isMe = entry.userId === user?.id
                const color = entry.fav_team ? (TEAM_COLORS[entry.fav_team] || '#e10600') : '#e10600'
                return (
                  <div key={entry.userId} style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '11px 12px', borderRadius: '10px',
                    background: isMe ? 'rgba(225,6,0,0.06)' : 'transparent',
                    border: `0.5px solid ${isMe ? 'rgba(225,6,0,0.2)' : 'transparent'}`,
                    marginBottom: '2px',
                    animation: `pwFadeUp .3s ease ${(i + 3) * 0.03}s both`,
                    transition: 'background .15s',
                  }}
                    onMouseEnter={e => { if (!isMe) e.currentTarget.style.background = '#111' }}
                    onMouseLeave={e => { if (!isMe) e.currentTarget.style.background = 'transparent' }}
                  >
                    <div style={{ width: '24px', fontSize: '12px', color: '#333', fontWeight: '700', textAlign: 'center', flexShrink: 0 }}>{i + 4}</div>
                    <div style={{
                      width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                      background: `linear-gradient(135deg, ${color}, ${color}99)`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: entry.avatar ? '16px' : '11px', fontWeight: '900', color: '#fff',
                    }}>
                      {entry.avatar || entry.username[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '13px', fontWeight: '700', color: isMe ? '#e10600' : '#ccc', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        {entry.username}
                        {isMe && <span style={{ fontSize: '9px', background: 'rgba(225,6,0,0.15)', color: '#e10600', padding: '1px 6px', borderRadius: '10px', fontWeight: '800' }}>YOU</span>}
                      </div>
                      {entry.fav_team && <div style={{ fontSize: '10px', color: color, fontWeight: '600' }}>{entry.fav_team}</div>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexShrink: 0 }}>
                      <div style={{ display: 'flex', gap: '6px', opacity: 0.5 }}>
                        <span style={{ fontSize: '10px', color: '#555' }}>🏆{entry.votes}</span>
                        <span style={{ fontSize: '10px', color: '#555' }}>🔮{entry.preds}</span>
                        <span style={{ fontSize: '10px', color: '#555' }}>🔥{entry.takes}</span>
                      </div>
                      <div style={{ fontSize: '15px', fontWeight: '900', color: '#fff', minWidth: '38px', textAlign: 'right' }}>
                        {entry.points}<span style={{ fontSize: '9px', color: '#333', fontWeight: '400' }}>pt</span>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {/* Points explanation */}
      <div style={{ background: '#0a0a0a', border: '0.5px solid #1a1a1a', borderRadius: '14px', padding: '18px' }}>
        <div style={{ fontSize: '11px', fontWeight: '800', color: '#333', textTransform: 'uppercase', letterSpacing: '.8px', marginBottom: '14px' }}>How to earn Paddock Points</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {[
            { icon: '🏆', action: 'Vote Driver of the Day', pts: `+${PTS.vote} pts`, desc: 'Permanent — one vote per race' },
            { icon: '🔮', action: 'Lock a race prediction', pts: `+${PTS.prediction} pts`, desc: 'Permanent — must pick all 3 places' },
            { icon: '🔥', action: 'Post a Hot Take', pts: `+${PTS.hotTake} pts`, desc: 'Unlimited — share your opinions' },
            { icon: '⭐', action: 'Rate drivers', pts: '0 pts', desc: 'Just for fun — update anytime' },
          ].map(r => (
            <div key={r.action} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 12px', background: r.pts !== '0 pts' ? '#111' : '#0d0d0d', borderRadius: '8px', border: '0.5px solid #1a1a1a' }}>
              <div style={{ fontSize: '20px', flexShrink: 0 }}>{r.icon}</div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '13px', fontWeight: '700', color: r.pts !== '0 pts' ? '#fff' : '#555' }}>{r.action}</div>
                <div style={{ fontSize: '10px', color: '#333', marginTop: '1px' }}>{r.desc}</div>
              </div>
              <div style={{ fontSize: '13px', fontWeight: '900', color: r.pts !== '0 pts' ? '#e10600' : '#333', flexShrink: 0 }}>{r.pts}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
