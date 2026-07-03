import ladogaSummerSrc from '../../../public/hero/ladoga-summer.jpg'
import winterSrc from '../../../public/hero/winter.jpg'

function getSeason(): 'winter' | 'spring' | 'summer' | 'autumn' {
  const month = new Date().getMonth()
  if (month <= 1 || month === 11) return 'winter'
  if (month <= 4) return 'spring'
  if (month <= 7) return 'summer'
  return 'autumn'
}

const SEASON_IMAGES: Record<ReturnType<typeof getSeason>, string> = {
  winter: winterSrc.src,
  spring: ladogaSummerSrc.src,
  summer: ladogaSummerSrc.src,
  autumn: ladogaSummerSrc.src,
}

const SEASON_ALT: Record<ReturnType<typeof getSeason>, string> = {
  winter: 'Ладожское озеро зимой, закат над льдом',
  spring: 'Ладожские шхеры, Карелия весной',
  summer: 'Ладожское озеро летом',
  autumn: 'Ладожские шхеры, Карелия осенью',
}

export default function HeroBackground() {
  const season = getSeason()

  return (
    <div className="absolute inset-0 overflow-hidden bg-gradient-to-br from-blue-900 via-blue-800 to-teal-700 pointer-events-none">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={SEASON_IMAGES[season]}
        alt={SEASON_ALT[season]}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-blue-900/60 via-blue-800/40 to-teal-800/50" />
    </div>
  )
}
