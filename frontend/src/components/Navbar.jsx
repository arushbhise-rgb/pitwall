import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const loc = useLocation()
  const [menuOpen, setMenuOpen] = useState(false)

  const tabs = [
    { label: 'Race replay', path: '/replay' },
    { label: 'Head to head', path: '/h2h' },
    { label: 'Standings', path: '/standings' },
    { label: 'Drivers', path: '/drivers' },
    { label: 'Calendar', path: '/calendar' },
    { label: 'Support', path: '/support' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <>
      <nav style={{
        background: 'rgba(10,10,10,0.95)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        padding: '0 20px',
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
            <div style={{ color: '#fff', fontSize: '14px', fontWeight: '700', letterSpacing: '-0.3px' }}>PitWall</div>
            <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '8px', letterSpacing: '1px', textTransform: 'uppercase' }}>F1 Race Analyzer</div>
          </div>
        </Link>

        <div className="desktop-nav" style={{ display: 'flex', gap: '2px' }}>
          {tabs.map(t => {
            const isActive = loc.pathname === t.path
            return (
              <Link key={t.path} to={t.path} style={{
                color: isActive ? '#fff' : 'rgba(255,255,255,.45)',
                fontSize: '12px', padding: '5px 10px', borderRadius: '6px',
                background: isActive ? 'rgba(225,6,0,0.15)' : 'transparent',
                border: `0.5px solid ${isActive ? 'rgba(225,6,0,0.3)' : 'transparent'}`,
                textDecoration: 'none', transition: 'all .15s',
                fontWeight: isActive ? '600' : '400',
              }}>{t.label}</Link>
            )
          })}
        </div>

        <button
          className="mobile-menu-btn"
          onClick={() => setMenuOpen(!menuOpen)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            padding: '4px', display: 'none',
            flexDirection: 'column', gap: '5px', alignItems: 'center'
          }}>
          <div style={{ width: '22px', height: '2px', background: menuOpen ? '#e10600' : '#fff', transition: 'all .2s', transform: menuOpen ? 'rotate(45deg) translate(5px,5px)' : 'none', borderRadius: '2px' }}></div>
          <div style={{ width: '22px', height: '2px', background: '#fff', opacity: menuOpen ? 0 : 1, transition: 'all .2s', borderRadius: '2px' }}></div>
          <div style={{ width: '22px', height: '2px', background: menuOpen ? '#e10600' : '#fff', transition: 'all .2s', transform: menuOpen ? 'rotate(-45deg) translate(5px,-5px)' : 'none', borderRadius: '2px' }}></div>
        </button>
      </nav>

      {menuOpen && (
        <div className="mobile-menu" style={{
          position: 'fixed', top: '52px', left: 0, right: 0,
          background: '#0f0f0f',
          borderBottom: '0.5px solid #1a1a1a',
          zIndex: 99, padding: '8px',
          display: 'none'
        }}>
          {tabs.map(t => (
            <Link key={t.path} to={t.path}
              onClick={() => setMenuOpen(false)}
              style={{
                display: 'block',
                color: loc.pathname === t.path ? '#e10600' : '#aaa',
                fontSize: '14px', padding: '14px 16px',
                borderRadius: '8px',
                background: loc.pathname === t.path ? 'rgba(225,6,0,0.08)' : 'transparent',
                textDecoration: 'none',
                fontWeight: loc.pathname === t.path ? '600' : '400',
                borderBottom: '0.5px solid #1a1a1a',
                transition: 'all .15s'
              }}>{t.label}</Link>
          ))}
        </div>
      )}
    </>
  )
}