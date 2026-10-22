'use client'

import { useRef, useState } from 'react'

const MAX_PHOTOS = 5
const MAX_BYTES = 5 * 1024 * 1024

type Props = {
  images: string[]
  onChange: (images: string[]) => void
}

export default function PhotoUploader({ images, onChange }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  async function handleFiles(files: FileList | null) {
    if (!files || !files.length) return
    setError('')

    const remaining = MAX_PHOTOS - images.length
    if (remaining <= 0) {
      setError(`Можно загрузить не больше ${MAX_PHOTOS} фото на катер`)
      return
    }

    const toUpload = Array.from(files).slice(0, remaining)
    if (files.length > remaining) {
      setError(`Можно загрузить не больше ${MAX_PHOTOS} фото на катер — добавлены первые ${remaining}`)
    }

    for (const file of toUpload) {
      if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
        setError(`${file.name}: поддерживаются только JPG, PNG, WEBP`)
        continue
      }
      if (file.size > MAX_BYTES) {
        setError(`${file.name}: файл больше 5 МБ`)
        continue
      }
      setUploading(true)
      try {
        const fd = new FormData()
        fd.append('file', file)
        const res = await fetch('/api/upload/photo', { method: 'POST', body: fd })
        const data = await res.json()
        if (!res.ok) {
          setError(data.error ?? `${file.name}: не удалось загрузить`)
          continue
        }
        onChange([...images, data.url])
      } catch {
        setError(`${file.name}: не удалось загрузить, проверьте соединение`)
      } finally {
        setUploading(false)
      }
    }
  }

  return (
    <div>
      <p className="text-xs text-slate-400 mb-2">
        До {MAX_PHOTOS} фото, формат JPG/PNG/WEBP, размер каждого файла — не больше 5 МБ.
      </p>
      <div className="flex flex-wrap gap-2 mb-2">
        {images.map((img, i) => (
          <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden bg-slate-100">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt="" className="w-full h-full object-cover" />
            <button
              type="button"
              onClick={() => onChange(images.filter((_, j) => j !== i))}
              className="absolute top-0.5 right-0.5 bg-white rounded-full text-red-500 text-xs w-5 h-5 flex items-center justify-center shadow"
            >×</button>
          </div>
        ))}
        {images.length < MAX_PHOTOS && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={uploading}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-slate-300 flex items-center justify-center text-slate-400 hover:border-blue-400 hover:text-blue-500 transition-colors disabled:opacity-50"
          >
            {uploading ? (
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
              </svg>
            ) : (
              <span className="text-2xl">+</span>
            )}
          </button>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => { handleFiles(e.target.files); e.target.value = '' }}
      />
      {error && <p className="text-xs text-red-500 mt-1">{error}</p>}
    </div>
  )
}
