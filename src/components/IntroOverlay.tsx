'use client'
import { useState, useEffect } from 'react'
import IntroScreen from './IntroScreen'
const KEY = 'ladoga_intro_v1'
export default function IntroOverlay() {
  const [show, setShow] = useState(false)
  useEffect(() => {
    try {
      if (!sessionStorage.getItem(KEY)) setShow(true)
    } catch { }
  }, [])
  if (!show) return null
  return (
    <IntroScreen onDone={() => {
      try { sessionStorage.setItem(KEY, '1') } catch {}
      setShow(false)
    }} />
  )
}
