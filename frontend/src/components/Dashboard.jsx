import React, { useState, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { fetchFeed } from '../api'
import FilterBar from './FilterBar'
import AsteroidTable from './AsteroidTable'
import Charts from './Charts'
import ErrorBanner from './ErrorBanner'
import Tooltip from './Tooltip'

function isoToday() {
  return new Date().toISOString().split('T')[0]
}

function isoDaysAgo(n) {
  const d = new Date()
  d.setDate(d.getDate() - n)
  return d.toISOString().split('T')[0]
}

export default function Dashboard() {
  const [startDate, setStartDate] = useState(isoDaysAgo(6))
  const [endDate, setEndDate] = useState(isoToday())
  const [pendingStart, setPendingStart] = useState(isoDaysAgo(6))
  const [pendingEnd, setPendingEnd] = useState(isoToday())
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['feed', startDate, endDate],
    queryFn: () => fetchFeed(startDate, endDate),
  })

  const filtered = useMemo(() => {
    if (!data) return []
    let arr = [...data]
    if (filter === 'hazardous') arr = arr.filter(a => a.is_potentially_hazardous)
    if (filter === 'safe') arr = arr.filter(a => !a.is_potentially_hazardous)
    if (sortBy === 'distance') arr.sort((a, b) => a.miss_distance_km - b.miss_distance_km)
    if (sortBy === 'diameter') arr.sort((a, b) => b.diameter_avg_m - a.diameter_avg_m)
    return arr
  }, [data, filter, sortBy])

  function handleSearch(e) {
    e.preventDefault()
    setStartDate(pendingStart)
    setEndDate(pendingEnd)
  }

  const total = data?.length ?? 0
  const hazardousCount = data?.filter(a => a.is_potentially_hazardous).length ?? 0

  return (
    <div>
      <div className="mb-10">
        <h1 className="font-display text-6xl sm:text-8xl text-white tracking-widest leading-none">
          NEAR EARTH<br />
          <span className="text-pulse">OBJECTS</span>
        </h1>
        <p className="text-dim text-sm mt-3 tracking-widest">MONITORAGGIO ASTEROIDI IN TEMPO REALE</p>
      </div>

      <form onSubmit={handleSearch} className="mb-10">
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-xs text-dim tracking-widest mb-2">DATA INIZIO</label>
            <input
              type="date"
              value={pendingStart}
              onChange={e => setPendingStart(e.target.value)}
              className="bg-nebula border border-white/10 text-white text-sm font-mono px-4 py-2 rounded focus:outline-none focus:border-pulse/60 focus:ring-1 focus:ring-pulse/30 transition-all"
            />
          </div>
          <div>
            <label className="block text-xs text-dim tracking-widest mb-2">DATA FINE</label>
            <input
              type="date"
              value={pendingEnd}
              onChange={e => setPendingEnd(e.target.value)}
              className="bg-nebula border border-white/10 text-white text-sm font-mono px-4 py-2 rounded focus:outline-none focus:border-pulse/60 focus:ring-1 focus:ring-pulse/30 transition-all"
            />
          </div>
          <button
            type="submit"
            className="bg-pulse text-void font-mono text-sm font-bold px-6 py-2 rounded tracking-widest hover:bg-pulse/80 transition-all glow-pulse"
          >
            CERCA
          </button>
        </div>
      </form>

      {isError && <ErrorBanner message={error.message} />}

      {!isError && (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {[
              {
                label: 'TOTALE',
                value: total,
                color: 'text-white',
                border: 'border-white/10',
                tip: 'Numero di asteroidi con close approach nel range di date selezionato.',
              },
              {
                label: 'PERICOLOSI',
                value: hazardousCount,
                color: 'text-hazard',
                border: 'border-hazard/30',
                tip: 'PHO (Potentially Hazardous Objects): diametro stimato >140m e miss distance <0.05 AU dalla Terra.',
              },
              {
                label: 'SICURI',
                value: total - hazardousCount,
                color: 'text-pulse',
                border: 'border-white/10',
                tip: 'Asteroidi non classificati come PHO da NASA. Possono comunque avvicinarsi notevolmente.',
              },
              {
                label: 'MOSTRATI',
                value: filtered.length,
                color: 'text-white',
                border: 'border-white/10',
                tip: 'Asteroidi visibili dopo aver applicato i filtri attivi (tutti / PHO / sicuri).',
              },
            ].map(({ label, value, color, border, tip }) => (
              <div key={label} className={`bg-nebula border ${border} rounded p-5`}>
                <Tooltip content={tip} position="bottom">
                  <div className="text-dim text-xs tracking-widest mb-1 border-b border-dotted border-dim/40 pb-px cursor-help inline-block">
                    {label}
                  </div>
                </Tooltip>
                <div className={`font-display text-4xl ${color}`}>{isLoading ? '—' : value}</div>
              </div>
            ))}
          </div>

          <Charts data={data} isLoading={isLoading} />
          <FilterBar filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} />
          <AsteroidTable asteroids={filtered} isLoading={isLoading} />
        </>
      )}
    </div>
  )
}
