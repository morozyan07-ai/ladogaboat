'use client'
import { useState, useEffect } from 'react'

type Phase = 'fuel' | 'ready' | 'fade'

export default function IntroScreen({ onDone }: { onDone: () => void }) {
  const [phase, setPhase] = useState<Phase>('fuel')
  const [fuelPct, setFuelPct] = useState(0)
  const [readyOpacity, setReadyOpacity] = useState(0)
  const [screenOpacity, setScreenOpacity] = useState(1)

  useEffect(() => {
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => { document.body.style.overflow = prev }
  }, [])

  // Phase 1: Fuel gauge fills (1500ms)
  useEffect(() => {
    if (phase !== 'fuel') return
    const DURATION = 1500
    const start = performance.now()
    let raf = 0
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / DURATION)
      setFuelPct(Math.round(p * 100))
      if (p < 1) { raf = requestAnimationFrame(tick) }
      else { setTimeout(() => setPhase('ready'), 200) }
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [phase])

  // Phase 2: "Готовы? Поплыли!" (600ms visible)
  useEffect(() => {
    if (phase !== 'ready') return
    const t1 = setTimeout(() => setReadyOpacity(1), 50)
    const t2 = setTimeout(() => setReadyOpacity(0), 650)
    const t3 = setTimeout(() => setPhase('fade'), 1000)
    return () => { clearTimeout(t1); clearTimeout(t2); clearTimeout(t3) }
  }, [phase])

  // Phase 3: Fade out (450ms)
  useEffect(() => {
    if (phase !== 'fade') return
    const t1 = setTimeout(() => setScreenOpacity(0), 50)
    const t2 = setTimeout(onDone, 500)
    return () => { clearTimeout(t1); clearTimeout(t2) }
  }, [phase, onDone])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999, overflow: 'hidden',
      background: '#06080f',
      opacity: screenOpacity,
      transition: screenOpacity < 1 ? 'opacity 0.45s ease-out' : undefined,
    }}>
      <button
        onClick={onDone}
        style={{
          position: 'absolute', top: 16, right: 16, zIndex: 10,
          background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.2)',
          color: 'rgba(255,255,255,0.75)', cursor: 'pointer',
          borderRadius: 8, padding: '4px 12px',
          fontSize: 13, letterSpacing: '0.04em',
          fontFamily: 'inherit',
        }}
      >
        Пропустить ×
      </button>

      <div style={{
        position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
      }}>
        <div style={{
          opacity: phase === 'fuel' ? 1 : 0,
          transition: 'opacity 0.3s',
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20,
        }}>
          <FuelGauge pct={fuelPct} />
          <p style={{
            color: 'rgba(200,150,90,0.75)',
            fontSize: 15,
            letterSpacing: '0.22em',
            textTransform: 'uppercase',
            fontWeight: 500,
            marginTop: 4,
          }}>
            Заправляем полный бак
          </p>
        </div>

        <div style={{
          position: 'absolute',
          opacity: readyOpacity,
          transition: 'opacity 0.4s ease-in-out',
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
    </div>
  )
}

function FuelPumpIcon() {
  return (
    <svg width="22" height="28" viewBox="0 0 22 28" fill="none"
         stroke="rgba(255,255,255,0.6)" strokeWidth="1.3"
         strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="2" width="13" height="22" rx="1.5" />
      <rect x="3" y="5" width="9" height="5.5" rx="1" />
      <path d="M14 8.5 L20 5.5 L20 16" />
      <path d="M20 14.5 L20 19 Q20 21.5 17.5 21.5" />
      <line x1="0" y1="24" x2="14" y2="24" />
    </svg>
  )
}

function FuelGauge({ pct }: { pct: number }) {
  const SEGS = 20
  const filled = Math.round(pct / 100 * SEGS)

  return (
    <div style={{ width: 'min(320px, 80vw)', userSelect: 'none' }}>
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: 14,
      }}>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, letterSpacing: '0.2em' }}>E</span>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
          <FuelPumpIcon />
          <span style={{ color: '#c8965a', fontWeight: 600, fontSize: 12, letterSpacing: '0.12em' }}>
            {pct}%
          </span>
        </div>
        <span style={{ color: 'rgba(255,255,255,0.28)', fontSize: 11, letterSpacing: '0.2em' }}>F</span>
      </div>

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
