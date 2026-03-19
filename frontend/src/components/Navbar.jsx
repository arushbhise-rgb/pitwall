import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const loc = useLocation()
  const tabs = [
    { label: 'Race replay', path: '/replay' },
    { label: 'Head to head', path: '/h2h' },
    { label: 'Standings', path: '/standings' },
    { label: 'Support', path: '/support' },
    { label: 'Contact', path: '/contact' },
  ]
  return (
    <nav style={{
      background: '#e10600', padding: '0 24px',
      height: '52px', display: 'flex',
      alignItems: 'center', justifyContent: 'space-between'
    }}>
      <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '10px', textDecoration: 'none' }}>
        <div style={{
          width: '32px', height: '32px', background: '#fff',
          borderRadius: '7px', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontWeight: '800',
          color: '#e10600', fontSize: '13px'
        }}>PW</div>
        <div>
          <div style={{ color: '#fff', fontSize: '15px', fontWeight: '600' }}>PitWall</div>
          <div style={{ color: 'rgba(255,255,255,.6)', fontSize: '10px' }}>F1 Race Analyzer</div>
        </div>
      </Link>
      <div style={{ display: 'flex', gap: '4px' }}>
        {tabs.map(t => (
          <Link key={t.path} to={t.path} style={{
            color: loc.pathname === t.path ? '#fff' : 'rgba(255,255,255,.65)',
            fontSize: '13px', padding: '6px 14px', borderRadius: '6px',
            background: loc.pathname === t.path ? 'rgba(255,255,255,.2)' : 'transparent',
            textDecoration: 'none', transition: 'all .15s'
          }}>{t.label}</Link>
        ))}
      </div>
    </nav>
  )
}