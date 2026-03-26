import { useEffect, useRef } from 'react'

/**
 * Google AdSense banner component.
 * Won't render anything until you set real slot IDs.
 *
 * Usage:
 *   <AdBanner slot="1234567890" format="horizontal" />
 */

const FORMATS = {
  horizontal: { width: '100%', height: '90px' },
  rectangle: { width: '300px', height: '250px' },
  responsive: { width: '100%', height: 'auto' },
}

export default function AdBanner({ slot, format = 'horizontal', style = {} }) {
  const adRef = useRef(null)
  const pushed = useRef(false)

  // Don't render if no real slot ID
  const hasRealSlot = slot && slot !== 'YOUR_AD_SLOT_ID' && slot !== '0000000000'

  useEffect(() => {
    if (!hasRealSlot || pushed.current) return
    try {
      if (window.adsbygoogle && adRef.current) {
        window.adsbygoogle.push({})
        pushed.current = true
      }
    } catch (e) {
      // AdSense not loaded or blocked — fail silently
    }
  }, [hasRealSlot])

  if (!hasRealSlot) return null

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
        style={{ display: 'block', ...sizes }}
        data-ad-client="ca-pub-8843767538393029"
        data-ad-slot={slot}
        data-ad-format={format === 'responsive' ? 'auto' : undefined}
        data-full-width-responsive={format === 'responsive' ? 'true' : undefined}
      />
    </div>
  )
}
