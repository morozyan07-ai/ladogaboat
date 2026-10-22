type Announcement = { id: string; title: string; body: string; createdAt: string }

export default function AnnouncementsFeed({ items }: { items: Announcement[] }) {
  if (items.length === 0) return null

  return (
    <div className="bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="p-6 border-b border-slate-100">
        <h2 className="text-xl font-semibold text-slate-800">📣 Новости площадки</h2>
      </div>
      <div className="divide-y divide-slate-100">
        {items.slice(0, 5).map((a) => (
          <div key={a.id} className="p-4">
            <p className="font-medium text-slate-800">{a.title}</p>
            <p className="text-sm text-slate-600 whitespace-pre-wrap mt-1">{a.body}</p>
            <p className="text-xs text-slate-400 mt-2">
              {new Date(a.createdAt).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long' })}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
