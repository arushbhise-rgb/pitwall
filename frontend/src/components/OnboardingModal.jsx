import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { ALL_DRIVERS_BY_YEAR } from '../constants/driverData'

const F1_TEAMS = [
  { id: 'Red Bull Racing', color: '#3671c6' },
  { id: 'Ferrari', color: '#e8002d' },
  { id: 'McLaren', color: '#ff8000' },
  { id: 'Mercedes', color: '#00d2be' },
  { id: 'Aston Martin', color: '#52e252' },
  { id: 'Alpine', color: '#0093cc' },
  { id: 'Racing Bulls', color: '#6692ff' },
  { id: 'Williams', color: '#005aff' },
  { id: 'Haas', color: '#b6babd' },
  { id: 'Audi', color: '#c92d4b' },
  { id: 'Cadillac', color: '#888' },
]

export const AVATAR_OPTIONS = [
  '🏎️','🏁','🏆','🔥','⚡','👑','🐎','🦁','🚀','💎',
  '🎯','🌟','🔧','🛞','🪖','🏴','🎪','🎽','🥊','🎮',
]

// Creator-exclusive avatar — not shown to regular users
export const CREATOR_AVATAR = '🛠️'
const CREATOR_EMAILS = new Set(['arush.bhise@gmail.com'])

const YEAR = String(new Date().getFullYear())
const CURRENT_DRIVERS = ALL_DRIVERS_BY_YEAR[YEAR] || ALL_DRIVERS_BY_YEAR['2025'] || []

const STEPS = [
  { icon: '👤', title: 'Choose your username', sub: 'How others see you in The Paddock' },
  { icon: '🎨', title: 'Pick your avatar', sub: 'Choose an icon that represents you' },
  { icon: '🏎', title: 'Pick your team', sub: 'Which team do you bleed for?' },
  { icon: '🏁', title: 'Favourite driver?', sub: 'Who do you cheer for every Sunday?' },
]

export default function OnboardingModal() {
  const { updateProfile, dismissOnboarding, user } = useAuth()
  const [step, setStep] = useState(0) // 0-indexed
  const [username, setUsername] = useState('')
  const [avatar, setAvatar] = useState('')
  const [favTeam, setFavTeam] = useState('')
  const [favDriver, setFavDriver] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const total = STEPS.length
  const progress = ((step + 1) / total) * 100
  const teamColor = F1_TEAMS.find(t => t.id === favTeam)?.color || '#e10600'
  const accentColor = step === 2 ? teamColor : '#e10600'

  function validate() {
    if (step === 0) {
      const u = username.trim()
      if (!u) return 'Please enter a username.'
      if (u.length < 3) return 'Username must be at least 3 characters.'
      if (u.length > 20) return 'Username must be 20 characters or less.'
      if (!/^[a-zA-Z0-9_]+$/.test(u)) return 'Only letters, numbers, and underscores.'
    }
    return null
  }

  function handleNext() {
    const err = validate()
    if (err) { setError(err); return }
    setError('')
    if (step < total - 1) setStep(s => s + 1)
    else handleFinish()
  }

  async function handleFinish() {
    setSaving(true)
    const { error } = await updateProfile({
      username: username.trim(),
      avatar: avatar || null,
      fav_team: favTeam || null,
      fav_driver: favDriver || null,
    })
    if (error) {
      const msg = error.message?.includes('unique') ? 'Username already taken, try another.' : error.message
      setError(msg); setStep(0); setSaving(false)
    }
  }

  const canProceed = step === 0 ? username.trim().length >= 3 : true
  const currentStep = STEPS[step]

  return (
    <>
      <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(8px)', zIndex: 300 }} />

      <div style={{
        position: 'fixed', top: '50%', left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)', maxWidth: '480px',
        background: '#0d0d0d', border: '1px solid #1e1e1e',
        borderRadius: '22px', zIndex: 301,
        boxShadow: '0 40px 100px rgba(0,0,0,0.85)',
        animation: 'pwSlideUp .25s cubic-bezier(0.16,1,0.3,1)',
        overflow: 'hidden',
      }}>
        {/* Progress bar */}
        <div style={{ height: '3px', background: '#1a1a1a' }}>
          <div style={{ height: '100%', width: `${progress}%`, background: `linear-gradient(90deg, #e10600, ${accentColor})`, transition: 'width .4s ease, background .4s ease' }} />
        </div>

        {/* Step dots */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', padding: '16px 0 0' }}>
          {STEPS.map((_, i) => (
            <div key={i} style={{
              width: i === step ? '20px' : '6px', height: '6px',
              borderRadius: '3px', transition: 'all .3s ease',
              background: i <= step ? accentColor : '#2a2a2a',
            }} />
          ))}
        </div>

        <div style={{ padding: '20px 28px 26px' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '22px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px', filter: 'drop-shadow(0 0 12px rgba(225,6,0,0.3))' }}>
              {currentStep.icon}
            </div>
            <div style={{ fontSize: '19px', fontWeight: '800', color: '#fff', letterSpacing: '-0.4px' }}>{currentStep.title}</div>
            <div style={{ fontSize: '12px', color: '#555', marginTop: '4px' }}>Step {step + 1} of {total} · {currentStep.sub}</div>
          </div>

          {/* Step 0: Username */}
          {step === 0 && (
            <div>
              <input
                autoFocus value={username}
                onChange={e => setUsername(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleNext()}
                placeholder="e.g. fernando_fan"
                maxLength={20}
                style={{
                  width: '100%', boxSizing: 'border-box',
                  background: '#141414', border: '1.5px solid #222',
                  borderRadius: '10px', color: '#fff',
                  padding: '13px 15px', fontSize: '16px', outline: 'none',
                  transition: 'border-color .15s',
                }}
                onFocus={e => e.target.style.borderColor = '#e10600'}
                onBlur={e => e.target.style.borderColor = '#222'}
              />
              <div style={{ fontSize: '11px', color: '#444', marginTop: '6px' }}>Letters, numbers, underscores · max 20 chars</div>
            </div>
          )}

          {/* Step 1: Avatar */}
          {step === 1 && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '8px', marginBottom: '12px' }}>
                {AVATAR_OPTIONS.map(emoji => {
                  const sel = avatar === emoji
                  return (
                    <button key={emoji} onClick={() => setAvatar(sel ? '' : emoji)} style={{
                      height: '52px', background: sel ? 'rgba(225,6,0,0.12)' : '#141414',
                      border: `1.5px solid ${sel ? '#e10600' : '#222'}`,
                      borderRadius: '10px', fontSize: '24px', cursor: 'pointer',
                      transition: 'all .15s',
                      transform: sel ? 'scale(1.08)' : 'scale(1)',
                    }}>{emoji}</button>
                  )
                })}
                {CREATOR_EMAILS.has(user?.email) && (
                  <button onClick={() => setAvatar(a => a === CREATOR_AVATAR ? '' : CREATOR_AVATAR)} title="Creator exclusive 🛠️" style={{
                    height: '52px', background: avatar === CREATOR_AVATAR ? 'rgba(245,200,66,0.15)' : 'rgba(245,200,66,0.04)',
                    border: `1.5px solid ${avatar === CREATOR_AVATAR ? '#f5c842' : 'rgba(245,200,66,0.3)'}`,
                    borderRadius: '10px', fontSize: '24px', cursor: 'pointer', transition: 'all .15s',
                    transform: avatar === CREATOR_AVATAR ? 'scale(1.08)' : 'scale(1)',
                    boxShadow: '0 0 10px rgba(245,200,66,0.1)',
                  }}>{CREATOR_AVATAR}</button>
                )}
              </div>
              {/* Letter preview */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', background: '#141414', border: '1px solid #222', borderRadius: '10px' }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #e10600, #b30500)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: avatar ? '22px' : '16px', fontWeight: '800', color: '#fff',
                }}>
                  {avatar || username[0]?.toUpperCase() || '?'}
                </div>
                <div style={{ fontSize: '12px', color: '#555' }}>
                  {avatar ? `You picked ${avatar} — looking good!` : 'No emoji selected — your initial will be used'}
                </div>
              </div>
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
                    transform: sel ? 'scale(1.04)' : 'scale(1)',
                  }}>
                    <div style={{ width: '28px', height: '4px', background: team.color, borderRadius: '2px', margin: '0 auto 8px' }} />
                    <div style={{ fontSize: '11px', fontWeight: '700', color: sel ? team.color : '#aaa', lineHeight: 1.3 }}>{team.id}</div>
                  </button>
                )
              })}
            </div>
          )}

          {/* Step 3: Driver */}
          {step === 3 && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(90px, 1fr))', gap: '8px', maxHeight: '240px', overflowY: 'auto' }}>
              {CURRENT_DRIVERS.map(d => {
                const sel = favDriver === d.code
                return (
                  <button key={d.code} onClick={() => setFavDriver(d.code)} style={{
                    background: sel ? 'rgba(225,6,0,0.12)' : '#141414',
                    border: `1.5px solid ${sel ? '#e10600' : '#222'}`,
                    borderRadius: '10px', padding: '10px 8px',
                    cursor: 'pointer', textAlign: 'center', transition: 'all .15s',
                    transform: sel ? 'scale(1.06)' : 'scale(1)',
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
          <div style={{ display: 'flex', gap: '10px', marginTop: '22px' }}>
            {step > 0 && (
              <button onClick={() => { setStep(s => s - 1); setError('') }} style={{
                flex: 1, background: '#141414', border: '1px solid #222',
                color: '#888', padding: '12px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>← Back</button>
            )}
            <button
              onClick={handleNext}
              disabled={saving || !canProceed}
              style={{
                flex: 2,
                background: saving || !canProceed ? '#1a1a1a' : `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
                color: saving || !canProceed ? '#444' : '#fff',
                border: 'none', padding: '13px', borderRadius: '10px',
                fontSize: '14px', fontWeight: '700',
                cursor: saving || !canProceed ? 'not-allowed' : 'pointer',
                boxShadow: saving || !canProceed ? 'none' : `0 4px 20px ${accentColor}44`,
                transition: 'all .2s',
              }}
            >
              {saving ? 'Setting up your profile…' :
                step === total - 1 ? 'Enter The Paddock 🏁' :
                (step === 1 && !avatar) || (step === 2 && !favTeam) || (step === 3 && !favDriver)
                  ? 'Skip →' : 'Continue →'}
            </button>
          </div>

          <div style={{ textAlign: 'center', marginTop: '12px' }}>
            <button onClick={dismissOnboarding} style={{ background: 'none', border: 'none', color: '#2a2a2a', fontSize: '12px', cursor: 'pointer', transition: 'color .15s' }}
              onMouseEnter={e => e.currentTarget.style.color = '#555'}
              onMouseLeave={e => e.currentTarget.style.color = '#2a2a2a'}
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
