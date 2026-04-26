import { useState, useEffect, useRef } from 'react'

/**
 * Counts from 0 to target when the element scrolls into view.
 * Returns [displayValue, ref] — attach ref to the element to observe.
 */
export function useCountUp(target, duration = 1100) {
  const [val, setVal] = useState(0)
  const ref = useRef(null)
  const started = useRef(false)

  useEffect(() => {
    started.current = false
    setVal(0)
  }, [target])

  useEffect(() => {
    const el = ref.current
    if (!el || !target) return
    const obs = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting || started.current) return
      started.current = true
      obs.disconnect()
      const t0 = performance.now()
      const easeOut = p => 1 - Math.pow(1 - p, 3)
      const step = (t) => {
        const progress = Math.min((t - t0) / duration, 1)
        setVal(Math.round(easeOut(progress) * target))
        if (progress < 1) requestAnimationFrame(step)
        else setVal(target)
      }
      requestAnimationFrame(step)
    }, { threshold: 0.2 })
    obs.observe(el)
    return () => obs.disconnect()
  }, [target, duration])

  return [val, ref]
}

/**
 * Counts from 0 to target on mount (after optional delay).
 * Useful for elements that are already in view on page load.
 */
export function useCountUpOnMount(target, duration = 900, delay = 200) {
  const [val, setVal] = useState(0)

  useEffect(() => {
    if (!target) { setVal(0); return }
    let raf
    const timer = setTimeout(() => {
      const t0 = performance.now()
      const easeOut = p => 1 - Math.pow(1 - p, 3)
      const step = (t) => {
        const progress = Math.min((t - t0) / duration, 1)
        setVal(Math.round(easeOut(progress) * target))
        if (progress < 1) raf = requestAnimationFrame(step)
        else setVal(target)
      }
      raf = requestAnimationFrame(step)
    }, delay)
    return () => { clearTimeout(timer); cancelAnimationFrame(raf) }
  }, [target, duration, delay])

  return val
}

/**
 * Spawns a confetti burst at (cx, cy) with the given color.
 * Pure DOM — no libraries needed. Self-cleaning.
 */
export function spawnConfetti(cx, cy, color = '#e10600') {
  const count = 24
  const colors = [color, '#f5c842', '#ffffff', color + 'cc']
  for (let i = 0; i < count; i++) {
    const el = document.createElement('div')
    const angle = (Math.PI * 2 * i) / count + (Math.random() * 0.5 - 0.25)
    const speed = 55 + Math.random() * 70
    const dx = Math.cos(angle) * speed
    const dy = Math.sin(angle) * speed - 35
    const w = 3 + Math.random() * 5
    const h = 5 + Math.random() * 7
    const clr = colors[Math.floor(Math.random() * colors.length)]

    el.style.cssText = `
      position:fixed;
      left:${cx - w / 2}px;
      top:${cy - h / 2}px;
      width:${w}px;
      height:${h}px;
      background:${clr};
      border-radius:1px;
      pointer-events:none;
      z-index:99999;
    `
    document.body.appendChild(el)

    const startTime = performance.now()
    const dur = 650 + Math.random() * 350
    const startRot = Math.random() * 360
    const animate = (now) => {
      const p = Math.min((now - startTime) / dur, 1)
      const x = dx * p
      const y = dy * p + 90 * p * p // gravity
      const rot = startRot + p * 540
      el.style.transform = `translate(${x}px, ${y}px) rotate(${rot}deg)`
      el.style.opacity = String(Math.max(0, 1 - p * 1.2))
      if (p < 1) requestAnimationFrame(animate)
      else el.remove()
    }
    requestAnimationFrame(animate)
  }
}

/**
 * Returns onMouseMove and onMouseLeave handlers for a 3D card tilt effect.
 * Directly mutates the DOM element's style for performance (no re-renders).
 */
export function useTilt(strength = 10, perspective = 700) {
  return {
    onMouseMove(e) {
      const el = e.currentTarget
      const rect = el.getBoundingClientRect()
      const x = ((e.clientX - rect.left) / rect.width - 0.5) * strength
      const y = ((e.clientY - rect.top) / rect.height - 0.5) * -strength
      el.style.transform = `perspective(${perspective}px) rotateX(${y}deg) rotateY(${x}deg) translateY(-4px) scale(1.01)`
      el.style.transition = 'box-shadow 0.3s, border-color 0.3s, background 0.3s'
    },
    onMouseLeave(e) {
      const el = e.currentTarget
      el.style.transform = ''
      el.style.transition = 'all 0.45s cubic-bezier(0.16,1,0.3,1)'
    }
  }
}
