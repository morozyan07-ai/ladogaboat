type Point = { label: string; value: number }

type Props = {
  data: Point[]
  formatValue?: (v: number) => string
  color?: string
}

// Лёгкий SVG-график без внешних зависимостей (bundle size на CF Workers имеет значение).
export default function MiniBarChart({ data, formatValue, color = '#2563eb' }: Props) {
  if (!data.length) {
    return <p className="text-sm text-slate-400">Недостаточно данных</p>
  }

  const max = Math.max(1, ...data.map((d) => d.value))
  const barWidth = 100 / data.length

  const fmt = formatValue ?? ((v: number) => v.toLocaleString('ru-RU'))

  return (
    <div>
      <div className="flex items-end gap-1 h-40 w-full">
        {data.map((d, i) => {
          const heightPct = Math.max(2, (d.value / max) * 100)
          return (
            <div key={i} className="group relative flex-1 h-full flex items-end" style={{ minWidth: `${barWidth}%` }}>
              <div
                className="w-full rounded-t-sm transition-opacity group-hover:opacity-80"
                style={{ height: `${heightPct}%`, backgroundColor: color }}
                title={`${d.label}: ${fmt(d.value)}`}
              />
              <div className="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 whitespace-nowrap rounded bg-slate-800 px-2 py-1 text-xs text-white opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {fmt(d.value)}
              </div>
            </div>
          )
        })}
      </div>
      <div className="flex gap-1 mt-2">
        {data.map((d, i) => (
          <div key={i} className="flex-1 text-[10px] text-slate-400 text-center truncate" style={{ minWidth: `${barWidth}%` }}>
            {d.label}
          </div>
        ))}
      </div>
    </div>
  )
}
