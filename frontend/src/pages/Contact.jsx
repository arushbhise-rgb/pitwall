export default function Contact() {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
      <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Contact</div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>Got feedback, found a bug, or want to collaborate?</div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Email</div>
          <a href="mailto:m3gkr@unb.ca" style={{ color: '#e10600', fontSize: '15px', textDecoration: 'none', fontWeight: '600' }}>
            m3gkr@unb.ca
          </a>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>I read every email and reply within 24 hours</div>
        </div>

        <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>GitHub</div>
          <a href="https://github.com/arushbhise-rgb/pitwall" target="_blank" rel="noreferrer"
            style={{ color: '#e10600', fontSize: '15px', textDecoration: 'none', fontWeight: '600' }}>
            github.com/arushbhise-rgb/pitwall
          </a>
          <div style={{ fontSize: '12px', color: '#555', marginTop: '6px' }}>Found a bug? Open an issue</div>
        </div>

        <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px' }}>
          <div style={{ fontSize: '12px', color: '#555', textTransform: 'uppercase', letterSpacing: '.5px', marginBottom: '8px' }}>Feature requests</div>
          <div style={{ fontSize: '14px', color: '#aaa', lineHeight: '1.7' }}>
            Have an idea for a new feature? Email me or open a GitHub issue. 
            I'm actively building PitWall and user feedback directly shapes what gets built next.
          </div>
        </div>
      </div>
    </div>
  )
}