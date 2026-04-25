import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'

export default function AuthModal({ onClose }) {
  const { signIn, signUp, resetPassword, signInWithGoogle } = useAuth()
  const [mode, setMode] = useState('signin') // 'signin' | 'signup' | 'forgot'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [oauthLoading, setOauthLoading] = useState(false)

  function resetState(nextMode) {
    setMode(nextMode)
    setError('')
    setSuccess('')
    setPassword('')
  }

  async function handleOAuth() {
    setOauthLoading(true)
    setError('')
    const { error } = await signInWithGoogle()
    if (error) { setError(error.message); setOauthLoading(false) }
    // on success the page redirects — no need to close modal
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
      else { setSuccess('Account created! You can sign in now.'); setMode('signin') }
    } else {
      const { error } = await signIn(email, password)
      if (error) setError(error.message)
      else onClose()
    }
    setLoading(false)
  }

  const isForgot = mode === 'forgot'

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.78)',
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
        borderRadius: '22px',
        zIndex: 201,
        boxShadow: '0 40px 100px rgba(0,0,0,0.75)',
        animation: 'pwSlideUp .22s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>

        {/* Animated top accent */}
        <div style={{ height: '3px', background: 'linear-gradient(90deg, #e10600, #ff6b6b, #e10600)', backgroundSize: '200% 100%', animation: 'pwShimmer 2.5s linear infinite' }} />

        <div style={{ padding: '30px 30px 26px', position: 'relative' }}>

          {/* Close */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute', top: '16px', right: '16px',
              width: '28px', height: '28px', borderRadius: '50%',
              background: 'rgba(255,255,255,0.04)',
              border: '1px solid #1e1e1e',
              color: '#444', fontSize: '18px', lineHeight: 1,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
              transition: 'all .15s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.09)'; e.currentTarget.style.color = '#fff' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#444' }}
            aria-label="Close"
          >×</button>

          {/* Logo + Title */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{
              width: '46px', height: '46px', margin: '0 auto 12px',
              background: 'linear-gradient(135deg, #e10600, #b30500)',
              borderRadius: '13px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontWeight: '900', color: '#fff', fontSize: '15px',
              boxShadow: '0 0 24px rgba(225,6,0,0.4)',
            }}>PW</div>
            <div style={{ fontSize: '21px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px' }}>
              {isForgot ? 'Reset password' : mode === 'signin' ? 'Welcome back' : 'Create account'}
            </div>
            <div style={{ fontSize: '13px', color: '#555', marginTop: '4px' }}>
              {isForgot ? "We'll email you a reset link" : mode === 'signin' ? 'Sign in to your PitWall account' : 'Join the PitWall community — free'}
            </div>
          </div>

          {/* ── OAuth buttons (hidden in forgot mode) ── */}
          {!isForgot && (
            <>
              <div style={{ marginBottom: '20px' }}>
                <OAuthButton
                  label="Continue with Google"
                  loading={oauthLoading}
                  disabled={oauthLoading}
                  onClick={handleOAuth}
                  icon={
                    <svg width="18" height="18" viewBox="0 0 48 48">
                      <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                      <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                      <path fill="none" d="M0 0h48v48H0z"/>
                    </svg>
                  }
                />
              </div>

              {/* Divider */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '18px' }}>
                <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
                <span style={{ fontSize: '11px', color: '#333', letterSpacing: '0.5px', textTransform: 'uppercase' }}>or with email</span>
                <div style={{ flex: 1, height: '1px', background: '#1e1e1e' }} />
              </div>
            </>
          )}

          {/* ── Email form ── */}
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>

            {/* Email */}
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '6px' }}>
                Email address
              </label>
              <input
                type="email" value={email}
                onChange={e => setEmail(e.target.value)}
                required autoFocus placeholder="you@example.com"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = '#e10600'; e.target.style.boxShadow = '0 0 0 3px rgba(225,6,0,0.1)' }}
                onBlur={e => { e.target.style.borderColor = '#222'; e.target.style.boxShadow = 'none' }}
              />
            </div>

            {/* Password */}
            {!isForgot && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <label style={{ fontSize: '12px', fontWeight: '600', color: '#777' }}>Password</label>
                  {mode === 'signin' && (
                    <button type="button" onClick={() => resetState('forgot')}
                      style={{ background: 'none', border: 'none', color: '#444', fontSize: '12px', cursor: 'pointer', padding: 0, transition: 'color .15s' }}
                      onMouseEnter={e => e.currentTarget.style.color = '#e10600'}
                      onMouseLeave={e => e.currentTarget.style.color = '#444'}
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
                    style={{ ...inputStyle, paddingRight: '44px' }}
                    onFocus={e => { e.target.style.borderColor = '#e10600'; e.target.style.boxShadow = '0 0 0 3px rgba(225,6,0,0.1)' }}
                    onBlur={e => { e.target.style.borderColor = '#222'; e.target.style.boxShadow = 'none' }}
                  />
                  <button type="button" onClick={() => setShowPass(s => !s)}
                    style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#444', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center', transition: 'color .15s' }}
                    onMouseEnter={e => e.currentTarget.style.color = '#888'}
                    onMouseLeave={e => e.currentTarget.style.color = '#444'}
                    aria-label={showPass ? 'Hide password' : 'Show password'}
                  >
                    {showPass
                      ? <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                      : <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    }
                  </button>
                </div>
              </div>
            )}

            {/* Error */}
            {error && (
              <div style={{ background: 'rgba(225,6,0,0.08)', border: '1px solid rgba(225,6,0,0.22)', borderRadius: '9px', padding: '11px 14px', fontSize: '13px', color: '#ff7070', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>⚠</span> {error}
              </div>
            )}

            {/* Success */}
            {success && (
              <div style={{ background: 'rgba(52,211,153,0.07)', border: '1px solid rgba(52,211,153,0.22)', borderRadius: '9px', padding: '11px 14px', fontSize: '13px', color: '#34d399', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span>✓</span> {success}
              </div>
            )}

            {/* Submit */}
            <button type="submit" disabled={loading || oauthLoading} style={{
              background: (loading || oauthLoading) ? '#1a1a1a' : 'linear-gradient(135deg, #e10600, #c00500)',
              color: (loading || oauthLoading) ? '#444' : '#fff',
              border: 'none', padding: '14px', borderRadius: '10px',
              fontSize: '15px', fontWeight: '700',
              cursor: (loading || oauthLoading) ? 'not-allowed' : 'pointer',
              transition: 'all .2s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
              boxShadow: (loading || oauthLoading) ? 'none' : '0 4px 20px rgba(225,6,0,0.25)',
              marginTop: '2px',
            }}
              onMouseEnter={e => { if (!loading && !oauthLoading) e.currentTarget.style.transform = 'translateY(-1px)' }}
              onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)' }}
            >
              {loading
                ? <><Spinner /> Please wait…</>
                : isForgot ? 'Send Reset Link' : mode === 'signin' ? 'Sign In' : 'Create Account'
              }
            </button>
          </form>

          {/* Mode toggle */}
          <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '13px', color: '#555' }}>
            {mode === 'signin' && <>Don't have an account?{' '}<ToggleBtn onClick={() => resetState('signup')}>Sign up free</ToggleBtn></>}
            {mode === 'signup' && <>Already have an account?{' '}<ToggleBtn onClick={() => resetState('signin')}>Sign in</ToggleBtn></>}
            {mode === 'forgot' && <ToggleBtn onClick={() => resetState('signin')}>← Back to sign in</ToggleBtn>}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pwFadeIn { from { opacity:0 } to { opacity:1 } }
        @keyframes pwSlideUp { from { opacity:0; transform:translate(-50%,calc(-50% + 18px)) } to { opacity:1; transform:translate(-50%,-50%) } }
        @keyframes pwSpin { to { transform:rotate(360deg) } }
        @keyframes pwShimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
      `}</style>
    </>
  )
}

/* ── Small reusable pieces ── */

const inputStyle = {
  width: '100%', boxSizing: 'border-box',
  background: '#141414',
  border: '1.5px solid #222',
  borderRadius: '10px',
  color: '#fff',
  padding: '13px 15px',
  fontSize: '14px',
  outline: 'none',
  transition: 'border-color .15s, box-shadow .15s',
}

function Spinner() {
  return <div style={{ width: '16px', height: '16px', border: '2px solid #333', borderTop: '2px solid #666', borderRadius: '50%', animation: 'pwSpin .7s linear infinite', flexShrink: 0 }} />
}

function ToggleBtn({ onClick, children }) {
  return (
    <button onClick={onClick} style={{ background: 'none', border: 'none', color: '#e10600', cursor: 'pointer', fontWeight: '700', fontSize: '13px', padding: 0 }}
      onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
      onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}
    >{children}</button>
  )
}

function OAuthButton({ label, icon, onClick, loading, disabled, dark }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: '100%',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        background: dark ? '#1a1a1a' : '#fff',
        border: dark ? '1px solid #2a2a2a' : '1px solid #e0e0e0',
        borderRadius: '10px',
        padding: '12px 16px',
        fontSize: '14px', fontWeight: '600',
        color: dark ? '#fff' : '#1a1a1a',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        transition: 'all .15s',
        position: 'relative',
      }}
      onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = dark ? '#242424' : '#f5f5f5' }}
      onMouseLeave={e => { e.currentTarget.style.background = dark ? '#1a1a1a' : '#fff' }}
    >
      {loading ? <Spinner /> : icon}
      {label}
    </button>
  )
}
