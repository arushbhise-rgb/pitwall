import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

const QUICK_LINKS = [
  { label: '🏎️ Race Replay', path: '/replay' },
  { label: '⚔️ Head to Head', path: '/h2h' },
  { label: '📊 Standings', path: '/standings' },
  { label: '🗓️ Calendar', path: '/calendar' },
  { label: '👥 Drivers', path: '/drivers' },
  { label: '🏁 Paddock', path: '/community' },
]

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '28px', textAlign: 'center', padding: '24px' }}>
      <Helmet><title>404 — Page Not Found | PitWall</title></Helmet>

      {/* Big 404 with RETIRED badge */}
      <div style={{ position: 'relative', display: 'inline-block' }}>
        <div style={{ fontSize: '120px', fontWeight: '900', color: '#111', lineHeight: 1, userSelect: 'none', letterSpacing: '-4px' }}>404</div>
        <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: '12px', fontWeight: '700', color: '#e10600', background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.4)', padding: '5px 16px', borderRadius: '20px', letterSpacing: '2px' }}>RETIRED</div>
        </div>
      </div>

      <div>
        <div style={{ fontSize: '22px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Pit lane not found</div>
        <div style={{ fontSize: '14px', color: '#555', lineHeight: 1.7 }}>This page retired early from the race.<br/>Maybe one of these will get you back on track.</div>
      </div>

      {/* Quick links */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center', maxWidth: '420px' }}>
        {QUICK_LINKS.map(link => (
          <button key={link.path} onClick={() => navigate(link.path)} style={{
            background: '#111', border: '0.5px solid #222', color: '#888',
            padding: '9px 18px', borderRadius: '8px', fontSize: '13px',
            cursor: 'pointer', transition: 'all .2s', fontWeight: '500'
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(225,6,0,0.4)'; e.currentTarget.style.color = '#fff'; e.currentTarget.style.background = 'rgba(225,6,0,0.06)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = '#222'; e.currentTarget.style.color = '#888'; e.currentTarget.style.background = '#111' }}
          >{link.label}</button>
        ))}
      </div>

      <button onClick={() => navigate('/')} style={{
        background: '#e10600', color: '#fff', border: 'none',
        padding: '13px 32px', borderRadius: '10px', fontSize: '14px',
        fontWeight: '700', cursor: 'pointer', letterSpacing: '-0.2px',
        boxShadow: '0 0 20px rgba(225,6,0,0.3)', transition: 'all .2s'
      }}
        onMouseEnter={e => e.currentTarget.style.boxShadow = '0 0 28px rgba(225,6,0,0.5)'}
        onMouseLeave={e => e.currentTarget.style.boxShadow = '0 0 20px rgba(225,6,0,0.3)'}
      >Back to PitWall →</button>
    </div>
  )
}
