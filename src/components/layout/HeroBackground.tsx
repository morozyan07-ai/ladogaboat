'use client'

import { useState } from 'react'

// Фото: Республика Карелия, Россия (Владимир Федотов, Unsplash, free license)
// Чтобы заменить на собственное фото Ладоги — положи public/hero/ladoga.jpg
// и замени HERO_IMAGE ниже на '/hero/ladoga.jpg'
const HERO_IMAGE = 'https://images.unsplash.com/photo-1660488996194-b3dc1a5bfcdc?w=1920&q=85&auto=format&fit=crop'

export default function HeroBackground() {
  const [loaded, setLoaded] = useState(false)

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={HERO_IMAGE}
        alt="Ладожские шхеры, Карелия"
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 via-blue-800/55 to-teal-700/45" />
    </div>
  )
}
