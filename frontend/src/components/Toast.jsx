import { useState, useEffect, useCallback, createContext, useContext } from 'react'

const ToastContext = createContext(null)

export function useToast() {
  return useContext(ToastContext)
}

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const show = useCallback((message, type = 'error') => {
    const id = Date.now()
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id))
    }, 4000)
  }, [])

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 9999, display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {toasts.map(t => (
          <div key={t.id} style={{
            background: t.type === 'error' ? '#1a0000' : '#001a00',
            border: `1px solid ${t.type === 'error' ? 'rgba(225,6,0,0.3)' : 'rgba(0,200,0,0.3)'}`,
            color: t.type === 'error' ? '#ff6b6b' : '#6bff6b',
            padding: '12px 18px',
            borderRadius: '10px',
            fontSize: '13px',
            maxWidth: '360px',
            animation: 'fadeUp .3s ease',
            boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
            cursor: 'pointer',
          }} onClick={() => setToasts(prev => prev.filter(x => x.id !== t.id))}>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}
