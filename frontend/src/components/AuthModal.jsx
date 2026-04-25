import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

// mode: 'signin' | 'signup' | 'forgot'
export default function AuthModal({ onClose }) {
  const { signIn, signUp, resetPassword } = useAuth()
  const [mode, setMode] = useState('signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  function reset(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setPassword('')
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    if (mode === 'forgot') {
      const { error } = await resetPassword(email)
      if (error) setError(error.message)
      else setSuccess('Reset link sent! Check your inbox.')
    } else if (mode === 'signup') {
      const { error } = await signUp(email, password)
      if (error) setError(error.message)
      else {
        setSuccess('Account created! You can sign in now.')
        setMode('signin')
      }
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else onClose()
    }
    setLoading(false)
  }

  const titles = {
    signin: { head: 'Welcome back', sub: 'Sign in to your PitWall account' },
    signup: { head: 'Create account', sub: 'Join the PitWall community' },
    forgot: { head: 'Reset password', sub: "We'll email you a reset link" },
  }

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.75)',
          backdropFilter: 'blur(6px)',
          WebkitBackdropFilter: 'blur(6px)',
          zIndex: 200,
          animation: 'pwFadeIn .18s ease',
        }}
      />

      {/* Card */}
      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: '420px',
        background: '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderRadius: '20px',
        zIndex: 201,
        boxShadow: '0 32px 80px rgba(0,0,0,0.7)',
        animation: 'pwSlideUp .22s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>

        {/* Top accent bar */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #e10600, #ff4d4d, #e10600)', backgroundSize: '200% 100%', animation: 'pwShimmer 2s linear infinite' }} />

        <div style={{ padding: '32px 32px 28px' }}>

          {/* Logo + Brand */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '28px' }}>
            <div style={{
              width: '48px', height: '48px',
              background: 'linear-gradient(135deg, #e10600, #b30500)',
              borderRadius: '14px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', color: '#fff', fontSize: '16px',
              letterSpacing: '-0.5px',
              boxShadow: '0 0 24px rgba(225,6,0,0.35)',
              marginBottom: '14px',
            }}>PW</div>

            <div style={{ fontSize: '22px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px', textAlign: 'center' }}>
              {titles[mode].head}
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '5px', textAlign: 'center' }}>
              {titles[mode].sub}
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#888', marginBottom: '7px', letterSpacing: '0.2px' }}>
                Email address
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                autoFocus
                placeholder="you@example.com"
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#141414',
                  border: '1.5px solid #222',
                  borderRadius: '10px',
                  color: '#fff',
                  padding: '13px 15px',
                  fontSize: '14px',
                  outline: 'none',
                  transition: 'border-color .15s, box-shadow .15s',
                }}
                onFocus={e => { e.target.style.borderColor = '#e10600'; e.target.style.boxShadow = '0 0 0 3px rgba(225,6,0,0.12)' }}
                onBlur={e => { e.target.style.borderColor = '#222'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password (hidden for forgot mode) */}
            {mode !== 'forgot' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '7px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#888', letterSpacing: '0.2px' }}>
                    Password
                  </label>
                  {mode === 'signin' && (
                    <button
                      type="button"
                      onClick={() => reset('forgot')}
                      style={{ background: 'none', border: 'none', color: '#555', fontSize: '12px', cursor: 'pointer', padding: 0, transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e10600'}
                      onMouseLeave={e => e.currentTarget.style.color = '#555'}
                    >Forgot password?</button>
                  )}
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    placeholder={mode === 'signup' ? 'At least 6 characters' : '••••••••'}
                    style={{
                      width: '100%', boxSizing: 'border-box',
                      background: '#141414',
                      border: '1.5px solid #222',
                      borderRadius: '10px',
                      color: '#fff',
                      padding: '13px 44px 13px 15px',
                      fontSize: '14px',
                      outline: 'none',
                      transition: 'border-color .15s, box-shadow .15s',
                    }}
                    onFocus={e => { e.target.style.borderColor = '#e10600'; e.target.style.boxShadow = '0 0 0 3px rgba(225,6,0,0.12)' }}
                    onBlur={e => { e.target.style.borderColor = '#222'; e.target.style.boxShadow = 'none' }}
                  />
                  {/* Show/hide toggle */}
                  <button
                    type="button"
                    onClick={() => setShowPass(s => !s)}
                    style={{
                      position: 'absolute', right: '12px', top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none', border: 'none', cursor: 'pointer',
                      color: '#444', padding: '4px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      transition: 'color .15s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = '#888'}
                    onMouseLeave={e => e.currentTarget.style.color = '#444'}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass ? (
                      // Eye-off icon
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                        <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </svg>
                    ) : (
                      // Eye icon
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{
                background: 'rgba(225,6,0,0.08)',
                border: '1px solid rgba(225,6,0,0.25)',
                borderRadius: '9px',
                padding: '11px 14px',
                fontSize: '13px', color: '#ff6b6b',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '16px' }}>⚠</span>
                {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{
                background: 'rgba(52,211,153,0.08)',
                border: '1px solid rgba(52,211,153,0.25)',
                borderRadius: '9px',
                padding: '11px 14px',
                fontSize: '13px', color: '#34d399',
                display: 'flex', alignItems: 'center', gap: '8px',
              }}>
                <span style={{ fontSize: '16px' }}>✓</span>
                {success}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              style={{
                background: loading ? '#1e1e1e' : 'linear-gradient(135deg, #e10600, #c00500)',
                color: loading ? '#555' : '#fff',
                border: 'none',
                padding: '14px',
                borderRadius: '10px',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                marginTop: '2px',
                transition: 'all .2s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
                boxShadow: loading ? 'none' : '0 4px 20px rgba(225,6,0,0.3)',
                letterSpacing: '-0.1px',
              }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading ? (
                <>
                  <div style={{ width: '16px', height: '16px', border: '2px solid #333', borderTop: '2px solid #666', borderRadius: '50%', animation: 'pwSpin .7s linear infinite' }} />
                  Please wait…
                </>
              ) : (
                mode === 'signin' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'
              )}
            </button>
          </form>

          {/* Divider */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '22px 0 18px' }}>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
            <span style={{ fontSize: '11px', color: '#333', letterSpacing: '0.5px', textTransform: 'uppercase' }}>
              {mode === 'forgot' ? 'remember it?' : 'or'}
            </span>
            <div style={{ flex: 1, height: '1px', background: '#1a1a1a' }} />
          </div>

          {/* Mode toggle */}
          <div style={{ textAlign: 'center' }}>
            {mode === 'signin' && (
              <div style={{ fontSize: '13px', color: '#555' }}>
                Don't have an account?{' '}
                <button onClick={() => reset('signup')} style={{ background: 'none', border: 'none', color: '#e10600', cursor: 'pointer', fontWeight: '700', fontSize: '13px', padding: 0 }}>
                  Sign up free
                </button>
              </div>
            )}
            {mode === 'signup' && (
              <div style={{ fontSize: '13px', color: '#555' }}>
                Already have an account?{' '}
                <button onClick={() => reset('signin')} style={{ background: 'none', border: 'none', color: '#e10600', cursor: 'pointer', fontWeight: '700', fontSize: '13px', padding: 0 }}>
                  Sign in
                </button>
              </div>
            )}
            {mode === 'forgot' && (
              <button onClick={() => reset('signin')} style={{ background: 'none', border: 'none', color: '#e10600', cursor: 'pointer', fontWeight: '700', fontSize: '13px', padding: 0 }}>
                ← Back to sign in
              </button>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '18px', right: '18px',
              width: '30px', height: '30px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1e1e1e',
              color: '#444', fontSize: '18px',
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s', lineHeight: 1,
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#444' }}
            aria-label="Close"
          >×</button>
        </div>
      </div>

      <style>{`
        @keyframes pwFadeIn { from { opacity: 0 } to { opacity: 1 } }
        @keyframes pwSlideUp { from { opacity: 0; transform: translate(-50%, calc(-50% + 16px)) } to { opacity: 1; transform: translate(-50%, -50%) } }
        @keyframes pwSpin { to { transform: rotate(360deg) } }
        @keyframes pwShimmer { 0% { background-position: 200% 0 } 100% { background-position: -200% 0 } }
      `}</style>
    </>
  )
}
