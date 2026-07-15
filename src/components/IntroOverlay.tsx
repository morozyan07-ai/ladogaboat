'use client'
import { useState, useEffect } from 'react'
import IntroScreen from './IntroScreen'

const KEY = 'ladoga_intro_v1'

export default function IntroOverlay() {
  const [show, setShow] = useState(false)

  useEffect(() => {
    try {
      if (!localStorage.getItem(KEY)) setShow(true)
    } catch { /* localStorage недоступен — пропускаем заставку */ }
  }, [])

  if (!show) return null

  return (
    <IntroScreen onDone={() => {
      try { localStorage.setItem(KEY, '1') } catch {}
      setShow(false)
    }} />
  )
}
