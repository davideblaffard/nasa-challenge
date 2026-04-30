import React from 'react'

const FILTER_BTNS = [
  { value: 'all', label: 'TUTTI' },
  { value: 'hazardous', label: 'PHO' },
  { value: 'safe', label: 'SICURI' },
]

const SORT_BTNS = [
  { value: 'date', label: 'DATA' },
  { value: 'distance', label: 'DISTANZA ↑' },
  { value: 'diameter', label: 'DIAMETRO ↓' },
]

function Pill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1 text-xs font-mono tracking-widest rounded border transition-all ${
        active
          ? 'bg-pulse/20 border-pulse/60 text-pulse'
          : 'border-white/10 text-dim hover:border-white/30 hover:text-white'
      }`}
    >
      {label}
    </button>
  )
}

export default function FilterBar({ filter, setFilter, sortBy, setSortBy }) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-4">
      <div className="flex gap-2">
        {FILTER_BTNS.map(b => (
          <Pill key={b.value} active={filter === b.value} onClick={() => setFilter(b.value)} label={b.label} />
        ))}
      </div>
      <div className="flex items-center gap-2 ml-auto">
        <span className="text-dim text-xs tracking-widest">ORDINA:</span>
        {SORT_BTNS.map(b => (
          <Pill key={b.value} active={sortBy === b.value} onClick={() => setSortBy(b.value)} label={b.label} />
        ))}
      </div>
    </div>
  )
}
