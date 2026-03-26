import { useState, useEffect } from 'react'

export default function InstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState(null)
  const [show, setShow] = useState(false)
  const [dismissed, setDismissed] = useState(false)

  useEffect(() => {
    // Don't show if already installed or previously dismissed this session
    if (window.matchMedia('(display-mode: standalone)').matches) return
    if (sessionStorage.getItem('pwa-dismissed')) return

    const handler = (e) => {
      e.preventDefault()
      setDeferredPrompt(e)
      // Show after 30s delay so it doesn't interrupt
      setTimeout(() => setShow(true), 30000)
    }

    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const handleInstall = async () => {
    if (!deferredPrompt) return
    deferredPrompt.prompt()
    const result = await deferredPrompt.userChoice
    if (result.outcome === 'accepted') {
      setShow(false)
    }
    setDeferredPrompt(null)
  }

  const handleDismiss = () => {
    setShow(false)
    setDismissed(true)
    sessionStorage.setItem('pwa-dismissed', '1')
  }

  if (!show || dismissed) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 9999,
      background: '#111',
      border: '1px solid rgba(225,6,0,0.3)',
      borderRadius: '14px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '14px',
      boxShadow: '0 8px 32px rgba(0,0,0,0.6), 0 0 20px rgba(225,6,0,0.1)',
      maxWidth: '420px',
      width: 'calc(100% - 40px)',
      animation: 'fadeUp 0.4s ease',
    }}>
      <div style={{
        width: '40px', height: '40px', flexShrink: 0,
        background: 'linear-gradient(135deg, #e10600, #b30500)',
        borderRadius: '10px',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: "'Space Mono', monospace",
        fontWeight: 700, fontSize: '12px', color: '#fff',
      }}>PW</div>
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '2px' }}>Install PitWall</div>
        <div style={{ fontSize: '11px', color: '#888' }}>Add to home screen for a better experience</div>
      </div>
      <button onClick={handleInstall} style={{
        background: 'linear-gradient(135deg, #e10600, #c00500)',
        color: '#fff', border: 'none',
        padding: '8px 16px', borderRadius: '8px',
        fontSize: '12px', fontWeight: 600, cursor: 'pointer',
        whiteSpace: 'nowrap',
      }}>Install</button>
      <button onClick={handleDismiss} style={{
        background: 'none', border: 'none',
        color: '#555', fontSize: '18px', cursor: 'pointer',
        padding: '4px', lineHeight: 1,
      }}>&times;</button>
    </div>
  )
}
