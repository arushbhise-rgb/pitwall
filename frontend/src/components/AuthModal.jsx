import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ onClose }) {
  const { signIn, signUp } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) {
        setError(error.message)
      } else {
        setSuccess('Check your email to confirm your account, then sign in.')
        setMode('signin')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message)
      } else {
        onClose()
      }
    }
    setLoading(false)
  }

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
        backdropFilter: 'blur(4px)', zIndex: 200,
        animation: 'fadeIn .15s ease'
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%,-50%)',
        background: '#111', border: '0.5px solid #2a2a2a',
        borderRadius: '16px', padding: '32px', width: '100%',
        maxWidth: '380px', zIndex: 201,
        animation: 'fadeUp .2s ease',
        boxShadow: '0 24px 64px rgba(0,0,0,0.6)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
          <div>
            <div style={{ fontSize: '18px', fontWeight: '800', letterSpacing: '-0.3px' }}>
              {mode === 'signin' ? 'Sign in to PitWall' : 'Create account'}
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              {mode === 'signin' ? 'Access your community features' : 'Votes, predictions & ratings saved forever'}
            </div>
          </div>
          <button onClick={onClose} style={{
            background: 'rgba(255,255,255,0.05)', border: '0.5px solid #2a2a2a',
            color: '#555', width: '28px', height: '28px', borderRadius: '50%',
            cursor: 'pointer', fontSize: '16px', display: 'flex',
            alignItems: 'center', justifyContent: 'center'
          }}>×</button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div>
            <label style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              required autoFocus placeholder="your@email.com"
              style={{
                width: '100%', background: '#1a1a1a', border: '0.5px solid #2a2a2a',
                borderRadius: '8px', color: '#fff', padding: '10px 12px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s'
              }}
              onFocus={e => e.target.style.borderColor = '#e10600'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          <div>
            <label style={{ fontSize: '11px', color: '#555', textTransform: 'uppercase', letterSpacing: '0.5px', display: 'block', marginBottom: '6px' }}>Password</label>
            <input
              type="password" value={password} onChange={e => setPassword(e.target.value)}
              required placeholder={mode === 'signup' ? 'Min 6 characters' : '••••••••'}
              style={{
                width: '100%', background: '#1a1a1a', border: '0.5px solid #2a2a2a',
                borderRadius: '8px', color: '#fff', padding: '10px 12px',
                fontSize: '14px', outline: 'none', boxSizing: 'border-box',
                transition: 'border-color .15s'
              }}
              onFocus={e => e.target.style.borderColor = '#e10600'}
              onBlur={e => e.target.style.borderColor = '#2a2a2a'}
            />
          </div>

          {error && (
            <div style={{ background: 'rgba(225,6,0,0.1)', border: '0.5px solid rgba(225,6,0,0.3)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#ff6b6b' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ background: 'rgba(82,226,82,0.08)', border: '0.5px solid rgba(82,226,82,0.3)', borderRadius: '8px', padding: '10px 12px', fontSize: '12px', color: '#52e252' }}>
              {success}
            </div>
          )}

          <button type="submit" disabled={loading} style={{
            background: loading ? '#333' : '#e10600', color: '#fff', border: 'none',
            padding: '12px', borderRadius: '10px', fontSize: '14px',
            fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer',
            marginTop: '4px', transition: 'all .2s',
            boxShadow: loading ? 'none' : '0 0 16px rgba(225,6,0,0.3)'
          }}>
            {loading ? 'Please wait...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        {/* Toggle mode */}
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#555' }}>
          {mode === 'signin' ? (
            <>No account? <button onClick={() => { setMode('signup'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#e10600', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Create one</button></>
          ) : (
            <>Already have one? <button onClick={() => { setMode('signin'); setError(''); setSuccess('') }} style={{ background: 'none', border: 'none', color: '#e10600', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>Sign in</button></>
          )}
        </div>

        <div style={{ textAlign: 'center', marginTop: '12px', fontSize: '11px', color: '#333' }}>
          Free forever · No spam · F1 fans only 🏎️
        </div>
      </div>

      <style>{`@keyframes fadeIn { from { opacity: 0 } to { opacity: 1 } }`}</style>
    </>
  )
}
