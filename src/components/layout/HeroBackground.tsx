export default function HeroBackground() {
  // Treeline: Karelian island with pine forest
  const tL = 585, tR = 1440, nT = 44

  const gY = (x: number) => {
    const d = Math.abs(x - 1015) / 435
    return 490 + d * d * 57
  }
  const tH = (x: number) => {
    const d = Math.abs(x - 985) / 448
    return Math.max(10, 76 - d * d * 65)
  }

  const pts: string[] = [`M ${tL},820`, `L ${tL},${gY(tL).toFixed(0)}`]
  for (let i = 0; i <= nT; i++) {
    const x = tL + (i / nT) * (tR - tL)
    pts.push(`L ${x.toFixed(0)},${(gY(x) - tH(x)).toFixed(0)}`)
    if (i < nT) {
      const vx = tL + ((i + 0.5) / nT) * (tR - tL)
      pts.push(`L ${vx.toFixed(0)},${(gY(vx) - tH(vx) * 0.28).toFixed(0)}`)
    }
  }
  pts.push(`L 1440,${gY(1440).toFixed(0)}`, 'L 1440,820', 'Z')
  const treePath = pts.join(' ')

  const stars: [number, number, number, number][] = [
    [52,28,0.9,0.85],[98,14,1.1,0.9],[148,48,0.7,0.7],[205,11,1.0,0.8],[258,36,0.8,0.75],
    [318,8,1.2,0.9],[372,32,0.7,0.7],[428,10,0.9,0.85],[488,42,0.6,0.65],[44,82,0.8,0.75],
    [115,75,0.6,0.65],[198,88,1.0,0.8],[275,68,0.8,0.75],[352,84,0.7,0.7],[444,72,1.0,0.85],
    [62,122,0.9,0.8],[135,135,0.6,0.65],[212,108,1.1,0.85],[288,128,0.8,0.75],[365,115,0.7,0.7],
    [455,105,1.0,0.85],[525,122,0.6,0.6],[72,165,0.8,0.7],[158,172,0.6,0.65],[242,155,0.9,0.8],
    [325,175,0.7,0.7],[418,162,1.1,0.85],[508,148,0.8,0.75],[552,168,0.6,0.6],[82,218,0.7,0.65],
    [178,228,0.9,0.75],[265,208,0.6,0.6],[352,235,0.8,0.7],[442,218,0.7,0.65],[530,208,1.0,0.8],
    [45,272,0.6,0.6],[135,258,0.8,0.7],[225,278,0.7,0.65],[312,262,0.6,0.6],[402,272,0.9,0.75],
    [492,255,0.7,0.65],[558,272,0.5,0.55],[55,322,0.7,0.65],[148,308,0.5,0.55],[245,328,0.8,0.7],
    [335,315,0.6,0.6],[428,308,0.7,0.65],[522,325,0.5,0.55],[88,375,0.6,0.55],[185,362,0.7,0.6],
    [278,382,0.5,0.5],[368,368,0.6,0.55],[462,375,0.8,0.65],[552,358,0.5,0.5],
  ]

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none select-none">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 1440 820"
        className="w-full h-full"
        preserveAspectRatio="xMidYMid slice"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="hb-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#020910"/>
            <stop offset="38%" stopColor="#0a1c35"/>
            <stop offset="72%" stopColor="#0e2645"/>
            <stop offset="100%" stopColor="#0b2040"/>
          </linearGradient>
          <linearGradient id="hb-water" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#0d2240"/>
            <stop offset="100%" stopColor="#060e1c"/>
          </linearGradient>
          <radialGradient id="hb-aurora" gradientUnits="userSpaceOnUse" cx="1008" cy="295" r="580">
            <stop offset="0%" stopColor="#2dd4bf" stopOpacity="0.11"/>
            <stop offset="55%" stopColor="#38bdf8" stopOpacity="0.03"/>
            <stop offset="100%" stopColor="#0a1c35" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hb-hglow" gradientUnits="userSpaceOnUse" cx="720" cy="555" r="750">
            <stop offset="0%" stopColor="#1a4055" stopOpacity="0.42"/>
            <stop offset="100%" stopColor="#020910" stopOpacity="0"/>
          </radialGradient>
          <radialGradient id="hb-moon">
            <stop offset="0%" stopColor="#ddeefa"/>
            <stop offset="30%" stopColor="#a8d8f0" stopOpacity="0.45"/>
            <stop offset="100%" stopColor="#3dbead" stopOpacity="0"/>
          </radialGradient>
          <linearGradient id="hb-refl" gradientUnits="userSpaceOnUse" x1="620" y1="0" x2="1260" y2="0">
            <stop offset="0%" stopColor="#b8dff5" stopOpacity="0"/>
            <stop offset="45%" stopColor="#b8dff5" stopOpacity="0.1"/>
            <stop offset="100%" stopColor="#b8dff5" stopOpacity="0"/>
          </linearGradient>
          <linearGradient id="hb-lvig" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#020910" stopOpacity="0.78"/>
            <stop offset="35%" stopColor="#020910" stopOpacity="0.35"/>
            <stop offset="62%" stopColor="#020910" stopOpacity="0.06"/>
            <stop offset="100%" stopColor="#020910" stopOpacity="0"/>
          </linearGradient>
        </defs>

        {/* Sky */}
        <rect width="1440" height="820" fill="url(#hb-sky)"/>

        {/* Aurora shimmer */}
        <ellipse cx="1008" cy="295" rx="680" ry="255" fill="url(#hb-aurora)"/>

        {/* Horizon atmospheric glow */}
        <ellipse cx="720" cy="555" rx="1100" ry="480" fill="url(#hb-hglow)"/>

        {/* Stars */}
        {stars.map(([x, y, r, o], i) => (
          <circle key={i} cx={x} cy={y} r={r} fill="white" opacity={o}/>
        ))}

        {/* Moon */}
        <circle cx="1182" cy="108" r="42" fill="url(#hb-moon)" opacity="0.52"/>
        <circle cx="1182" cy="108" r="5.5" fill="#ddeefa" opacity="0.92"/>

        {/* Water */}
        <rect x="0" y="548" width="1440" height="272" fill="url(#hb-water)"/>

        {/* Moon reflection */}
        <rect x="620" y="552" width="640" height="268" fill="url(#hb-refl)"/>
        {[0,1,2,3,4,5,6,7].map(i => (
          <rect
            key={`rip-${i}`}
            x={820 - i * 16} y={564 + i * 27}
            width={310 + i * 10} height={1.1}
            fill="#b8dff5" opacity={0.055 - i * 0.005} rx="0.6"
          />
        ))}

        {/* Distant small island (adds depth) */}
        <path
          fill="#0a1e38" opacity="0.5"
          d="M 390,548 Q 430,532 490,535 Q 535,532 568,542 L 572,548 Z"
        />

        {/* Main Karelian island + pine forest */}
        <path fill="#020810" d={treePath}/>

        {/* Left-side vignette for text readability */}
        <rect width="1440" height="820" fill="url(#hb-lvig)"/>
      </svg>
    </div>
  )
}
