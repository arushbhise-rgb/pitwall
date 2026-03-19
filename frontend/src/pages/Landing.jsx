import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()
  const [scrollY, setScrollY] = useState(0)
  const [visible, setVisible] = useState({})
  const refs = useRef({})

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => entries.forEach(e => {
        if (e.isIntersecting) setVisible(prev => ({ ...prev, [e.target.id]: true }))
      }),
      { threshold: 0.1 }
    )
    Object.values(refs.current).forEach(r => r && observer.observe(r))
    return () => observer.disconnect()
  }, [])

  function addRef(id) {
    return el => { refs.current[id] = el }
  }

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a', overflowX: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideRight { from { opacity: 0; transform: translateX(-30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes slideLeft { from { opacity: 0; transform: translateX(30px); } to { opacity: 1; transform: translateX(0); } }
        @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: .5; } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes gradientShift { 0%,100% { background-position: 0% 50%; } 50% { background-position: 100% 50%; } }
        @keyframes float { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-10px); } }
        @keyframes lineGrow { from { width: 0; } to { width: 100%; } }
        @keyframes numberCount { from { opacity: 0; transform: scale(0.5); } to { opacity: 1; transform: scale(1); } }
        .hero-title { 
          background: linear-gradient(135deg, #fff 0%, #fff 50%, #e10600 100%);
          background-size: 200% 200%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gradientShift 4s ease infinite;
        }
        .feature-card {
          transition: all .3s ease;
          cursor: default;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          border-color: rgba(225,6,0,0.4) !important;
        }
        .cta-btn-primary {
          transition: all .2s ease;
          position: relative;
          overflow: hidden;
        }
        .cta-btn-primary::before {
          content: '';
          position: absolute;
          top: 0; left: -100%;
          width: 100%; height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
          transition: left .4s ease;
        }
        .cta-btn-primary:hover::before { left: 100%; }
        .cta-btn-primary:hover { transform: scale(1.03); }
        .cta-btn-secondary:hover { background: rgba(255,255,255,0.08) !important; transform: scale(1.03); transition: all .2s; }
        .nav-link:hover { background: rgba(255,255,255,0.1) !important; }
        .stat-card:hover { border-color: #e10600 !important; transform: scale(1.03); transition: all .2s; }
      `}</style>

      {/* Navbar */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 100,
        background: scrollY > 50 ? 'rgba(10,10,10,0.95)' : 'transparent',
        backdropFilter: scrollY > 50 ? 'blur(20px)' : 'none',
        borderBottom: scrollY > 50 ? '0.5px solid #1e1e1e' : 'none',
        padding: '0 32px', height: '60px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        transition: 'all .3s ease'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '32px', height: '32px', background: '#e10600',
            borderRadius: '8px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '13px'
          }}>PW</div>
          <span style={{ fontWeight: '700', fontSize: '16px' }}>PitWall</span>
        </div>
        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
          {[
            { label: 'Race replay', path: '/replay' },
            { label: 'Head to head', path: '/h2h' },
            { label: 'Support', path: '/support' },
          ].map(t => (
            <button key={t.path} onClick={() => navigate(t.path)} className="nav-link" style={{
              background: 'transparent', border: 'none', color: 'rgba(255,255,255,.7)',
              fontSize: '13px', padding: '6px 14px', borderRadius: '6px', cursor: 'pointer'
            }}>{t.label}</button>
          ))}
          <button onClick={() => navigate('/replay')} style={{
            background: '#e10600', border: 'none', color: '#fff',
            fontSize: '13px', padding: '7px 18px', borderRadius: '8px',
            cursor: 'pointer', fontWeight: '600', marginLeft: '8px'
          }}>Launch app</button>
        </div>
      </nav>

      {/* Hero */}
      <div style={{ padding: '80px 32px 60px', maxWidth: '1000px', margin: '0 auto', textAlign: 'center' }}>
        <div style={{ animation: 'fadeIn .8s ease forwards', marginBottom: '20px' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px',
            background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.3)',
            padding: '6px 16px', borderRadius: '20px', marginBottom: '28px'
          }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#e10600', animation: 'pulse 1.5s infinite' }}></div>
            <span style={{ color: '#e10600', fontSize: '12px', fontWeight: '600', letterSpacing: '.5px' }}>2026 SEASON LIVE</span>
          </div>
        </div>

        <h1 className="hero-title" style={{
          fontSize: '64px', fontWeight: '900', lineHeight: '1.05',
          letterSpacing: '-2px', marginBottom: '24px',
          animation: 'fadeUp .8s ease .1s both'
        }}>
          F1 data for fans<br/>who want more
        </h1>

        <p style={{
          fontSize: '18px', color: '#666', lineHeight: '1.8',
          maxWidth: '520px', margin: '0 auto 40px',
          animation: 'fadeUp .8s ease .2s both'
        }}>
          Race replays, driver battles, tire strategy, sector times and AI race analysis.
          Every season from 2018 to live 2026. Free forever.
        </p>

        <div style={{
          display: 'flex', gap: '12px', justifyContent: 'center',
          flexWrap: 'wrap', animation: 'fadeUp .8s ease .3s both'
        }}>
          <button onClick={() => navigate('/replay')} className="cta-btn-primary" style={{
            background: '#e10600', color: '#fff', border: 'none',
            padding: '15px 36px', borderRadius: '10px', fontSize: '15px',
            fontWeight: '700', cursor: 'pointer'
          }}>Analyze a race →</button>
          <button onClick={() => navigate('/h2h')} className="cta-btn-secondary" style={{
            background: 'transparent', color: '#fff',
            border: '0.5px solid #333', padding: '15px 36px',
            borderRadius: '10px', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer'
          }}>Compare drivers</button>
        </div>

        {/* Floating tags */}
        <div style={{
          display: 'flex', gap: '8px', justifyContent: 'center',
          flexWrap: 'wrap', marginTop: '32px',
          animation: 'fadeUp .8s ease .4s both'
        }}>
          {['No signup', 'No paywall', '2018—2026', 'Real telemetry', 'AI analyst', 'Free forever'].map((tag, i) => (
            <div key={i} style={{
              background: '#111', border: '0.5px solid #1e1e1e',
              padding: '4px 12px', borderRadius: '20px',
              fontSize: '12px', color: '#555'
            }}>{tag}</div>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div id="stats" ref={addRef('stats')} style={{
        maxWidth: '900px', margin: '0 auto', padding: '20px 32px 60px',
        display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '16px',
        opacity: visible.stats ? 1 : 0,
        transform: visible.stats ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s ease'
      }}>
        {[
          { val: '9', unit: 'seasons', lbl: 'of race data' },
          { val: '200+', unit: 'races', lbl: 'fully analyzed' },
          { val: '20', unit: 'drivers', lbl: 'tracked live' },
          { val: '∞', unit: 'questions', lbl: 'for AI analyst' },
        ].map((s, i) => (
          <div key={i} className="stat-card" style={{
            background: '#111', border: '0.5px solid #1e1e1e',
            borderRadius: '12px', padding: '20px', textAlign: 'center',
            transition: 'all .3s ease'
          }}>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#fff' }}>
              {s.val}<span style={{ fontSize: '16px', color: '#e10600' }}>{s.unit === 'seasons' ? '' : ''}</span>
            </div>
            <div style={{ fontSize: '12px', color: '#e10600', fontWeight: '600', marginTop: '2px' }}>{s.unit}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '4px' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* Features */}
      <div style={{ maxWidth: '900px', margin: '0 auto', padding: '0 32px 80px' }}>
        <div id="feat-title" ref={addRef('feat-title')} style={{
          textAlign: 'center', marginBottom: '40px',
          opacity: visible['feat-title'] ? 1 : 0,
          transform: visible['feat-title'] ? 'translateY(0)' : 'translateY(20px)',
          transition: 'all .6s ease'
        }}>
          <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px' }}>Everything in one place</div>
          <div style={{ fontSize: '28px', fontWeight: '800' }}>Built for the real F1 fan</div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '16px' }}>
          {[
            { icon: '🏎️', title: 'Race Replay', desc: 'Every position change, every lap. Watch the strategy unfold through real telemetry data from any race since 2018.', color: '#3671c6', delay: 0 },
            { icon: '⚔️', title: 'Head to Head', desc: 'Settle debates with data. Compare any two drivers across a full season — wins, poles, avg finish, H2H record.', color: '#e10600', delay: 0.1 },
            { icon: '🤖', title: 'AI Analyst', desc: 'Ask anything about a race. Our AI reads the actual lap data to give you real, specific answers — not generic takes.', color: '#52e252', delay: 0.2 },
            { icon: '📊', title: 'Gap to Leader', desc: 'See exactly when gaps opened, when the field bunched, and who had the pace when it mattered most.', color: '#ff8000', delay: 0.3 },
            { icon: '🔄', title: 'Tire Strategy', desc: 'Visual breakdown of every stint. Understand who ran long, who undercut, and whether the strategy call paid off.', color: '#f5c842', delay: 0.4 },
            { icon: '⚡', title: 'Sector Times', desc: 'Drill into sector by sector pace. Find out exactly where Hamilton was losing time, or where Verstappen was flying.', color: '#00d2be', delay: 0.5 },
          ].map((f, i) => (
            <div key={i} id={`feat-${i}`} ref={addRef(`feat-${i}`)} className="feature-card" style={{
              background: '#111', border: '0.5px solid #1e1e1e',
              borderRadius: '14px', padding: '24px',
              opacity: visible[`feat-${i}`] ? 1 : 0,
              transform: visible[`feat-${i}`] ? 'translateY(0)' : 'translateY(30px)',
              transition: `all .6s ease ${f.delay}s`
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: f.color + '22', border: `0.5px solid ${f.color}44`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '20px', marginBottom: '14px'
              }}>{f.icon}</div>
              <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '8px' }}>{f.title}</div>
              <div style={{ fontSize: '12px', color: '#555', lineHeight: '1.7' }}>{f.desc}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Race preview section */}
      <div id="preview" ref={addRef('preview')} style={{
        maxWidth: '900px', margin: '0 auto', padding: '0 32px 80px',
        opacity: visible.preview ? 1 : 0,
        transform: visible.preview ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s ease'
      }}>
        <div style={{
          background: '#111', border: '0.5px solid #1e1e1e',
          borderRadius: '16px', padding: '28px', overflow: 'hidden'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <div>
              <div style={{ fontSize: '16px', fontWeight: '700' }}>2026 Chinese Grand Prix</div>
              <div style={{ fontSize: '12px', color: '#555', marginTop: '2px' }}>58 laps · 22 drivers · Live data</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['positions','laptimes','tires','gap','sectors'].map((t, i) => (
                <div key={i} style={{
                  background: i === 0 ? '#e10600' : '#1a1a1a',
                  border: '0.5px solid #333', padding: '4px 10px',
                  borderRadius: '6px', fontSize: '10px', color: '#fff'
                }}>{t}</div>
              ))}
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: '10px', marginBottom: '20px' }}>
            {[
              { val: 'RUS', lbl: 'Race winner' },
              { val: '58', lbl: 'Total laps' },
              { val: '22', lbl: 'Drivers' },
              { val: 'Live', lbl: '2026 season' },
            ].map((s, i) => (
              <div key={i} style={{ background: '#1a1a1a', borderRadius: '8px', padding: '10px 12px' }}>
                <div style={{ fontSize: '18px', fontWeight: '600' }}>{s.val}</div>
                <div style={{ fontSize: '10px', color: '#555', marginTop: '2px' }}>{s.lbl}</div>
              </div>
            ))}
          </div>

          <div style={{ background: '#0a0a0a', borderRadius: '10px', padding: '16px' }}>
            <div style={{ fontSize: '11px', color: '#555', marginBottom: '12px' }}>Position changes — every lap</div>
            <svg width="100%" height="80" viewBox="0 0 800 80">
              {[
                { points: '0,10 100,10 200,10 300,10 400,10 500,10 600,10 700,10 800,10', color: '#00d2be' },
                { points: '0,20 100,20 200,15 300,20 400,20 500,20 600,15 700,20 800,20', color: '#e8002d' },
                { points: '0,50 100,40 200,30 300,25 400,30 500,25 600,20 700,25 800,30', color: '#ff8000' },
                { points: '0,30 100,35 200,40 300,35 400,25 500,30 600,35 700,30 800,25', color: '#3671c6' },
                { points: '0,40 100,50 200,45 300,50 400,45 500,40 600,45 700,40 800,40', color: '#52e252' },
              ].map((line, i) => (
                <polyline key={i} points={line.points} fill="none" stroke={line.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.8"/>
              ))}
            </svg>
          </div>

          <button onClick={() => navigate('/replay')} style={{
            marginTop: '16px', width: '100%', background: 'rgba(225,6,0,0.1)',
            border: '0.5px solid rgba(225,6,0,0.3)', color: '#e10600',
            padding: '10px', borderRadius: '8px', fontSize: '13px',
            fontWeight: '600', cursor: 'pointer', transition: 'all .2s'
          }}
            onMouseEnter={e => e.target.style.background = 'rgba(225,6,0,0.2)'}
            onMouseLeave={e => e.target.style.background = 'rgba(225,6,0,0.1)'}
          >Open full race replay →</button>
        </div>
      </div>

      {/* CTA */}
      <div id="cta" ref={addRef('cta')} style={{
        maxWidth: '600px', margin: '0 auto', padding: '0 32px 80px',
        textAlign: 'center',
        opacity: visible.cta ? 1 : 0,
        transform: visible.cta ? 'translateY(0)' : 'translateY(30px)',
        transition: 'all .6s ease'
      }}>
        <div style={{
          background: 'linear-gradient(135deg, #1a0000, #0f0f0f)',
          border: '0.5px solid #2a0000', borderRadius: '20px', padding: '48px 32px'
        }}>
          <div style={{ fontSize: '11px', color: '#e10600', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '16px' }}>Ready to go deeper?</div>
          <div style={{ fontSize: '32px', fontWeight: '800', marginBottom: '12px', lineHeight: '1.2' }}>
            The race data you've<br/>always wanted
          </div>
          <div style={{ fontSize: '14px', color: '#555', marginBottom: '28px', lineHeight: '1.7' }}>
            No signup. No paywall. No nonsense.<br/>Just real F1 data for real F1 fans.
          </div>
          <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
            <button onClick={() => navigate('/replay')} className="cta-btn-primary" style={{
              background: '#e10600', color: '#fff', border: 'none',
              padding: '14px 32px', borderRadius: '10px', fontSize: '14px',
              fontWeight: '700', cursor: 'pointer'
            }}>Analyze a race →</button>
            <button onClick={() => navigate('/h2h')} className="cta-btn-secondary" style={{
              background: 'transparent', color: '#fff',
              border: '0.5px solid #333', padding: '14px 32px',
              borderRadius: '10px', fontSize: '14px',
              fontWeight: '600', cursor: 'pointer'
            }}>Compare drivers</button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '0.5px solid #1a1a1a', padding: '24px 32px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: '12px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px', background: '#e10600',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '10px'
          }}>PW</div>
          <span style={{ fontSize: '13px', color: '#333' }}>PitWall</span>
        </div>
        <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
          <button onClick={() => navigate('/support')} style={{ background: 'none', border: 'none', color: '#333', fontSize: '12px', cursor: 'pointer' }}>Support</button>
          <button onClick={() => navigate('/contact')} style={{ background: 'none', border: 'none', color: '#333', fontSize: '12px', cursor: 'pointer' }}>Contact</button>
          <span style={{ fontSize: '12px', color: '#222' }}>Not affiliated with Formula 1</span>
        </div>
      </div>
    </div>
  )
}