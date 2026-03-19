import { useNavigate } from 'react-router-dom'

export default function Landing() {
  const navigate = useNavigate()

  return (
    <div style={{ minHeight: '100vh', background: '#0a0a0a' }}>

      {/* Hero */}
      <div style={{
        padding: '80px 40px 60px',
        maxWidth: '900px',
        margin: '0 auto',
        textAlign: 'center'
      }}>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: '8px',
          background: '#e10600', padding: '4px 14px',
          borderRadius: '20px', marginBottom: '24px'
        }}>
          <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#fff' }}></div>
          <span style={{ color: '#fff', fontSize: '11px', fontWeight: '600', letterSpacing: '.5px' }}>2026 SEASON LIVE</span>
        </div>

        <h1 style={{
          fontSize: '52px', fontWeight: '800', lineHeight: '1.1',
          marginBottom: '20px', letterSpacing: '-1px'
        }}>
          The F1 data tool<br/>
          <span style={{ color: '#e10600' }}>fans actually want</span>
        </h1>

        <p style={{
          fontSize: '18px', color: '#888', lineHeight: '1.7',
          maxWidth: '560px', margin: '0 auto 36px'
        }}>
          Race replays, driver comparisons, tire strategy, sector times and AI race analysis — all in one place. Free forever.
        </p>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <button onClick={() => navigate('/replay')} style={{
            background: '#e10600', color: '#fff', border: 'none',
            padding: '14px 32px', borderRadius: '10px', fontSize: '15px',
            fontWeight: '700', cursor: 'pointer', transition: 'opacity .15s'
          }}>Analyze a race</button>
          <button onClick={() => navigate('/h2h')} style={{
            background: 'transparent', color: '#fff',
            border: '0.5px solid #333', padding: '14px 32px',
            borderRadius: '10px', fontSize: '15px',
            fontWeight: '600', cursor: 'pointer'
          }}>Compare drivers</button>
        </div>
      </div>

      {/* Feature cards */}
      <div style={{
        maxWidth: '900px', margin: '0 auto',
        padding: '0 40px 80px',
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px'
      }}>
        {[
          {
            icon: '🏎',
            title: 'Race Replay',
            desc: 'Position changes, lap times, tire strategy and sector times for every race since 2018',
            color: '#3671c6'
          },
          {
            icon: '⚔️',
            title: 'Head to Head',
            desc: 'Compare any two drivers across a full season — points, wins, poles, avg finish and more',
            color: '#e10600'
          },
          {
            icon: '🤖',
            title: 'AI Analyst',
            desc: 'Ask any question about a race and get data-driven answers from our AI race engineer',
            color: '#52e252'
          },
          {
            icon: '📊',
            title: 'Gap to Leader',
            desc: 'See exactly when gaps opened up, when the safety car bunched the field, and who was fastest',
            color: '#ff8000'
          },
          {
            icon: '🔄',
            title: 'Tire Strategy',
            desc: 'Visual breakdown of every driver\'s stint — compound, duration, and degradation patterns',
            color: '#f5c842'
          },
          {
            icon: '⚡',
            title: 'Sector Times',
            desc: 'Drill into sector by sector pace to see where drivers gained and lost time on track',
            color: '#00d2be'
          },
        ].map((f, i) => (
          <div key={i} style={{
            background: '#111', border: '0.5px solid #1e1e1e',
            borderRadius: '12px', padding: '20px',
            transition: 'border-color .15s', cursor: 'default'
          }}
            onMouseEnter={e => e.currentTarget.style.borderColor = f.color + '66'}
            onMouseLeave={e => e.currentTarget.style.borderColor = '#1e1e1e'}
          >
            <div style={{ fontSize: '24px', marginBottom: '10px' }}>{f.icon}</div>
            <div style={{ fontSize: '14px', fontWeight: '700', marginBottom: '6px', color: '#fff' }}>{f.title}</div>
            <div style={{ fontSize: '12px', color: '#666', lineHeight: '1.6' }}>{f.desc}</div>
          </div>
        ))}
      </div>

      {/* Stats bar */}
      <div style={{
        borderTop: '0.5px solid #1e1e1e',
        borderBottom: '0.5px solid #1e1e1e',
        padding: '28px 40px',
        display: 'flex', justifyContent: 'center', gap: '60px',
        flexWrap: 'wrap'
      }}>
        {[
          { val: '2018—2026', lbl: 'Seasons covered' },
          { val: '24', lbl: 'Races per season' },
          { val: '20', lbl: 'Drivers tracked' },
          { val: 'Free', lbl: 'Always' },
        ].map((s, i) => (
          <div key={i} style={{ textAlign: 'center' }}>
            <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff' }}>{s.val}</div>
            <div style={{ fontSize: '11px', color: '#555', marginTop: '3px' }}>{s.lbl}</div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ padding: '60px 40px', textAlign: 'center' }}>
        <div style={{ fontSize: '28px', fontWeight: '800', marginBottom: '12px' }}>
          Ready to go deeper?
        </div>
        <div style={{ fontSize: '14px', color: '#666', marginBottom: '28px' }}>
          No signup. No paywall. Just data.
        </div>
        <button onClick={() => navigate('/replay')} style={{
          background: '#e10600', color: '#fff', border: 'none',
          padding: '14px 40px', borderRadius: '10px', fontSize: '15px',
          fontWeight: '700', cursor: 'pointer'
        }}>Open PitWall</button>
      </div>

      {/* Footer */}
      <div style={{
        borderTop: '0.5px solid #1e1e1e',
        padding: '20px 40px',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '24px', height: '24px', background: '#e10600',
            borderRadius: '5px', display: 'flex', alignItems: 'center',
            justifyContent: 'center', fontWeight: '800', color: '#fff', fontSize: '10px'
          }}>PW</div>
          <span style={{ fontSize: '13px', color: '#555' }}>PitWall — F1 Race Analyzer</span>
        </div>
        <div style={{ fontSize: '12px', color: '#333' }}>
          Data from FastF1 and Jolpica. Not affiliated with Formula 1.
        </div>
      </div>
    </div>
  )
}