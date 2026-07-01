'use client'

import { useState } from 'react'

function getSeason(): 'winter' | 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth() // 0=Jan … 11=Dec
  if (month <= 1 || month === 11) return 'winter'
  if (month <= 4) return 'spring'
  if (month <= 7) return 'summer'
  return 'autumn'
}

// Зима — своё фото Ладоги (public/hero/winter.jpg)
// Остальные сезоны — временный фон из Unsplash, замени когда появятся фото
const SEASON_IMAGES: Record<ReturnType<typeof getSeason>, string> = {
  winter: '/hero/winter.jpg',
  spring: '/hero/ladoga-summer.jpg',
  summer: '/hero/ladoga-summer.jpg',
  autumn: '/hero/ladoga-summer.jpg',
}

const SEASON_ALT: Record<ReturnType<typeof getSeason>, string> = {
  winter: 'Ладожское озеро зимой, закат над льдом',
  spring: 'Ладожские шхеры, Карелия весной',
  summer: 'Ладожское озеро летом',
  autumn: 'Ладожские шхеры, Карелия осенью',
}

export default function HeroBackground() {
  const [loaded, setLoaded] = useState(false)
  const season = getSeason()
  const src = SEASON_IMAGES[season]
  const alt = SEASON_ALT[season]

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${loaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setLoaded(true)}
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-800/40 to-teal-800/50" />
    </div>
  )
}
