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

const STATS = [
  {
    key: 'total',
    label: 'TOTAL',
    color: 'text-silver',
    border: 'px-border-dim',
    tip: 'Asteroidi con close approach nel range selezionato.',
  },
  {
    key: 'hazardous',
    label: 'DANGER',
    color: 'text-hazard',
    border: 'px-border-red',
    tip: 'PHO: diametro >140m, miss distance <0.05 AU.',
  },
  {
    key: 'safe',
    label: 'SAFE',
    color: 'text-pulse',
    border: 'px-border-green',
    tip: 'Non classificati PHO da NASA.',
  },
  {
    key: 'shown',
    label: 'SHOWN',
    color: 'text-cyan',
    border: 'px-border-cyan',
    tip: 'Visibili dopo i filtri attivi.',
  },
]

export default function Dashboard() {
  const [startDate, setStartDate] = useState(isoDaysAgo(6))
  const [endDate, setEndDate] = useState(isoToday())
  const [pendingStart, setPendingStart] = useState(isoDaysAgo(6))
  const [pendingEnd, setPendingEnd] = useState(isoToday())
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('date')
  const [dateError, setDateError] = useState(null)

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['feed', startDate, endDate],
    queryFn: () => fetchFeed(startDate, endDate),
    enabled: !!startDate && !!endDate,
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
    const s = new Date(pendingStart)
    const en = new Date(pendingEnd)
    if (s > en) {
      setDateError('DATA INIZIO deve precedere DATA FINE.')
      return
    }
    const days = (en - s) / (1000 * 60 * 60 * 24)
    if (days > 365) {
      setDateError('Range massimo consentito: 365 giorni.')
      return
    }
    setDateError(null)
    setStartDate(pendingStart)
    setEndDate(pendingEnd)
  }

  const total = data?.length ?? 0
  const hazardousCount = data?.filter(a => a.is_potentially_hazardous).length ?? 0

  const statValues = {
    total: total,
    hazardous: hazardousCount,
    safe: total - hazardousCount,
    shown: filtered.length,
  }

  return (
    <div>
      {/* Title */}
      <div className="mb-10 pt-4">
        <h1 className="text-pulse text-xl sm:text-2xl leading-loose tracking-widest cursor">
          NEAR EARTH
        </h1>
        <h1 className="text-silver text-xl sm:text-2xl leading-loose tracking-widest mb-4">
          OBJECTS
        </h1>
        <div className="text-dim text-[8px] leading-6">ASTEROID MONITORING SYSTEM v2.0</div>
      </div>

      {/* Date picker */}
      <form onSubmit={handleSearch} className="mb-10">
        <div className="text-[8px] text-dim mb-4 leading-6">▶ SELECT DATE RANGE</div>
        <div className="flex flex-wrap gap-6 items-end">
          <div>
            <div className="text-[8px] text-cyan mb-2">FROM</div>
            <input
              type="date"
              value={pendingStart}
              onChange={e => setPendingStart(e.target.value)}
              className="bg-cosmos px-border px-border-cyan text-silver text-[8px] px-3 py-2 outline-none w-40"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <div>
            <div className="text-[8px] text-cyan mb-2">TO</div>
            <input
              type="date"
              value={pendingEnd}
              onChange={e => setPendingEnd(e.target.value)}
              className="bg-cosmos px-border px-border-cyan text-silver text-[8px] px-3 py-2 outline-none w-40"
              style={{ colorScheme: 'dark' }}
            />
          </div>
          <button
            type="submit"
            className="px-btn px-border-green text-pulse bg-void text-[8px] px-5 py-2"
          >
            ▶ SCAN
          </button>
        </div>
      </form>

      {dateError && <ErrorBanner message={dateError} />}
      {isError && <ErrorBanner message={error.message} />}

      {!isError && (
        <>
          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
            {STATS.map(s => (
              <div key={s.key} className={`px-border ${s.border} bg-cosmos p-4`}>
                <Tooltip content={s.tip} position="bottom">
                  <div className={`text-[8px] text-dim mb-3 border-b border-dotted border-dim/40 pb-1 cursor-help leading-5`}>
                    {s.label}
                  </div>
                </Tooltip>
                <div className={`text-2xl ${s.color} leading-none mt-2`}>
                  {isLoading ? '??' : statValues[s.key]}
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <Charts data={data} isLoading={isLoading} />

          {/* Table */}
          <FilterBar filter={filter} setFilter={setFilter} sortBy={sortBy} setSortBy={setSortBy} />
          <AsteroidTable asteroids={filtered} isLoading={isLoading} />
        </>
      )}
    </div>
  )
}
