'use client'

import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'

// ─── Константы ───────────────────────────────────────────────────────────────
const SPEED_KMH   = 45
const COST_PER_KM = 80       // операционные затраты, руб/км
const MIN_COST    = 2000     // минимальная себестоимость рейса, руб
const MARGIN      = 0.4      // маржинальность 40%

// ─── Фарватерная сеть Ладоги ─────────────────────────────────────────────────
// Ключевые навигационные точки [lat, lng]
const WP: [number, number][] = [
  [59.944, 31.037],  //  0 Шлиссельбург
  [60.022, 30.690],  //  1 Осиновец
  [60.200, 31.700],  //  2 Южный фарватер (пром. точка)
  [60.097, 32.333],  //  3 Новая Ладога
  [60.490, 32.838],  //  4 Свирица
  [60.726, 33.553],  //  5 Лодейное Поле
  [60.978, 32.978],  //  6 Олонец
  [61.200, 31.700],  //  7 Центральный фарватер (север)
  [61.574, 31.487],  //  8 Питкяранта
  [61.708, 30.688],  //  9 Сортавала
  [61.378, 30.959],  // 10 Валаам
  [61.300, 30.400],  // 11 Северные шхеры
  [61.038, 29.677],  // 12 Приозерск
  [60.872, 30.580],  // 13 Коневец
  [60.600, 30.900],  // 14 Западный фарватер (пром. точка)
]

// Рёбра графа — двунаправленные, соответствуют навигационным коридорам
const EDGES: [number, number][] = [
  [0, 1], [0, 2], [0, 3],   // Шлиссельбург — южное побережье
  [1, 13],[1, 14],           // Осиновец — западный берег
  [2, 3], [2, 7],            // Южный фарватер — центр
  [3, 4],                    // Новая Ладога — Свирица
  [4, 5],                    // Свирица — Лодейное Поле
  [5, 6],                    // Лодейное Поле — Олонец
  [6, 7], [6, 8],            // Олонец — центр / Питкяранта
  [7, 8], [7, 10],           // Центральный фарватер
  [8, 9],                    // Питкяранта — Сортавала
  [9, 10],[9, 11],           // Сортавала — Валаам / шхеры
  [10, 7],                   // Валаам — центр
  [11, 12],                  // Шхеры — Приозерск
  [12, 13],[12, 14],         // Приозерск — Коневец / западный фарватер
  [13, 14],                  // Коневец — западный фарватер
  [14, 1],                   // Западный фарватер — Осиновец
]

// ─── Алгоритмы ───────────────────────────────────────────────────────────────
function haversineKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371
  const dLat = (lat2 - lat1) * (Math.PI / 180)
  const dLon = (lon2 - lon1) * (Math.PI / 180)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Строим взвешенный граф из рёбер
function buildGraph(): Map<number, [number, number][]> {
  const graph = new Map<number, [number, number][]>()
  for (let i = 0; i < WP.length; i++) graph.set(i, [])
  for (const [a, b] of EDGES) {
    const d = haversineKm(WP[a][0], WP[a][1], WP[b][0], WP[b][1])
    graph.get(a)!.push([b, d])
    graph.get(b)!.push([a, d])
  }
  return graph
}

// Алгоритм Дейкстры — кратчайший путь в графе
function dijkstra(graph: Map<number, [number, number][]>, start: number, end: number): number {
  const dist: number[] = Array(WP.length).fill(Infinity)
  dist[start] = 0
  const pq: [number, number][] = [[0, start]]

  while (pq.length > 0) {
    pq.sort((a, b) => a[0] - b[0])
    const [d, u] = pq.shift()!
    if (d > dist[u]) continue
    if (u === end) return d
    for (const [v, w] of graph.get(u) ?? []) {
      const nd = d + w
      if (nd < dist[v]) { dist[v] = nd; pq.push([nd, v]) }
    }
  }
  return dist[end]
}

const GRAPH = buildGraph()

// Расстояние по фарватеру: через K ближайших узлов с обеих сторон
function fairwayDistanceKm(from: [number, number], to: [number, number]): number {
  const K = 3
  const nearest = (pt: [number, number]) =>
    WP.map((wp, i) => ({ i, d: haversineKm(pt[0], pt[1], wp[0], wp[1]) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, K)

  const fromNear = nearest(from)
  const toNear   = nearest(to)

  let best = Infinity
  for (const fa of fromNear) {
    for (const ta of toNear) {
      const graphDist = fa.i === ta.i ? 0 : dijkstra(GRAPH, fa.i, ta.i)
      if (graphDist < Infinity) {
        best = Math.min(best, fa.d + graphDist + ta.d)
      }
    }
  }
  // Запасной вариант — нет пути в графе
  return best < Infinity ? best : haversineKm(from[0], from[1], to[0], to[1]) * 1.3
}

function calcTrip(from: [number, number], to: [number, number]) {
  const distance = fairwayDistanceKm(from, to)
  const opCost   = Math.max(MIN_COST, distance * COST_PER_KM)
  const price    = Math.round(opCost / (1 - MARGIN) / 100) * 100
  const timeHours = distance / SPEED_KMH
  return { distance, price, timeHours }
}

function formatTime(hours: number) {
  const h = Math.floor(hours)
  const m = Math.round((hours - h) * 60)
  if (h === 0) return `${m} мин`
  if (m === 0) return `${h} ч`
  return `${h} ч ${m} мин`
}

function pinSvg(letter: string, bg: string) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 36 44" width="36" height="44">
    <path fill="${bg}" stroke="white" stroke-width="2"
      d="M18 2C9.2 2 2 9.2 2 18c0 10 16 24 16 24s16-14 16-24C34 9.2 26.8 2 18 2Z"/>
    <text x="18" y="22" text-anchor="middle" fill="white" font-size="13"
      font-weight="700" font-family="Arial,sans-serif">${letter}</text>
  </svg>`
}

// ─── Компонент ────────────────────────────────────────────────────────────────
type Step = 'from' | 'to' | 'done'
type Trip = ReturnType<typeof calcTrip>

export default function WaterTaxiMap() {
  const containerRef = useRef<HTMLDivElement>(null)
  const mapRef       = useRef<any>(null)
  const fromMarker   = useRef<any>(null)
  const toMarker     = useRef<any>(null)
  const polyline     = useRef<any>(null)
  const clickState   = useRef<'idle' | 'from-set'>('idle')

  const [step, setStep] = useState<Step>('from')
  const [trip, setTrip] = useState<Trip | null>(null)

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return

    import('leaflet').then((L) => {
      const map = L.map(containerRef.current!, { center: [61.0, 31.5], zoom: 8 })
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© OpenStreetMap contributors', maxZoom: 17,
      }).addTo(map)

      const iconA = L.divIcon({ html: pinSvg('A', '#16a34a'), className: '', iconSize: [36, 44], iconAnchor: [18, 44] })
      const iconB = L.divIcon({ html: pinSvg('B', '#dc2626'), className: '', iconSize: [36, 44], iconAnchor: [18, 44] })

      map.on('click', (e: any) => {
        const { lat, lng } = e.latlng

        if (clickState.current === 'idle') {
          fromMarker.current?.remove()
          toMarker.current?.remove()
          polyline.current?.remove()
          fromMarker.current = L.marker([lat, lng], { icon: iconA }).addTo(map)
          toMarker.current = null; polyline.current = null
          clickState.current = 'from-set'
          setStep('to'); setTrip(null)
        } else {
          toMarker.current?.remove(); polyline.current?.remove()
          toMarker.current = L.marker([lat, lng], { icon: iconB }).addTo(map)

          const { lat: fLat, lng: fLng } = fromMarker.current.getLatLng()
          polyline.current = L.polyline([[fLat, fLng], [lat, lng]], {
            color: '#0d9488', weight: 2.5, dashArray: '10 6', opacity: 0.85,
          }).addTo(map)

          map.fitBounds([[fLat, fLng], [lat, lng]], { padding: [60, 60] })
          setTrip(calcTrip([fLat, fLng], [lat, lng]))
          setStep('done')
          clickState.current = 'idle'
        }
      })

      mapRef.current = map
    })

    return () => { mapRef.current?.remove(); mapRef.current = null }
  }, [])

  function reset() {
    fromMarker.current?.remove(); fromMarker.current = null
    toMarker.current?.remove();   toMarker.current   = null
    polyline.current?.remove();   polyline.current   = null
    clickState.current = 'idle'
    setTrip(null); setStep('from')
    mapRef.current?.setView([61.0, 31.5], 8)
  }

  const stepColors: Record<Step, string> = {
    from: 'bg-emerald-600 text-white',
    to:   'bg-blue-600 text-white',
    done: 'bg-slate-100 text-slate-700 border border-slate-200',
  }
  const stepLabels: Record<Step, string> = {
    from: '1. Кликните на карте — точка отправления',
    to:   '2. Кликните ещё раз — точка прибытия',
    done: '✓ Маршрут построен',
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
      {/* Карта */}
      <div className="lg:col-span-2 relative">
        <div
          ref={containerRef}
          className="w-full rounded-xl overflow-hidden border border-slate-200 shadow-sm"
          style={{ height: 420 }}
        />
        <div className={`absolute top-3 left-1/2 -translate-x-1/2 z-[1000] whitespace-nowrap px-4 py-2 rounded-full text-sm font-medium shadow-md pointer-events-none ${stepColors[step]}`}>
          {stepLabels[step]}
        </div>
      </div>

      {/* Панель результата */}
      <div className="flex flex-col gap-4">
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5">
          <h3 className="font-semibold text-slate-800 mb-4">Расчёт поездки</h3>

          {!trip ? (
            <div className="py-8 text-center text-slate-400 text-sm">
              <div className="text-4xl mb-3">🗺️</div>
              <p>Выберите две точки на карте,<br />чтобы увидеть расчёт</p>
            </div>
          ) : (
            <div className="space-y-1">
              <Row label="Расстояние по фарватеру" value={`${trip.distance.toFixed(1)} км`} bold />
              <Row label="Средняя скорость"         value={`${SPEED_KMH} км/ч`} />
              <Row label="Время в пути"              value={formatTime(trip.timeHours)} bold />

              <div className="mt-4 bg-teal-50 border border-teal-200 rounded-xl p-4 text-center">
                <p className="text-xs text-teal-600 mb-1">Стоимость поездки</p>
                <p className="text-3xl font-black text-teal-700">
                  {trip.price.toLocaleString('ru-RU')} ₽
                </p>
                <p className="text-xs text-slate-400 mt-1">маржинальность {MARGIN * 100}% учтена</p>
              </div>

              <button
                onClick={reset}
                className="mt-3 w-full py-2 rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 text-sm transition-colors cursor-pointer"
              >
                Сбросить маршрут
              </button>
            </div>
          )}
        </div>

        <div className="bg-blue-50 rounded-xl p-4 text-xs text-blue-700 space-y-1">
          <p className="font-semibold">Формула расчёта</p>
          <p className="text-blue-600 leading-relaxed">
            Дистанция — по сети фарватеров Ладоги<br />
            Цена = max(2 000 ₽, км × {COST_PER_KM}₽) ÷ {(1 - MARGIN).toFixed(1)}
          </p>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex justify-between items-center py-2.5 border-b border-slate-100 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className={`text-sm ${bold ? 'font-semibold text-slate-800' : 'text-slate-700'}`}>{value}</span>
    </div>
  )
}
