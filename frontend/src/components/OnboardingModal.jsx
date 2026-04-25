import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ALL_DRIVERS_BY_YEAR } from '../constants/driverData'

const F1_TEAMS = [
  { id: 'Red Bull Racing', name: 'Red Bull Racing', color: '#3671c6', short: 'RBR' },
  { id: 'Ferrari', name: 'Ferrari', color: '#e8002d', short: 'FER' },
  { id: 'McLaren', name: 'McLaren', color: '#ff8000', short: 'MCL' },
  { id: 'Mercedes', name: 'Mercedes', color: '#00d2be', short: 'MER' },
  { id: 'Aston Martin', name: 'Aston Martin', color: '#52e252', short: 'AM' },
  { id: 'Alpine', name: 'Alpine', color: '#0093cc', short: 'ALP' },
  { id: 'Racing Bulls', name: 'Racing Bulls', color: '#6692ff', short: 'RB' },
  { id: 'Williams', name: 'Williams', color: '#005aff', short: 'WIL' },
  { id: 'Haas', name: 'Haas', color: '#b6babd', short: 'HAA' },
  { id: 'Audi', name: 'Audi', color: '#c92d4b', short: 'AUD' },
  { id: 'Cadillac', name: 'Cadillac', color: '#888', short: 'CAD' },
]

const YEAR = String(new Date().getFullYear())
const CURRENT_DRIVERS = ALL_DRIVERS_BY_YEAR[YEAR] || ALL_DRIVERS_BY_YEAR['2025'] || []

export default function OnboardingModal() {
  const { updateProfile, dismissOnboarding, user } = useAuth()
  const [step, setStep] = useState(1) // 1=username, 2=team, 3=driver
  const [username, setUsername] = useState('')
  const [favTeam, setFavTeam] = useState('')
  const [favDriver, setFavDriver] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  async function handleFinish() {
    setSaving(true)
    setError('')
    const { error } = await updateProfile({
      username: username.trim(),
      fav_team: favTeam,
      fav_driver: favDriver,
    })
    if (error) {
      const msg = error.message?.includes('unique') ? 'Username already taken, try another.' : error.message
      setError(msg)
      setSaving(false)
      setStep(1)
    } else {
      setSaving(false)
    }
  }

  function handleNext() {
    setError('')
    if (step === 1) {
      const u = username.trim()
      if (!u) return setError('Please enter a username.')
      if (u.length < 3) return setError('Username must be at least 3 characters.')
      if (u.length > 20) return setError('Username must be 20 characters or less.')
      if (!/^[a-zA-Z0-9_]+$/.test(u)) return setError('Only letters, numbers, and underscores.')
      setStep(2)
    } else if (step === 2) {
      setStep(3)
    } else {
      handleFinish()
    }
  }

  const teamColor = F1_TEAMS.find(t => t.id === favTeam)?.color || '#e10600'
  const progress = (step / 3) * 100

  return (
    <>
      <div style={{
        position: 'fixed', inset: 0,
        background: 'rgba(0,0,0,0.85)',
        backdropFilter: 'blur(8px)',
        zIndex: 200,
      }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: '460px',
        background: '#0d0d0d',
        border: '1px solid #1e1e1e',
        borderRadius: '22px',
        zIndex: 201,
        boxShadow: '0 40px 100px rgba(0,0,0,0.8)',
        animation: 'pwSlideUp .25s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: '3px', background: '#1a1a1a', position: 'relative' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, #e10600, ${teamColor})`, transition: 'width .4s ease, background .4s ease' }} />
        </div>

        <div style={{ padding: '28px 28px 24px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <div style={{ fontSize: '28px', marginBottom: '8px' }}>
              {step === 1 ? '👤' : step === 2 ? '🏎' : '🏁'}
            </div>
            <div style={{ fontSize: '20px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px' }}>
              {step === 1 ? 'Choose your username' : step === 2 ? 'Pick your team' : 'Favourite driver?'}
            </div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>
              Step {step} of 3 · {step === 1 ? 'This is how others see you in The Paddock' : step === 2 ? 'Which team do you support?' : 'Who\'s your driver?'}
            </div>
          </div>

          {/* Step 1: Username */}
          {step === 1 && (
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '600', color: '#777', marginBottom: '8px' }}>Username</label>
              <input
                autoFocus
                value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="e.g. fernando_fan"
                maxLength={20}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#141414', border: '1.5px solid #222',
                  borderRadius: '10px', color: '#fff',
                  padding: '13px 15px', fontSize: '15px', outline: 'none',
                  transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = '#e10600'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
              <div style={{ fontSize: '11px', color: '#444', marginTop: '6px' }}>Letters, numbers, underscores · max 20 chars</div>
            </div>
          )}

          {/* Step 2: Team */}
          {step === 2 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '8px' }}>
              {F1_TEAMS.map(team => {
                const sel = favTeam === team.id
                return (
                  <button key={team.id} onClick={() => setFavTeam(team.id)} style={{
                    background: sel ? `${team.color}18` : '#141414',
                    border: `1.5px solid ${sel ? team.color : '#222'}`,
                    borderRadius: '10px', padding: '12px 8px',
                    cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                  }}>
                    <div style={{ width: '28px', height: '4px', background: team.color, borderRadius: '2px', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '11px', fontWeight: '700', color: sel ? team.color : '#aaa', lineHeight: 1.3 }}>{team.name}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 3: Driver */}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px', maxHeight: '260px', overflowY: 'auto' }}>
              {CURRENT_DRIVERS.map(d => {
                const sel = favDriver === d.code
                return (
                  <button key={d.code} onClick={() => setFavDriver(d.code)} style={{
                    background: sel ? 'rgba(225,6,0,0.12)' : '#141414',
                    border: `1.5px solid ${sel ? '#e10600' : '#222'}`,
                    borderRadius: '10px', padding: '10px 8px',
                    cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                  }}>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: sel ? '#e10600' : '#fff' }}>{d.code}</div>
                    <div style={{ fontSize: '10px', color: '#555', marginTop: '3px' }}>{d.name.split(' ').slice(1).join(' ')}</div>
                  </button>
                )
              })}
            </div>
          )}

          {error && (
            <div style={{ marginTop: '12px', background: 'rgba(225,6,0,0.08)', border: '1px solid rgba(225,6,0,0.22)', borderRadius: '8px', padding: '10px 14px', fontSize: '13px', color: '#ff7070' }}>
              {error}
            </div>
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
            {step > 1 && (
              <button onClick={() => { setStep(s => s - 1); setError('') }} style={{
                flex: 1, background: '#141414', border: '1px solid #222',
                color: '#888', padding: '12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>Back</button>
            )}
            <button
              onClick={handleNext}
              disabled={saving || (step === 1 && !username.trim())}
              style={{
                flex: 2, background: saving ? '#1a1a1a' : 'linear-gradient(135deg, #e10600, #c00500)',
                color: saving ? '#444' : '#fff',
                border: 'none', padding: '12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '700', cursor: saving ? 'not-allowed' : 'pointer',
                boxShadow: saving ? 'none' : '0 4px 20px rgba(225,6,0,0.25)',
                transition: 'all .2s',
              }}
            >
              {saving ? 'Saving…' : step === 3 ? 'Enter The Paddock 🏁' : step === 2 && !favTeam ? 'Skip for now →' : step === 3 && !favDriver ? 'Skip →' : 'Continue →'}
            </button>
          </div>

          {/* Skip all */}
          <div style={{ textAlign: 'center', marginTop: '14px' }}>
            <button onClick={dismissOnboarding} style={{ background: 'none', border: 'none', color: '#333', fontSize: '12px', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.color = '#666'}
              onMouseLeave={e => e.currentTarget.style.color = '#333'}
            >Skip setup for now</button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes pwSlideUp { from { opacity:0; transform:translate(-50%,calc(-50% + 18px)) } to { opacity:1; transform:translate(-50%,-50%) } }
      `}</style>
    </>
  )
}
