'use client'

import dynamic from 'next/dynamic'

const WaterTaxiMap = dynamic(() => import('./WaterTaxiMap'), {
  ssr: false,
  loading: () => <div className="h-[420px] bg-slate-100 rounded-xl animate-pulse" />,
})

export default function WaterTaxiSection() {
  return <WaterTaxiMap />
}
