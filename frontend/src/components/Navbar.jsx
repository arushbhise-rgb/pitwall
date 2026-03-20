import { Link, useLocation, useState } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const tabs = [
    { label: 'Race replay', path: '/replay' },
    { label: 'Head to head', path: '/h2h' },
    { label: 'Standings', path: '/standings' },
    { label: 'Support', path: '/support' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <>
      <nav style={{
        background: 'rgba(10,10,10,0.95)',
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
        zIndex: 100,
      }}>
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '8px', textDecoration: 'none' }}>
          <div style={{
            width: '30px', height: '30px',
            background: 'linear-gradient(135deg, #e10600, #b30500)',
            borderRadius: '7px',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: '800', color: '#fff', fontSize: '12px',
            boxShadow: '0 0 12px rgba(225,6,0,0.4)',
          }}>PW</div>
          <div>
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700' }}>PitWall</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>F1 Race Analyzer</div>
          </div>
        </Link>

        {/* Desktop tabs */}
        <div style={{ display: 'flex', gap: '2px', '@media(max-width:768px)': { display: 'none' } }} className="desktop-nav">
          {tabs.map(t => (
            <Link key={t.path} to={t.path} style={{
              color: loc.pathname === t.path ? '#fff' : 'rgba(255,255,255,.45)',
              fontSize: '12px', padding: '5px 10px', borderRadius: '6px',
              background: loc.pathname === t.path ? 'rgba(225,6,0,0.15)' : 'transparent',
              border: `0.5px solid ${loc.pathname === t.path ? 'rgba(225,6,0,0.3)' : 'transparent'}`,
              textDecoration: 'none', transition: 'all .15s',
              fontWeight: loc.pathname === t.path ? '600' : '400',
            }}>{t.label}</Link>
          ))}
        </div>

        {/* Mobile hamburger */}
        <button onClick={() => setMenuOpen(!menuOpen)} className="mobile-menu-btn" style={{
          background: 'none', border: 'none', color: '#fff',
          cursor: 'pointer', padding: '4px', display: 'none',
          flexDirection: 'column', gap: '5px'
        }}>
          <div style={{ width: '22px', height: '2px', background: menuOpen ? '#e10600' : '#fff', transition: 'all .2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none' }}></div>
          <div style={{ width: '22px', height: '2px', background: '#fff', opacity: menuOpen ? 0 : 1, transition: 'all .2s' }}></div>
          <div style={{ width: '22px', height: '2px', background: menuOpen ? '#e10600' : '#fff', transition: 'all .2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none' }}></div>
        </button>
      </nav>

      {/* Mobile menu */}
      {menuOpen && (
        <div style={{
          position: 'fixed', top: '52px', left: 0, right: 0,
          background: '#0f0f0f', borderBottom: '0.5px solid #1a1a1a',
          zIndex: 99, padding: '8px',
          display: 'none'
        }} className="mobile-menu">
          {tabs.map(t => (
            <Link key={t.path} to={t.path} onClick={() => setMenuOpen(false)} style={{
              display: 'block', color: loc.pathname === t.path ? '#e10600' : '#aaa',
              fontSize: '14px', padding: '12px 16px', borderRadius: '8px',
              background: loc.pathname === t.path ? 'rgba(225,6,0,0.08)' : 'transparent',
              textDecoration: 'none', fontWeight: loc.pathname === t.path ? '600' : '400',
              borderBottom: '0.5px solid #1a1a1a'
            }}>{t.label}</Link>
          ))}
        </div>
      )}

      <style>{`
        @media (max-width: 768px) {
          .desktop-nav { display: none !important; }
          .mobile-menu-btn { display: flex !important; }
          .mobile-menu { display: block !important; }
        }
      `}</style>
    </>
  )
}