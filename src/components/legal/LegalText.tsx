import type { ReactNode } from 'react'

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-xl font-semibold text-slate-800 mb-3">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
}

export function P({ children }: { children: ReactNode }) {
  return <p className="text-slate-600 leading-relaxed">{children}</p>
}

export function B({ children }: { children: ReactNode }) {
  return <span className="font-semibold text-slate-800">{children}</span>
}
