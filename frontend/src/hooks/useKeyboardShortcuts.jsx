import { useState, useEffect, useCallback } from 'react'

export function useKeyboardShortcuts(shortcuts) {
  useEffect(() => {
    function handler(e) {
      // Don't trigger when typing in inputs
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') {
        // Only allow Ctrl+Enter and Escape in inputs
        if (!(e.key === 'Enter' && (e.ctrlKey || e.metaKey)) && e.key !== 'Escape') return
      }

      for (const s of shortcuts) {
        const ctrl = s.ctrl ? (e.ctrlKey || e.metaKey) : true
        if (e.key === s.key && ctrl) {
          e.preventDefault()
          s.action()
          return
        }
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [shortcuts])
}

export function KeyboardShortcutsHelp({ show, onClose }) {
  if (!show) return null

  const shortcuts = [
    { keys: '1-7', desc: 'Switch chart tabs' },
    { keys: 'Ctrl+Enter', desc: 'Load race / Ask AI' },
    { keys: '?', desc: 'Show this help' },
    { keys: 'Esc', desc: 'Close overlays' },
  ]

  return (
    <div onClick={onClose} style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      backdropFilter: 'blur(8px)', zIndex: 9999,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeIn 0.2s ease',
    }}>
      <div onClick={e => e.stopPropagation()} style={{
        background: '#111', border: '0.5px solid #1e1e1e', borderRadius: '16px',
        padding: '28px', maxWidth: '380px', width: '90%',
      }}>
        <div style={{ fontSize: '16px', fontWeight: '700', marginBottom: '4px' }}>Keyboard Shortcuts</div>
        <div style={{ fontSize: '12px', color: '#555', marginBottom: '20px' }}>Navigate faster with your keyboard</div>
        {shortcuts.map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            padding: '10px 0', borderBottom: i < shortcuts.length - 1 ? '0.5px solid #1e1e1e' : 'none'
          }}>
            <span style={{ fontSize: '13px', color: '#aaa' }}>{s.desc}</span>
            <kbd style={{
              background: '#1a1a1a', border: '1px solid #333', borderRadius: '6px',
              padding: '4px 10px', fontSize: '12px', color: '#fff', fontFamily: "'Space Mono', monospace",
            }}>{s.keys}</kbd>
          </div>
        ))}
        <button onClick={onClose} style={{
          width: '100%', marginTop: '20px', background: '#1a1a1a', border: '0.5px solid #333',
          borderRadius: '8px', padding: '10px', color: '#aaa', fontSize: '12px', cursor: 'pointer',
        }}>Close (Esc)</button>
      </div>
    </div>
  )
}
