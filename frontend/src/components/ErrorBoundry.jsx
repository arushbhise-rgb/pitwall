import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, info) {
    console.error('PitWall error:', error, info)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: '100vh', background: '#0a0a0a', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '16px', textAlign: 'center', padding: '24px' }}>
          <div style={{ fontSize: '48px' }}>🏎️</div>
          <div style={{ fontSize: '20px', fontWeight: '700' }}>Something went wrong</div>
          <div style={{ fontSize: '14px', color: '#555', maxWidth: '400px', lineHeight: '1.7' }}>
            PitWall hit a technical issue. Try refreshing the page — if it keeps happening let us know at arush.bhise@unb.ca
          </div>
          <button onClick={() => window.location.reload()} style={{ background: '#e10600', color: '#fff', border: 'none', padding: '12px 28px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px' }}>
            Refresh page
          </button>
        </div>
      )
    }
    return this.props.children
  }
}