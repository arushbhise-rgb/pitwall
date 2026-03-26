import { useEffect, useRef } from 'react'

/**
 * Google AdSense banner component.
 *
 * Usage:
 *   <AdBanner slot="1234567890" format="horizontal" />
 *   <AdBanner slot="1234567890" format="rectangle" />
 *
 * To set up:
 * 1. Sign up at https://adsense.google.com
 * 2. Replace ca-pub-XXXXXXXXXXXXXXXX in index.html with your publisher ID
 * 3. Create ad units in AdSense dashboard and get slot IDs
 * 4. Pass the slot ID to this component
 */

const FORMATS = {
  horizontal: { width: '100%', height: '90px' },    // leaderboard banner
  rectangle: { width: '300px', height: '250px' },    // medium rectangle
  responsive: { width: '100%', height: 'auto' },     // auto-sized
}

export default function AdBanner({ slot, format = 'horizontal', style = {} }) {
  const adRef = useRef(null)
  const pushed = useRef(false)

  useEffect(() => {
    if (pushed.current) return
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({})
        pushed.current = true
      }
    } catch (e) {
      // AdSense not loaded or blocked
    }
  }, [])

  const sizes = FORMATS[format] || FORMATS.responsive

  return (
    <div style={{
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      margin: '16px 0',
      minHeight: format === 'horizontal' ? '90px' : format === 'rectangle' ? '250px' : '100px',
      background: 'rgba(255,255,255,0.01)',
      borderRadius: '8px',
      overflow: 'hidden',
      ...style,
    }}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: 'block',
          ...sizes,
        }}
        data-ad-client="ca-pub-8843767538393029"
        data-ad-slot={slot || '0000000000'}
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      />
    </div>
  )
}
