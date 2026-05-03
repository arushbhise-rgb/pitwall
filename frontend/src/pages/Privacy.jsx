import { Helmet } from 'react-helmet-async'
import { Link } from 'react-router-dom'

export default function Privacy() {
  return (
    <div style={{ minHeight: '100vh', background: '#050505', color: '#fff', fontFamily: "'Outfit', sans-serif" }}>
      <Helmet>
        <title>Privacy Policy — PitWall</title>
        <meta name="description" content="PitWall privacy policy — how we collect, use and protect your data." />
      </Helmet>

      <div style={{ maxWidth: '720px', margin: '0 auto', padding: '60px 24px 100px' }}>
        {/* Header */}
        <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', marginBottom: '48px' }}>
          <div style={{ width: '28px', height: '28px', background: 'linear-gradient(135deg,#e10600,#b30500)', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '10px', fontWeight: '800', color: '#fff' }}>PW</div>
          <span style={{ color: '#fff', fontWeight: '700', fontSize: '14px' }}>PitWall</span>
        </Link>

        <div style={{ fontFamily: "'Space Mono', monospace", fontSize: '10px', letterSpacing: '3px', textTransform: 'uppercase', color: '#e10600', marginBottom: '10px' }}>Legal</div>
        <h1 style={{ fontSize: '36px', fontWeight: '900', letterSpacing: '-0.03em', margin: '0 0 8px' }}>Privacy Policy</h1>
        <p style={{ color: '#555', fontSize: '13px', fontFamily: "'Space Mono', monospace", marginBottom: '48px' }}>
          Last updated: {new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}
        </p>

        <Section title="1. Who we are">
          PitWall ("<strong>we</strong>", "<strong>us</strong>") is a free F1 analytics and community platform available at{' '}
          <a href="https://pitwall-f1.com" style={{ color: '#e10600' }}>pitwall-f1.com</a>.
          For privacy questions contact us at{' '}
          <a href="mailto:privacy@pitwall-f1.com" style={{ color: '#e10600' }}>privacy@pitwall-f1.com</a>.
        </Section>

        <Section title="2. Data we collect">
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>
                <Th>Category</Th><Th>What exactly</Th><Th>Why</Th>
              </tr>
            </thead>
            <tbody>
              <Tr a="Account" b="Email address, password hash" c="Authentication and account recovery" />
              <Tr a="Profile" b="Username, favourite team/driver, avatar emoji" c="Personalisation and public profile" />
              <Tr a="Activity" b="Votes, predictions, hot takes, discussions, ratings" c="Core community features and leaderboard" />
              <Tr a="Usage" b="Pages visited, feature interactions" c="Improving the product (anonymous)" />
              <Tr a="Technical" b="IP address, browser type, device" c="Security and fraud prevention" />
            </tbody>
          </table>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '14px' }}>
            We do <strong style={{ color: '#fff' }}>not</strong> collect: real name, phone number, location, financial data, or any biometric data.
          </p>
        </Section>

        <Section title="3. How we use your data">
          <ul style={{ color: '#888', fontSize: '14px', lineHeight: '2', paddingLeft: '20px' }}>
            <li>To provide and operate the PitWall service</li>
            <li>To display your activity on the public leaderboard and community feeds</li>
            <li>To calculate and award Paddock Points</li>
            <li>To send service-related emails (account verification, password reset)</li>
            <li>To detect and prevent abuse or spam</li>
            <li>We do <strong style={{ color: '#fff' }}>not</strong> sell your data to third parties</li>
            <li>We do <strong style={{ color: '#fff' }}>not</strong> use your data for advertising</li>
          </ul>
        </Section>

        <Section title="4. Who we share data with">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8, marginBottom: '12px' }}>
            We use the following third-party services to operate PitWall:
          </p>
          <ul style={{ color: '#888', fontSize: '14px', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong style={{ color: '#fff' }}>Supabase</strong> (Supabase Inc.) — database and authentication. Data stored in AWS EU-West region. <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e10600' }}>Privacy policy ↗</a></li>
            <li><strong style={{ color: '#fff' }}>Vercel</strong> — frontend hosting. <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#e10600' }}>Privacy policy ↗</a></li>
            <li><strong style={{ color: '#fff' }}>Railway</strong> — backend hosting. <a href="https://railway.app/legal/privacy" target="_blank" rel="noopener noreferrer" style={{ color: '#e10600' }}>Privacy policy ↗</a></li>
          </ul>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '12px' }}>No other third parties have access to your personal data.</p>
        </Section>

        <Section title="5. Cookies and local storage">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>
            PitWall uses browser local storage to maintain your login session (a JWT token issued by Supabase).
            We do not use advertising cookies or third-party tracking cookies.
            We do not show cookie consent banners because we do not use non-essential cookies.
          </p>
        </Section>

        <Section title="6. Data retention">
          <ul style={{ color: '#888', fontSize: '14px', lineHeight: '2', paddingLeft: '20px' }}>
            <li>Your account data is kept until you delete your account</li>
            <li>Community content (votes, hot takes, discussions) is deleted when you delete your account</li>
            <li>Anonymous usage logs are retained for up to 90 days</li>
          </ul>
        </Section>

        <Section title="7. Your rights">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8, marginBottom: '14px' }}>
            You have the right to:
          </p>
          <ul style={{ color: '#888', fontSize: '14px', lineHeight: '2', paddingLeft: '20px' }}>
            <li><strong style={{ color: '#fff' }}>Access</strong> — request a copy of all data we hold about you</li>
            <li><strong style={{ color: '#fff' }}>Correction</strong> — update your profile information in Settings</li>
            <li><strong style={{ color: '#fff' }}>Deletion</strong> — delete your account and all associated data from your Profile → Settings → Danger Zone. This is permanent and immediate.</li>
            <li><strong style={{ color: '#fff' }}>Portability</strong> — request an export of your data</li>
            <li><strong style={{ color: '#fff' }}>Objection</strong> — object to certain processing activities</li>
          </ul>
          <p style={{ color: '#555', fontSize: '13px', marginTop: '14px' }}>
            For any of the above, email <a href="mailto:privacy@pitwall-f1.com" style={{ color: '#e10600' }}>privacy@pitwall-f1.com</a>. We respond within 30 days.
          </p>
        </Section>

        <Section title="8. Children">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>
            PitWall is not directed at children under 13. We do not knowingly collect data from children under 13.
            If you believe a child has provided us with data, contact us and we will delete it immediately.
          </p>
        </Section>

        <Section title="9. Security">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>
            All data is encrypted in transit (HTTPS/TLS 1.3). Passwords are never stored — authentication is handled by Supabase
            using bcrypt hashing. Row-level security policies restrict database access so users can only read/write their own data.
            We conduct periodic security reviews.
          </p>
        </Section>

        <Section title="10. Changes to this policy">
          <p style={{ color: '#888', fontSize: '14px', lineHeight: 1.8 }}>
            We may update this policy. When we do, we will update the "Last updated" date above.
            Continued use of PitWall after changes constitutes acceptance of the updated policy.
          </p>
        </Section>

        <div style={{ marginTop: '48px', paddingTop: '32px', borderTop: '0.5px solid #1a1a1a', display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>← Back to PitWall</Link>
          <a href="mailto:privacy@pitwall-f1.com" style={{ fontSize: '13px', color: '#555', textDecoration: 'none' }}>privacy@pitwall-f1.com</a>
        </div>
      </div>
    </div>
  )
}

function Section({ title, children }) {
  return (
    <div style={{ marginBottom: '40px' }}>
      <h2 style={{ fontSize: '18px', fontWeight: '800', color: '#fff', marginBottom: '16px', letterSpacing: '-0.02em' }}>{title}</h2>
      {children}
    </div>
  )
}

function Th({ children }) {
  return (
    <th style={{ padding: '8px 12px', textAlign: 'left', fontSize: '10px', fontFamily: "'Space Mono', monospace", letterSpacing: '1px', textTransform: 'uppercase', color: '#444', borderBottom: '0.5px solid #1a1a1a' }}>
      {children}
    </th>
  )
}

function Tr({ a, b, c }) {
  return (
    <tr>
      {[a, b, c].map((v, i) => (
        <td key={i} style={{ padding: '10px 12px', fontSize: '13px', color: i === 0 ? '#ccc' : '#666', borderBottom: '0.5px solid #0f0f0f', verticalAlign: 'top' }}>{v}</td>
      ))}
    </tr>
  )
}
