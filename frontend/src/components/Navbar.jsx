import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import AuthModal from './AuthModal'
import OnboardingModal from './OnboardingModal'

const TEAM_COLORS = {
  'Red Bull Racing': '#3671c6', 'Ferrari': '#e8002d', 'McLaren': '#ff8000',
  'Mercedes': '#00d2be', 'Aston Martin': '#52e252', 'Alpine': '#0093cc',
  'Racing Bulls': '#6692ff', 'Williams': '#005aff', 'Haas': '#b6babd',
  'Audi': '#c92d4b', 'Cadillac': '#888',
}

const tabs = [
  { label: 'Race replay', path: '/replay' },
  { label: 'Head to head', path: '/h2h' },
  { label: 'Standings', path: '/standings' },
  { label: 'Drivers', path: '/drivers' },
  { label: 'Calendar', path: '/calendar' },
  { label: 'Paddock', path: '/community' },
  { label: 'Support', path: '/support' },
]

export default function Navbar() {
  const loc = useLocation()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const [showAuth, setShowAuth] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const { user, profile, signOut, needsOnboarding } = useAuth()
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth <= 768)

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768)
    window.addEventListener('resize', handler)
    return () => window.removeEventListener('resize', handler)
  }, [])

  // Close menu on route change
  useEffect(() => { setMenuOpen(false); setShowUserMenu(false) }, [loc.pathname])

  const teamColor = profile?.fav_team ? (TEAM_COLORS[profile.fav_team] || '#e10600') : '#e10600'
  const avatarLabel = profile?.avatar || (profile?.username ? profile.username[0].toUpperCase() : user?.email?.[0]?.toUpperCase() || '?')
  const displayName = profile?.username || user?.email?.split('@')[0] || 'Paddock member'

  return (
    <>
      <a href="#main-content" className="sr-only" style={{ position: 'absolute', top: '-40px', left: 0, background: '#e10600', color: '#fff', padding: '8px 16px', zIndex: 300 }}
        onFocus={e => e.target.style.top = '0'}
        onBlur={e => e.target.style.top = '-40px'}
      >Skip to content</a>

      <nav aria-label="Main navigation" style={{
        background: 'rgba(10,10,10,0.97)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 16px',
        height: '52px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderBottom: '0.5px solid #1a1a1a',
        position: 'sticky',
        top: 0,
        zIndex: 200,
        gap: '8px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none', flexShrink: 0 }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #e10600, #b30500)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', color: '#fff', fontSize: '12px',
            boxShadow: '0 0 12px rgba(225,6,0,0.4)',
          }}>PW</div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700', letterSpacing: '-0.3px' }}>PitWall</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>F1 Race Analyzer</div>
          </div>
        </Link>

        {/* Desktop nav links */}
        {!isMobile && (
          <div style={{ display: 'flex', gap: '2px', flex: 1, justifyContent: 'center' }}>
            {tabs.map(t => {
              const isActive = loc.pathname === t.path
              return (
                <Link key={t.path} to={t.path} style={{
                  color: isActive ? '#fff' : 'rgba(255,255,255,.45)',
                  fontSize: '12px', padding: '5px 10px', borderRadius: '6px',
                  background: isActive ? 'rgba(225,6,0,0.15)' : 'transparent',
                  border: `0.5px solid ${isActive ? 'rgba(225,6,0,0.3)' : 'transparent'}`,
                  textDecoration: 'none', transition: 'all .15s',
                  fontWeight: isActive ? '600' : '400', whiteSpace: 'nowrap',
                }}>{t.label}</Link>
              )
            })}
          </div>
        )}

        {/* Right side: auth + hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
          {/* Auth area — always visible */}
          {user ? (
            <div style={{ position: 'relative' }}>
              <button onClick={() => setShowUserMenu(s => !s)} style={{
                width: '32px', height: '32px', borderRadius: '50%',
                background: `linear-gradient(135deg, ${teamColor}, ${teamColor}99)`,
                border: `2px solid ${teamColor}44`,
                color: '#fff', fontWeight: '800',
                fontSize: profile?.avatar ? '16px' : '13px', cursor: 'pointer', display: 'flex',
                alignItems: 'center', justifyContent: 'center',
                boxShadow: `0 0 12px ${teamColor}44`,
                position: 'relative', flexShrink: 0,
              }}>
                {avatarLabel}
                {needsOnboarding && (
                  <span style={{ position: 'absolute', top: '-2px', right: '-2px', width: '8px', height: '8px', background: '#f5c842', borderRadius: '50%', border: '2px solid #0a0a0a' }} />
                )}
              </button>

              {showUserMenu && (
                <div style={{
                  position: 'absolute', top: '40px', right: 0,
                  background: '#111', border: '0.5px solid #2a2a2a',
                  borderRadius: '12px', padding: '6px', minWidth: '210px',
                  zIndex: 201, boxShadow: '0 12px 40px rgba(0,0,0,0.7)',
                  animation: 'pwFadeIn .15s ease',
                }}>
                  <div style={{ padding: '10px 12px', borderBottom: '0.5px solid #1a1a1a', marginBottom: '4px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', flexShrink: 0,
                        background: `linear-gradient(135deg, ${teamColor}, ${teamColor}99)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: profile?.avatar ? '18px' : '14px', fontWeight: '800', color: '#fff',
                      }}>{avatarLabel}</div>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '13px', fontWeight: '700', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{displayName}</div>
                        {profile?.fav_team && <div style={{ fontSize: '10px', color: teamColor, marginTop: '1px', fontWeight: '600' }}>{profile.fav_team}</div>}
                        {profile?.fav_driver && <div style={{ fontSize: '10px', color: '#555', marginTop: '1px' }}>#{profile.fav_driver}</div>}
                      </div>
                    </div>
                  </div>
                  <MenuItem icon="👤" label="My Profile" onClick={() => { navigate('/profile'); setShowUserMenu(false) }} />
                  <MenuItem icon="🏁" label="The Paddock" onClick={() => { navigate('/community'); setShowUserMenu(false) }} />
                  {needsOnboarding && <MenuItem icon="⚡" label="Complete setup" onClick={() => setShowUserMenu(false)} highlight />}
                  <div style={{ height: '0.5px', background: '#1a1a1a', margin: '4px 0' }} />
                  <button onClick={() => { signOut(); setShowUserMenu(false) }} style={{
                    width: '100%', background: 'rgba(225,6,0,0.06)', border: '0.5px solid rgba(225,6,0,0.15)',
                    color: '#e10600', padding: '9px 12px', borderRadius: '8px',
                    fontSize: '12px', fontWeight: '600', cursor: 'pointer', textAlign: 'left',
                    display: 'flex', alignItems: 'center', gap: '8px',
                  }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(225,6,0,0.12)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'rgba(225,6,0,0.06)'}
                  ><span>↩</span> Sign Out</button>
                </div>
              )}
            </div>
          ) : (
            <button onClick={() => setShowAuth(true)} style={{
              background: '#e10600', color: '#fff', border: 'none',
              padding: '6px 14px', borderRadius: '6px', fontSize: '12px',
              fontWeight: '700', cursor: 'pointer', flexShrink: 0,
              boxShadow: '0 0 10px rgba(225,6,0,0.3)',
            }}>Sign In</button>
          )}

          {/* Hamburger — mobile only */}
          {isMobile && (
            <button
              onClick={() => setMenuOpen(o => !o)}
              aria-label={menuOpen ? 'Close menu' : 'Open menu'}
              aria-expanded={menuOpen}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                padding: '6px', display: 'flex', flexDirection: 'column',
                gap: '5px', alignItems: 'center', flexShrink: 0,
              }}>
              <div style={{ width: '20px', height: '2px', background: menuOpen ? '#e10600' : '#fff', transition: 'all .2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', borderRadius: '2px' }} />
              <div style={{ width: '20px', height: '2px', background: '#fff', opacity: menuOpen ? 0 : 1, transition: 'all .2s', borderRadius: '2px' }} />
              <div style={{ width: '20px', height: '2px', background: menuOpen ? '#e10600' : '#fff', transition: 'all .2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', borderRadius: '2px' }} />
            </button>
          )}
        </div>
      </nav>

      {/* Mobile menu */}
      {isMobile && menuOpen && (
        <div style={{
          position: 'fixed', top: '52px', left: 0, right: 0, bottom: 0,
          background: 'rgba(0,0,0,0.96)',
          backdropFilter: 'blur(20px)',
          zIndex: 190, padding: '8px 12px 24px',
          overflowY: 'auto',
          animation: 'pwSlideDown .2s ease',
        }}>
          {tabs.map(t => {
            const isActive = loc.pathname === t.path
            return (
              <Link key={t.path} to={t.path}
                onClick={() => setMenuOpen(false)}
                style={{
                  display: 'flex', alignItems: 'center',
                  color: isActive ? '#e10600' : '#ccc',
                  fontSize: '16px', padding: '16px 14px',
                  borderRadius: '10px',
                  background: isActive ? 'rgba(225,6,0,0.08)' : 'transparent',
                  textDecoration: 'none',
                  fontWeight: isActive ? '700' : '400',
                  borderBottom: '0.5px solid #111',
                  transition: 'all .15s',
                }}>{t.label}</Link>
            )
          })}

          <div style={{ marginTop: '16px', padding: '0 2px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {!user && (
              <button onClick={() => { setMenuOpen(false); setShowAuth(true) }} style={{
                background: 'linear-gradient(135deg, #e10600, #c00500)', color: '#fff', border: 'none',
                padding: '14px', borderRadius: '10px', fontSize: '15px',
                fontWeight: '700', cursor: 'pointer', width: '100%',
                boxShadow: '0 0 20px rgba(225,6,0,0.3)',
              }}>Sign In</button>
            )}
            {user && (
              <>
                <button onClick={() => { navigate('/profile'); setMenuOpen(false) }} style={{
                  background: '#111', border: '0.5px solid #1a1a1a', color: '#ccc',
                  padding: '14px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>👤 My Profile</button>
                <button onClick={() => { signOut(); setMenuOpen(false) }} style={{
                  background: 'rgba(225,6,0,0.06)', border: '0.5px solid rgba(225,6,0,0.2)',
                  color: '#e10600', padding: '14px', borderRadius: '10px', fontSize: '14px',
                  fontWeight: '600', cursor: 'pointer', width: '100%', textAlign: 'left',
                }}>↩ Sign Out</button>
              </>
            )}
          </div>
        </div>
      )}

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
      {needsOnboarding && <OnboardingModal />}
      {showUserMenu && <div onClick={() => setShowUserMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 199 }} />}

      <style>{`
        @keyframes pwFadeIn { from{opacity:0;transform:translateY(-4px)} to{opacity:1;transform:translateY(0)} }
        @keyframes pwSlideDown { from{opacity:0;transform:translateY(-8px)} to{opacity:1;transform:translateY(0)} }
      `}</style>
    </>
  )
}

function MenuItem({ icon, label, onClick, highlight }) {
  const [hov, setHov] = useState(false)
  return (
    <button onClick={onClick} style={{
      width: '100%', background: hov ? (highlight ? 'rgba(245,200,66,0.08)' : 'rgba(255,255,255,0.04)') : 'transparent',
      border: 'none', color: highlight ? '#f5c842' : '#ccc',
      padding: '9px 12px', borderRadius: '8px', fontSize: '12px', fontWeight: '500',
      cursor: 'pointer', textAlign: 'left', display: 'flex', alignItems: 'center', gap: '8px',
      transition: 'background .1s',
    }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
    >
      <span>{icon}</span> {label}
    </button>
  )
}
