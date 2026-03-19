import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function Support() {
  const [count, setCount] = useState(0)
  const [sparkles, setSparkles] = useState([])
  const [clicked, setClicked] = useState(false)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount(prev => {
        if (prev < 47) return prev + 1
        clearInterval(timer)
        return prev
      })
    }, 30)
    return () => clearInterval(timer)
  }, [])

  function handleSupport() {
    setClicked(true)
    const newSparkles = Array.from({length: 8}, (_, i) => ({
      id: Date.now() + i,
      x: Math.random() * 200 - 100,
      y: Math.random() * -150 - 20,
    }))
    setSparkles(newSparkles)
    setTimeout(() => setSparkles([]), 1000)
    window.open('https://buymeacoffee.com/arushbhise', '_blank')
  }

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes sparkle { 0% { opacity: 1; transform: translate(0,0) scale(1); } 100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0); } }
        @keyframes pulse { 0%,100% { box-shadow: 0 0 0 0 rgba(225,6,0,0.4); } 50% { box-shadow: 0 0 0 12px rgba(225,6,0,0); } }
        @keyframes float { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(-8px); } }
        @keyframes shimmer { 0% { background-position: -200% 0; } 100% { background-position: 200% 0; } }
        .support-btn { animation: pulse 2s infinite; }
        .support-btn:hover { opacity: 0.9; transform: scale(1.03); transition: all .2s; }
        .card-hover:hover { border-color: #e10600 !important; transform: translateY(-2px); transition: all .2s; }
        .fade-up { animation: fadeUp .5s ease forwards; }
        .float { animation: float 3s ease-in-out infinite; }
      `}</style>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: '60px 24px 40px', maxWidth: '600px', margin: '0 auto' }}>
        <div className="float" style={{ fontSize: '52px', marginBottom: '16px' }}>🏎️</div>
        <h1 style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
          Keep PitWall in the<br/>
          <span style={{ color: '#e10600' }}>fast lane</span>
        </h1>
        <p style={{ fontSize: '15px', color: '#666', lineHeight: '1.7', marginBottom: '8px' }}>
          PitWall is built by one F1-obsessed CS student, completely free for every fan. 
          If it's helped you win arguments about tire strategy or settle debates about who really had the better season — this is for you.
        </p>
      </div>

      {/* Counter */}
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', background: '#111', border: '0.5px solid #222', borderRadius: '20px', padding: '8px 20px' }}>
          <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#52e252', animation: 'pulse 2s infinite' }}></div>
          <span style={{ fontSize: '13px', color: '#888' }}>
            <span style={{ color: '#fff', fontWeight: '700' }}>{count}</span> F1 fans have supported PitWall
          </span>
        </div>
      </div>

      {/* Main CTA */}
      <div style={{ maxWidth: '500px', margin: '0 auto', padding: '0 24px 32px' }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a0000, #110000)',
          border: '0.5px solid #e10600',
          borderRadius: '16px', padding: '32px',
          textAlign: 'center', position: 'relative', overflow: 'hidden'
        }}>
          <div style={{
            position: 'absolute', top: 0, left: 0, right: 0, height: '2px',
            background: 'linear-gradient(90deg, transparent, #e10600, transparent)',
            animation: 'shimmer 2s linear infinite',
            backgroundSize: '200% 100%'
          }}></div>

          <div style={{ fontSize: '28px', marginBottom: '8px' }}>☕</div>
          <div style={{ fontSize: '20px', fontWeight: '800', marginBottom: '8px' }}>Buy me a coffee</div>
          <div style={{ fontSize: '13px', color: '#888', marginBottom: '24px', lineHeight: '1.6' }}>
            Every coffee keeps the servers running and me motivated to ship new features. 
            Takes 30 seconds and means a lot.
          </div>

          <div style={{ position: 'relative', display: 'inline-block' }}>
            {sparkles.map(s => (
              <div key={s.id} style={{
                position: 'absolute', top: '50%', left: '50%',
                width: '8px', height: '8px', borderRadius: '50%',
                background: '#e10600', pointerEvents: 'none',
                '--tx': `${s.x}px`, '--ty': `${s.y}px`,
                animation: 'sparkle .8s ease forwards'
              }}/>
            ))}
            <button onClick={handleSupport} className="support-btn" style={{
              background: '#e10600', color: '#fff', border: 'none',
              padding: '14px 36px', borderRadius: '10px', fontSize: '15px',
              fontWeight: '700', cursor: 'pointer'
            }}>
              {clicked ? 'Thank you! ❤️' : 'Support PitWall'}
            </button>
          </div>

          <div style={{ fontSize: '11px', color: '#444', marginTop: '14px' }}>
            Powered by Buy Me a Coffee · Secure payment
          </div>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{ maxWidth: '700px', margin: '0 auto', padding: '0 24px 60px' }}>
        <div style={{ fontSize: '13px', color: '#555', textAlign: 'center', marginBottom: '20px', textTransform: 'uppercase', letterSpacing: '.5px' }}>
          What you're supporting
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {[
            { icon: '🏁', title: 'Race data for every season', desc: 'Real F1 telemetry from 2018 all the way to 2026 live season' },
            { icon: '🤖', title: 'AI race analyst', desc: 'Powered by GPT — answers questions about any race with real data' },
            { icon: '⚔️', title: 'Head to head battles', desc: 'Real season stats comparing any two drivers across any year' },
            { icon: '📡', title: 'Always up to date', desc: 'New races added automatically every race weekend' },
          ].map((f, i) => (
            <div key={i} className="card-hover" style={{
              background: '#111', border: '0.5px solid #1e1e1e',
              borderRadius: '12px', padding: '18px',
              animation: `fadeUp .5s ease ${i * 0.1}s both`
            }}>
              <div style={{ fontSize: '22px', marginBottom: '8px' }}>{f.icon}</div>
              <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '4px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.5' }}>{f.desc}</div>
            </div>
          ))}
        </div>

        <div style={{ textAlign: 'center', marginTop: '32px' }}>
          <Link to="/" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>
            ← Back to PitWall
          </Link>
        </div>
      </div>
    </div>
  )
}