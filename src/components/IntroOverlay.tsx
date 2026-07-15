'use client'
import { useState, useEffect } from 'react'
import IntroScreen from './IntroScreen'

const KEY = 'ladoga_intro_v1'

export default function IntroOverlay() {
  // Start as true — overlay is visible immediately, no flash of page content
  const [show, setShow] = useState(true)

  useEffect(() => {
    // Hide immediately if already seen this session
    try {
      if (sessionStorage.getItem(KEY)) setShow(false)
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
