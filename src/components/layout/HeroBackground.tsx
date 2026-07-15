import HeroImage from './HeroImage'

export default function HeroBackground() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      <HeroImage />
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/55 to-slate-900/25" />
      <div className="absolute inset-0 bg-gradient-to-r from-slate-900/50 via-slate-900/20 to-transparent" />
    </div>
  )
}
