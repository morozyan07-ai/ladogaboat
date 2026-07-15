'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

const TIME_OPTIONS = Array.from({ length: 14 }, (_, i) => {
  const h = i + 8
  return `${String(h).padStart(2, '0')}:00`
})

export default function HeroSearch() {
  const router = useRouter()
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [guests, setGuests] = useState('')

  function handleSearch() {
    const params = new URLSearchParams()
    if (date) params.set('startDate', date)
    if (time) params.set('time', time)
    if (guests) params.set('capacity', guests)
    router.push(`/boats?${params.toString()}`)
  }

  const fieldStyle: React.CSSProperties = {
    flex: 1,
    padding: '10px 16px',
    borderRight: '0.5px solid rgba(255,255,255,0.08)',
    minWidth: 0,
  }
  const labelStyle: React.CSSProperties = {
    fontSize: '10px',
    color: 'rgba(74,160,175,0.8)',
    textTransform: 'uppercase',
    letterSpacing: '0.12em',
    marginBottom: '3px',
    display: 'block',
  }
  const inputStyle: React.CSSProperties = {
    background: 'none',
    border: 'none',
    outline: 'none',
    color: 'rgba(255,255,255,0.85)',
    fontSize: '13px',
    width: '100%',
    fontFamily: 'inherit',
    colorScheme: 'dark',
  }

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'stretch',
        background: 'rgba(255,255,255,0.06)',
        border: '0.5px solid rgba(255,255,255,0.12)',
        borderRadius: '14px',
        overflow: 'hidden',
        maxWidth: '640px',
      }}
    >
      <div style={fieldStyle}>
        <span style={labelStyle}>Дата</span>
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={inputStyle}
          min={new Date().toISOString().split('T')[0]}
        />
      </div>

      <div style={fieldStyle}>
        <span style={labelStyle}>Время</span>
        <select
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ ...inputStyle, cursor: 'pointer' }}
        >
          <option value="" style={{ background: '#06080f' }}>Любое</option>
          {TIME_OPTIONS.map((t) => (
            <option key={t} value={t} style={{ background: '#06080f' }}>{t}</option>
          ))}
        </select>
      </div>

      <div style={{ ...fieldStyle, borderRight: 'none' }}>
        <span style={labelStyle}>Гости</span>
        <input
          type="number"
          min="1"
          max="11"
          placeholder="Кол-во"
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          style={{ ...inputStyle, '::placeholder': { color: 'rgba(255,255,255,0.2)' } } as React.CSSProperties}
        />
      </div>

      <button
        onClick={handleSearch}
        style={{
          background: '#c8965a',
          border: 'none',
          padding: '0 22px',
          fontWeight: 700,
          fontSize: '13px',
          color: '#06080f',
          cursor: 'pointer',
          letterSpacing: '0.04em',
          flexShrink: 0,
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.background = '#d4a568')}
        onMouseLeave={(e) => (e.currentTarget.style.background = '#c8965a')}
      >
        Найти →
      </button>
    </div>
  )
}
