export default function Support() {
  return (
    <div style={{ maxWidth: '600px', margin: '60px auto', padding: '0 24px' }}>
      <div style={{ fontSize: '22px', fontWeight: '700', marginBottom: '8px' }}>Support PitWall</div>
      <div style={{ fontSize: '14px', color: '#666', marginBottom: '32px' }}>
        PitWall is free and always will be. If it's been useful to you, consider buying me a coffee.
      </div>

      <div style={{ background: '#111', border: '0.5px solid #e10600', borderRadius: '12px', padding: '28px', textAlign: 'center', marginBottom: '16px' }}>
        <div style={{ fontSize: '32px', marginBottom: '12px' }}>☕</div>
        <div style={{ fontSize: '18px', fontWeight: '700', marginBottom: '8px' }}>Buy me a coffee</div>
        <div style={{ fontSize: '13px', color: '#666', marginBottom: '20px', lineHeight: '1.6' }}>
          Server costs, API calls, and late nights debugging Railway deployments — 
          your support keeps PitWall running and helps me add new features.
        </div>
        <a href="https://buymeacoffee.com" target="_blank" rel="noreferrer" style={{
          display: 'inline-block', background: '#e10600', color: '#fff',
          padding: '12px 32px', borderRadius: '8px', fontSize: '14px',
          fontWeight: '700', textDecoration: 'none'
        }}>Support PitWall</a>
      </div>

      <div style={{ background: '#111', border: '0.5px solid #222', borderRadius: '12px', padding: '20px' }}>
        <div style={{ fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>What your support pays for</div>
        {[
          { item: 'Railway backend hosting', cost: '$5/month' },
          { item: 'OpenAI API for race analysis', cost: '~$0.01/query' },
          { item: 'Domain name (coming soon)', cost: '$10/year' },
          { item: 'F1 data API costs', cost: 'Free (for now)' },
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: i < 3 ? '0.5px solid #1e1e1e' : 'none' }}>
            <span style={{ fontSize: '13px', color: '#aaa' }}>{r.item}</span>
            <span style={{ fontSize: '13px', color: '#555' }}>{r.cost}</span>
          </div>
        ))}
      </div>
    </div>
  )
}