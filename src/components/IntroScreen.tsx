'use client'
import { useState, useEffect, useRef } from 'react'

type Phase = 'fuel' | 'ready' | 'grow' | 'fade'

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('fuel')
  const [fuelPct, setFuelPct] = useState(0)
  const [readyOpacity, setReadyOpacity] = useState(0)
  const [screenOpacity, setScreenOpacity] = useState(1)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const rafRef = useRef(0)

  // Prevent body scroll during intro
  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // ── Phase 1: Fuel gauge fills ────────────────────
  useEffect(() => {
    if (phase !== 'fuel') return
    const DURATION = 3000
    const start = performance.now()
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setFuelPct(Math.round(p * 100))
      if (p < 1) { rafRef.current = requestAnimationFrame(tick) }
      else { setTimeout(() => setPhase('ready'), 350) }
    }
    rafRef.current = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  // ── Phase 2: "Готовы? Поплыли!" ─────────────────
  useEffect(() => {
    if (phase !== 'ready') return
    const t1 = setTimeout(() => setReadyOpacity(1), 50)
    const t2 = setTimeout(() => setReadyOpacity(0), 2100)
    const t3 = setTimeout(() => setPhase('grow'), 2700)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase])

  // ── Phase 3: ЛАДОГА canvas grow ─────────────────
  useEffect(() => {
    if (phase !== 'grow') return
    const canvas = canvasRef.current
    if (!canvas) return

    const W = canvas.width = window.innerWidth
    const H = canvas.height = window.innerHeight
    const DURATION = 5200
    const start = performance.now()

    // Match main page font size (22vw), cap to reasonable max
    const fontSize = Math.min(W * 0.22, 340)
    // Scale needed to make letters cover entire viewport
    const maxScale = (H / (fontSize * 0.75)) * 1.9

    const render = (now: number) => {
      const prog = Math.min(1, (now - start) / DURATION)

      // Ease in-out cubic — slow start, fast middle, smooth end
      const t = prog < 0.5
        ? 4 * prog * prog * prog
        : 1 - Math.pow(-2 * prog + 2, 3) / 2

      const scale = 0.004 + t * maxScale

      // Fade canvas in last 30% so gradient fills everything cleanly
      const canvasAlpha = prog > 0.7 ? Math.max(0, 1 - (prog - 0.7) / 0.3) : 1
      canvas.style.opacity = String(canvasAlpha)

      const ctx = canvas.getContext('2d')!

      // Reset to opaque dark background
      ctx.globalCompositeOperation = 'source-over'
      ctx.fillStyle = '#06080f'
      ctx.fillRect(0, 0, W, H)

      // Punch transparent holes where letters are — gradient behind shines through
      ctx.save()
      ctx.translate(W / 2, H / 2)
      ctx.scale(scale, scale)
      ctx.translate(-W / 2, -H / 2)
      ctx.globalCompositeOperation = 'destination-out'
      ctx.font = `900 ${fontSize}px Unbounded, 'Arial Black', sans-serif`
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'
      ctx.fillStyle = 'rgba(255,255,255,1)'
      ctx.fillText('ЛАДОГА', W / 2, H / 2)
      ctx.restore()
      ctx.globalCompositeOperation = 'source-over'

      if (prog < 1) {
        rafRef.current = requestAnimationFrame(render)
      } else {
        setTimeout(() => setPhase('fade'), 80)
      }
    }

    rafRef.current = requestAnimationFrame(render)
    return () => cancelAnimationFrame(rafRef.current)
  }, [phase])

  // ── Phase 4: Fade entire overlay to 0 ───────────
  useEffect(() => {
    if (phase !== 'fade') return
    const t1 = setTimeout(() => setScreenOpacity(0), 50)
    const t2 = setTimeout(onDone, 1150)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase, onDone])

  const showFuelOrReady = phase === 'fuel' || phase === 'ready'
  const showGrow = phase === 'grow' || phase === 'fade'

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
      opacity: screenOpacity,
      transition: screenOpacity < 1 ? 'opacity 1.1s ease-out' : undefined,
    }}>
      {/* Gradient bg — visible through canvas holes during grow phase */}
      <div style={{
        position: 'absolute', inset: 0,
        background: showGrow
          ? 'linear-gradient(150deg, #d4b87a 0%, #6ab8cc 45%, #4a9eb8 70%, #c8a060 100%)'
          : '#06080f',
      }} />

      {/* Canvas overlay — dark mask with text cutouts */}
      {showGrow && (
        <canvas
          ref={canvasRef}
          style={{ position: 'absolute', inset: 0, display: 'block' }}
        />
      )}

      {/* Fuel gauge + "Готовы? Поплыли!" */}
      {showFuelOrReady && (
        <div style={{
          position: 'absolute', inset: 0, display: 'flex',
          flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        }}>
          {/* Gauge (fades out in ready phase) */}
          <div style={{
            opacity: phase === 'fuel' ? 1 : 0,
            transition: 'opacity 0.4s',
            display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
          }}>
            <FuelGauge pct={fuelPct} />
            <p style={{
              color: 'rgba(255,255,255,0.38)',
              fontSize: 11,
              letterSpacing: '0.24em',
              textTransform: 'uppercase',
              fontWeight: 500,
              marginTop: 6,
            }}>
              Заправляем полный бак
            </p>
          </div>

          {/* "Готовы? Поплыли!" */}
          <div style={{
            position: 'absolute',
            opacity: readyOpacity,
            transition: 'opacity 0.55s ease-in-out',
            textAlign: 'center',
          }}>
            <p style={{
              fontFamily: "var(--font-display, 'Unbounded', sans-serif)",
              fontSize: 'clamp(20px, 4vw, 44px)',
              fontWeight: 700,
              letterSpacing: '0.05em',
              backgroundImage: 'linear-gradient(150deg, #d4b87a 0%, #6ab8cc 45%, #4a9eb8 70%, #c8a060 100%)',
              WebkitBackgroundClip: 'text',
              backgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              color: 'transparent',
            }}>
              Готовы?&nbsp;Поплыли!
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ── Fuel gauge component ───────────────────────────
function FuelGauge({ pct }: { pct: number }) {
  const SEGS = 20
  const filled = Math.round(pct / 100 * SEGS)

  return (
    <div style={{ width: 'min(320px, 80vw)', userSelect: 'none' }}>
      {/* E / F / percent row */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 10,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, letterSpacing: '0.2em' }}>E</span>
        <span style={{ color: '#c8965a', fontWeight: 600, fontSize: 11, letterSpacing: '0.12em' }}>
          ⛽ {pct}%
        </span>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, letterSpacing: '0.2em' }}>F</span>
      </div>

      {/* Segmented fill bar */}
      <div style={{ display: 'flex', gap: 4, height: 22 }}>
        {Array.from({ length: SEGS }, (_, i) => (
          <div key={i} style={{
            flex: 1, borderRadius: 3,
            background: i < filled
              ? (i < 3 ? '#c0432a' : '#c8965a')
              : 'rgba(255,255,255,0.05)',
            border: `1px solid ${i < filled ? 'transparent' : 'rgba(255,255,255,0.07)'}`,
            boxShadow: i < filled ? '0 0 6px rgba(200,150,90,0.3)' : 'none',
            transition: 'background 0.08s',
          }} />
        ))}
      </div>

      {/* Tick marks */}
      <div style={{
        display: 'flex', justifyContent: 'space-between',
        marginTop: 5, padding: '0 1px',
      }}>
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} style={{
            width: 1,
            height: i % 2 === 0 ? 7 : 4,
            background: 'rgba(255,255,255,0.18)',
          }} />
        ))}
      </div>
    </div>
  )
}
