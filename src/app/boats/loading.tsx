export default function BoatsLoading() {
  return (
    <div className="py-8 px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-semibold text-slate-800 mb-6">Каталог катеров</h1>
        <div className="h-16 bg-slate-100 rounded-2xl animate-pulse mb-8" />
        <p className="text-slate-400 text-sm mb-6">Загружаем катера...</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-slate-100 rounded-2xl h-72 animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  )
}
