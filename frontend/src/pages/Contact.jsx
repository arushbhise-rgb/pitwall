import { useState } from 'react'
import { Link } from 'react-router-dom'

export default function Contact() {
  const [copied, setCopied] = useState(false)
  const [hovered, setHovered] = useState(null)

  function copyEmail() {
    navigator.clipboard.writeText('m3gkr@unb.ca')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const links = [
    {
      icon: '✉️',
      title: 'Email',
      value: 'm3gkr@unb.ca',
      sub: 'I reply within 24 hours',
      action: copyEmail,
      actionLabel: copied ? 'Copied!' : 'Copy email',
      color: '#e10600',
    },
    {
      icon: '💻',
      title: 'GitHub',
      value: 'github.com/arushbhise-rgb',
      sub: 'Found a bug? Open an issue',
      action: () => window.open('https://github.com/arushbhise-rgb/pitwall', '_blank'),
      actionLabel: 'View repo →',
      color: '#3671c6',
    },
    {
      icon: '☕',
      title: 'Support',
      value: 'buymeacoffee.com/arushbhise',
      sub: 'Help keep PitWall running',
      action: () => window.open('https://buymeacoffee.com/arushbhise', '_blank'),
      actionLabel: 'Support →',
      color: '#f5c842',
    },
  ]

  return (
    <div style={{ minHeight: 'calc(100vh - 52px)', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '40px 24px', position: 'relative', overflow: 'hidden' }}>
      <style>{`
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        @keyframes pulse { 0%,100% { opacity:1; } 50% { opacity:0.4; } }
        @keyframes float { 0%,100% { transform:translateY(0); } 50% { transform:translateY(-8px); } }
        .contact-card { transition: all 0.3s cubic-bezier(0.16,1,0.3,1); }
        .contact-card:hover { transform: translateY(-4px) !important; }
      `}</style>

      {/* Background glow */}
      <div style={{ position: 'absolute', top: '30%', left: '50%', transform: 'translate(-50%,-50%)', width: '500px', height: '300px', background: 'radial-gradient(ellipse, rgba(225,6,0,0.05), transparent 70%)', pointerEvents: 'none' }}/>

      <div style={{ maxWidth: '520px', width: '100%', position: 'relative' }}>

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '40px', animation: 'fadeUp .5s ease both' }}>
          <div style={{ width: '56px', height: '56px', background: 'linear-gradient(135deg, #e10600, #b30500)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px', fontWeight: '800', color: '#fff', fontSize: '18px', boxShadow: '0 0 24px rgba(225,6,0,0.3)', animation: 'float 3s ease-in-out infinite' }}>PW</div>
          <div style={{ fontSize: '24px', fontWeight: '800', marginBottom: '8px', letterSpacing: '-0.5px' }}>Get in touch</div>
          <div style={{ fontSize: '14px', color: '#555', lineHeight: '1.7' }}>
            Built by one F1-obsessed CS student.<br/>
            Feedback, bugs, or just want to talk F1 — I'm here.
          </div>
        </div>

        {/* Contact cards */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '28px' }}>
          {links.map((l, i) => (
            <div key={i} className="contact-card" style={{
              background: hovered === i ? `${l.color}08` : 'rgba(255,255,255,0.02)',
              border: `0.5px solid ${hovered === i ? l.color + '33' : '#1e1e1e'}`,
              borderRadius: '14px', padding: '18px 20px',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px',
              animation: `fadeUp .5s ease ${i * 0.1 + 0.1}s both`,
              cursor: 'pointer',
            }}
              onMouseEnter={() => setHovered(i)}
              onMouseLeave={() => setHovered(null)}
              onClick={l.action}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <div style={{ width: '42px', height: '42px', background: l.color + '15', border: `0.5px solid ${l.color}33`, borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px', flexShrink: 0 }}>{l.icon}</div>
                <div>
                  <div style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '3px' }}>{l.title}</div>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: '#fff', marginBottom: '2px' }}>{l.value}</div>
                  <div style={{ fontSize: '11px', color: '#444' }}>{l.sub}</div>
                </div>
              </div>
              <div style={{ fontSize: '12px', color: l.color, background: l.color + '15', border: `0.5px solid ${l.color}33`, padding: '5px 12px', borderRadius: '8px', whiteSpace: 'nowrap', flexShrink: 0, fontWeight: '600' }}>
                {l.actionLabel}
              </div>
            </div>
          ))}
        </div>

        {/* Feature request box */}
        <div style={{
          background: 'rgba(255,255,255,0.02)', border: '0.5px solid #1e1e1e',
          borderRadius: '14px', padding: '20px',
          animation: 'fadeUp .5s ease .4s both'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '10px' }}>
            <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#52e252', animation: 'pulse 2s infinite' }}></div>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#fff' }}>Feature requests</div>
          </div>
          <div style={{ fontSize: '13px', color: '#555', lineHeight: '1.7' }}>
            Have an idea? I'm actively building PitWall and user feedback shapes what gets built next. Email me or open a GitHub issue — everything gets read.
          </div>
          <div style={{ display: 'flex', gap: '8px', marginTop: '14px', flexWrap: 'wrap' }}>
            {['Lap time comparison', 'Fantasy optimizer', 'Live race updates', 'Driver career stats'].map((tag, i) => (
              <div key={i} style={{ fontSize: '11px', color: '#444', background: '#111', border: '0.5px solid #1e1e1e', padding: '4px 10px', borderRadius: '8px' }}>{tag}</div>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', marginTop: '24px', animation: 'fadeUp .5s ease .5s both' }}>
          <Link to="/" style={{ fontSize: '12px', color: '#333', textDecoration: 'none', transition: 'color .2s' }}
            onMouseEnter={e => e.target.style.color = '#e10600'}
            onMouseLeave={e => e.target.style.color = '#333'}
          >← Back to PitWall</Link>
        </div>
      </div>
    </div>
  )
}