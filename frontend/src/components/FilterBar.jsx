import React from 'react'

const FILTER_BTNS = [
  { value: 'all',       label: 'ALL' },
  { value: 'hazardous', label: 'PHO' },
  { value: 'safe',      label: 'SAFE' },
]

const SORT_BTNS = [
  { value: 'date',     label: 'DATE' },
  { value: 'distance', label: 'DIST ↑' },
  { value: 'diameter', label: 'SIZE ↓' },
]

function Pill({ active, onClick, label }) {
  return (
    <button
      onClick={onClick}
      className={`px-pill text-[8px] px-3 py-2 bg-void ${active ? 'active' : 'text-dim'}`}
    >
      {label}
    </button>
  )
}

export default function FilterBar({ filter, setFilter, sortBy, setSortBy }) {
  return (
    <div className="flex flex-wrap gap-4 items-center mb-6">
      <div className="flex gap-3">
        {FILTER_BTNS.map(b => (
          <Pill key={b.value} active={filter === b.value} onClick={() => setFilter(b.value)} label={b.label} />
        ))}
      </div>
      <div className="flex items-center gap-3 ml-auto">
        <span className="text-[8px] text-dim">SORT:</span>
        {SORT_BTNS.map(b => (
          <Pill key={b.value} active={sortBy === b.value} onClick={() => setSortBy(b.value)} label={b.label} />
        ))}
      </div>
    </div>
  )
}
