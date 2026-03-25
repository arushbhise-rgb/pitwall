import { useNavigate } from 'react-router-dom'
import { Helmet } from 'react-helmet-async'

export default function NotFound() {
  const navigate = useNavigate()
  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
      <Helmet>
        <title>404 — Page Not Found | PitWall</title>
      </Helmet>
      <div style={{ fontSize: '80px', fontWeight: '800', color: '#1a1a1a' }}>404</div>
      <div style={{ fontSize: '20px', fontWeight: '700' }}>Pit lane not found</div>
      <div style={{ fontSize: '14px', color: '#555' }}>This page retired from the race early.</div>
      <button onClick={() => navigate('/')} style={{ background: '#e10600', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
        Back to PitWall
      </button>
    </div>
  )
}