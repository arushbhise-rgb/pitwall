import { Link, useLocation } from 'react-router-dom'
import { useState } from 'react'

export default function Navbar() {
  const loc = useLocation()
  const [hovered, setHovered] = useState(null)

  const tabs = [
    { label: 'Race replay', path: '/replay' },
    { label: 'Head to head', path: '/h2h' },
    { label: 'Standings', path: '/standings' },
    { label: 'Support', path: '/support' },
    { label: 'Contact', path: '/contact' },
  ]

  return (
    <nav style={{
      background: 'rgba(10,10,10,0.95)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      padding: '0 24px',
      height: '52px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      borderBottom: '0.5px solid #1a1a1a',
      position: 'sticky',
      top: 0,
      zIndex: 100,
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '32px', height: '32px',
          background: 'linear-gradient(135deg, #e10600, #b30500)',
          borderRadius: '7px',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontWeight: '800', color: '#fff', fontSize: '13px',
          boxShadow: '0 0 12px rgba(225,6,0,0.4)',
          transition: 'box-shadow 0.2s',
        }}>PW</div>
        <div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '700', letterSpacing: '-0.3px' }}>PitWall</div>
          <div style={{ color: 'rgba(255,255,255,.35)', fontSize: '9px', letterSpacing: '1px', textTransform: 'uppercase' }}>F1 Race Analyzer</div>
        </div>
      </Link>

      <div style={{ display: 'flex', gap: '2px' }}>
        {tabs.map(t => {
          const isActive = loc.pathname === t.path
          return (
            <Link key={t.path} to={t.path}
              onMouseEnter={() => setHovered(t.path)}
              onMouseLeave={() => setHovered(null)}
              style={{
                color: isActive ? '#fff' : hovered === t.path ? 'rgba(255,255,255,.8)' : 'rgba(255,255,255,.45)',
                fontSize: '13px', padding: '6px 12px', borderRadius: '6px',
                background: isActive ? 'rgba(225,6,0,0.15)' : hovered === t.path ? 'rgba(255,255,255,0.05)' : 'transparent',
                border: isActive ? '0.5px solid rgba(225,6,0,0.3)' : '0.5px solid transparent',
                textDecoration: 'none',
                transition: 'all .15s',
                fontWeight: isActive ? '600' : '400',
                position: 'relative',
              }}>
              {isActive && (
                <div style={{
                  position: 'absolute', bottom: '-1px', left: '20%', right: '20%',
                  height: '2px', background: '#e10600',
                  borderRadius: '1px',
                  boxShadow: '0 0 6px rgba(225,6,0,0.8)',
                }} />
              )}
              {t.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}