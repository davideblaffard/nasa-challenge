import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchNeo } from '../api'

function StatBox({ label, value, color = 'text-silver' }) {
  return (
    <div className="px-border px-border-dim bg-void p-4">
      <div className="text-[7px] text-dim mb-2 leading-5">{label}</div>
      <div className={`text-sm ${color} leading-none`}>{value}</div>
    </div>
  )
}

function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-8 w-2/3" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-16" />)}
      </div>
      <div className="skeleton h-48" />
      <div className="skeleton h-36" />
    </div>
  )
}

export default function AsteroidDetail() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['neo', id],
    queryFn: () => fetchNeo(id),
  })

  const back = (
    <Link to="/" className="text-[8px] text-dim hover:text-cyan block mb-8 leading-6"
      style={{ transition: 'none' }}>
      ◀ BACK TO DASHBOARD
    </Link>
  )

  if (isLoading) return <div>{back}<SkeletonDetail /></div>
  if (isError) return (
    <div>
      {back}
      <div className="px-border px-border-red bg-hazard/10 p-5 text-hazard text-[8px] leading-6">
        ▶ {error.message}
      </div>
    </div>
  )

  const neo = data.data
  const isHazardous = neo.is_potentially_hazardous_asteroid
  const diam = neo.estimated_diameter?.kilometers
  const avgM = diam
    ? Math.round((diam.estimated_diameter_min + diam.estimated_diameter_max) / 2 * 1000)
    : null

  const approaches = [...(neo.close_approach_data || [])].sort(
    (a, b) => new Date(b.close_approach_date) - new Date(a.close_approach_date)
  )
  const orbital = neo.orbital_data || {}

  const orbitalFields = [
    ['SEMI-MAJOR AXIS', orbital.semi_major_axis, 'AU'],
    ['ECCENTRICITY',    orbital.eccentricity, ''],
    ['INCLINATION',     orbital.inclination, 'deg'],
    ['ORBITAL PERIOD',  orbital.orbital_period, 'days'],
    ['PERIHELION',      orbital.perihelion_distance, 'AU'],
    ['APHELION',        orbital.aphelion_distance, 'AU'],
  ]

  return (
    <div>
      {back}

      {/* Header */}
      <div className={`px-border ${isHazardous ? 'px-border-red' : 'px-border-green'} bg-cosmos p-6 mb-6`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-[7px] text-dim mb-3 leading-5">ID #{id}</div>
            <h1 className="text-silver text-sm leading-loose">{neo.name}</h1>
          </div>
          <div className={`px-border ${isHazardous ? 'px-border-red text-hazard animate-pixel-pulse' : 'px-border-green text-pulse'} text-[8px] px-3 py-2 ml-4 flex-shrink-0`}>
            {isHazardous ? '!! PHO' : '>> SAFE'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatBox label="AVG DIAMETER"     value={avgM != null ? `${avgM.toLocaleString('it-IT')} m` : 'N/D'} color="text-pulse" />
          <StatBox label="ABS MAGNITUDE"    value={neo.absolute_magnitude_h?.toFixed(1) ?? 'N/D'} color="text-purple" />
          <StatBox label="CLOSE APPROACHES" value={approaches.length} color="text-cyan" />
          <StatBox label="ORBITS"           value={orbital.orbiting_body ?? 'N/D'} color="text-amber" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main */}
        <div className="lg:col-span-2 space-y-6">
          {/* Close approaches */}
          <div className="px-border px-border-dim bg-cosmos overflow-hidden">
            <div className="px-4 py-3 border-b-2 border-dim/30 text-[8px] text-cyan">
              ▶ CLOSE APPROACH HISTORY ({approaches.length})
            </div>
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-[8px]">
                <thead className="sticky top-0 bg-cosmos">
                  <tr className="border-b-2 border-dim/30">
                    <th className="text-left px-4 py-3 text-dim">DATE</th>
                    <th className="text-right px-4 py-3 text-dim">DIST (km)</th>
                    <th className="text-right px-4 py-3 text-dim">SPEED (km/h)</th>
                    <th className="text-left px-4 py-3 text-dim">BODY</th>
                  </tr>
                </thead>
                <tbody>
                  {approaches.map((ca, i) => (
                    <tr key={i} className="border-b-2 border-dim/10 hover:bg-dim/10">
                      <td className="px-4 py-3 text-cyan">{ca.close_approach_date}</td>
                      <td className="px-4 py-3 text-right text-orange">
                        {Math.round(parseFloat(ca.miss_distance?.kilometers || 0)).toLocaleString('it-IT')}
                      </td>
                      <td className="px-4 py-3 text-right text-amber">
                        {Math.round(parseFloat(ca.relative_velocity?.kilometers_per_hour || 0)).toLocaleString('it-IT')}
                      </td>
                      <td className="px-4 py-3 text-dim">{ca.orbiting_body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Orbital data */}
          {Object.keys(orbital).length > 0 && (
            <div className="px-border px-border-purple bg-cosmos p-6">
              <div className="text-[8px] text-purple mb-4">▶ ORBITAL DATA</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orbitalFields.map(([label, val, unit]) => (
                  <div key={label} className="px-border px-border-dim bg-void p-3">
                    <div className="text-[7px] text-dim mb-2 leading-5">{label}</div>
                    <div className="text-[8px] text-silver">
                      {val != null ? `${parseFloat(val).toFixed(4)} ${unit}`.trim() : 'N/D'}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="px-border px-border-dim bg-cosmos p-5">
            <div className="text-[8px] text-dim mb-4">▶ ESTIMATED DIAMETER</div>
            <div className="space-y-3">
              {['kilometers', 'meters', 'miles', 'feet'].map(unit => {
                const d = neo.estimated_diameter?.[unit]
                if (!d) return null
                return (
                  <div key={unit} className="border-b-2 border-dim/20 pb-3 last:border-0">
                    <div className="text-[7px] text-dim mb-1 uppercase">{unit}</div>
                    <div className="text-[8px] text-silver">
                      {d.estimated_diameter_min?.toFixed(3)} – {d.estimated_diameter_max?.toFixed(3)}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {neo.nasa_jpl_url && (
            <a href={neo.nasa_jpl_url} target="_blank" rel="noopener noreferrer"
              className="block px-border px-border-green bg-cosmos p-5 text-center hover:bg-pulse/10"
              style={{ transition: 'none' }}>
              <div className="text-pulse text-[8px] mb-1">▶ NASA JPL</div>
              <div className="text-dim text-[7px] leading-5">Scheda tecnica completa</div>
            </a>
          )}

          {neo.links?.self && (
            <a href={neo.links.self} target="_blank" rel="noopener noreferrer"
              className="block px-border px-border-dim bg-cosmos p-5 text-center hover:bg-dim/10"
              style={{ transition: 'none' }}>
              <div className="text-dim text-[8px] mb-1">▶ RAW JSON</div>
              <div className="text-dim text-[7px] leading-5">NASA API data</div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
