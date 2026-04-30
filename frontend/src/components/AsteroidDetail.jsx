import React from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { fetchNeo } from '../api'

function StatCard({ label, value, sub }) {
  return (
    <div className="bg-void/60 rounded p-4">
      <div className="text-dim text-xs tracking-widest mb-1">{label}</div>
      <div className="text-white font-display text-3xl">{value}</div>
      {sub && <div className="text-dim text-xs mt-1">{sub}</div>}
    </div>
  )
}

function SkeletonDetail() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-16 rounded w-2/3" />
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {Array.from({ length: 4 }, (_, i) => <div key={i} className="skeleton h-20 rounded" />)}
      </div>
      <div className="skeleton h-64 rounded" />
      <div className="skeleton h-48 rounded" />
    </div>
  )
}

export default function AsteroidDetail() {
  const { id } = useParams()
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ['neo', id],
    queryFn: () => fetchNeo(id),
  })

  const backLink = (
    <Link to="/" className="text-dim text-xs tracking-widest hover:text-pulse transition-colors block mb-6">
      ← TORNA ALLA DASHBOARD
    </Link>
  )

  if (isLoading) return <div>{backLink}<SkeletonDetail /></div>

  if (isError) return (
    <div>
      {backLink}
      <div className="border border-hazard/50 bg-hazard/10 rounded px-5 py-4 text-hazard text-sm font-mono">
        ⚠ {error.message}
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
    ['SEMI-ASSE MAGGIORE', orbital.semi_major_axis, 'AU'],
    ['ECCENTRICITÀ', orbital.eccentricity, ''],
    ['INCLINAZIONE', orbital.inclination, '°'],
    ['PERIODO ORBITALE', orbital.orbital_period, 'gg'],
    ['PERIELION', orbital.perihelion_distance, 'AU'],
    ['APELION', orbital.aphelion_distance, 'AU'],
  ]

  const diamUnits = ['kilometers', 'meters', 'miles', 'feet']

  return (
    <div>
      {backLink}

      {/* Header card */}
      <div className={`bg-nebula border rounded p-8 mb-6 ${isHazardous ? 'border-hazard/40 glow-hazard' : 'border-white/10'}`}>
        <div className="flex items-start justify-between mb-6">
          <div>
            <div className="text-dim text-xs tracking-widest mb-2">IDENTIFICATIVO #{id}</div>
            <h1 className="font-display text-4xl sm:text-5xl text-white leading-none">{neo.name}</h1>
          </div>
          <div className={`border rounded px-4 py-2 text-xs font-mono tracking-widest shrink-0 ml-4 ${
            isHazardous
              ? 'border-hazard/60 bg-hazard/15 text-hazard animate-pulse'
              : 'border-pulse/40 bg-pulse/10 text-pulse'
          }`}>
            {isHazardous ? '⚠ PHO' : '✓ SICURO'}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="DIAMETRO MEDIO" value={avgM != null ? `${avgM.toLocaleString('it-IT')} m` : 'N/D'} />
          <StatCard label="MAGNITUDINE ASS." value={neo.absolute_magnitude_h?.toFixed(1) ?? 'N/D'} />
          <StatCard label="CLOSE APPROACHES" value={approaches.length} />
          <StatCard label="ORBITA ATTORNO A" value={orbital.orbiting_body ?? 'N/D'} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main: close approaches + orbital data */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-nebula border border-white/10 rounded overflow-hidden">
            <div className="px-6 py-4 border-b border-white/10 text-xs text-dim tracking-widest">
              CLOSE APPROACH STORICI ({approaches.length})
            </div>
            <div className="overflow-x-auto max-h-72 overflow-y-auto">
              <table className="w-full text-sm font-mono">
                <thead className="sticky top-0 bg-nebula z-10">
                  <tr className="border-b border-white/5">
                    <th className="text-left px-6 py-3 text-dim text-xs tracking-widest">DATA</th>
                    <th className="text-right px-6 py-3 text-dim text-xs tracking-widest">DISTANZA (km)</th>
                    <th className="text-right px-6 py-3 text-dim text-xs tracking-widest">VELOCITÀ (km/h)</th>
                    <th className="text-left px-6 py-3 text-dim text-xs tracking-widest">CORPO</th>
                  </tr>
                </thead>
                <tbody>
                  {approaches.map((ca, i) => (
                    <tr key={i} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-3 text-dim">{ca.close_approach_date}</td>
                      <td className="px-6 py-3 text-right text-white">
                        {Math.round(parseFloat(ca.miss_distance?.kilometers || 0)).toLocaleString('it-IT')}
                      </td>
                      <td className="px-6 py-3 text-right text-white">
                        {Math.round(parseFloat(ca.relative_velocity?.kilometers_per_hour || 0)).toLocaleString('it-IT')}
                      </td>
                      <td className="px-6 py-3 text-dim">{ca.orbiting_body}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {Object.keys(orbital).length > 0 && (
            <div className="bg-nebula border border-white/10 rounded p-6">
              <div className="text-xs text-dim tracking-widest mb-4">DATI ORBITALI</div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {orbitalFields.map(([label, val, unit]) => (
                  <div key={label} className="bg-void/60 rounded p-3">
                    <div className="text-dim text-xs tracking-widest mb-1">{label}</div>
                    <div className="text-white font-mono text-sm">
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
          <div className="bg-nebula border border-white/10 rounded p-6">
            <div className="text-dim text-xs tracking-widest mb-4">DIAMETRO STIMATO</div>
            <div className="space-y-2">
              {diamUnits.map(unit => {
                const d = neo.estimated_diameter?.[unit]
                if (!d) return null
                return (
                  <div key={unit} className="flex justify-between border-b border-white/5 pb-2 last:border-0">
                    <span className="text-dim text-xs uppercase tracking-widest">{unit}</span>
                    <span className="text-white font-mono text-xs">
                      {d.estimated_diameter_min?.toFixed(3)} – {d.estimated_diameter_max?.toFixed(3)}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>

          {neo.nasa_jpl_url && (
            <a
              href={neo.nasa_jpl_url}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-nebula border border-pulse/30 rounded p-5 text-center hover:border-pulse/60 hover:glow-pulse transition-all group"
            >
              <div className="text-pulse text-xs tracking-widest mb-1 group-hover:text-white transition-colors">
                ↗ NASA JPL
              </div>
              <div className="text-dim text-xs">Scheda tecnica completa</div>
            </a>
          )}

          {neo.links?.self && (
            <a
              href={neo.links.self}
              target="_blank"
              rel="noopener noreferrer"
              className="block bg-nebula border border-white/10 rounded p-5 text-center hover:border-white/30 transition-all"
            >
              <div className="text-dim text-xs tracking-widest mb-1">↗ NASA API JSON</div>
              <div className="text-dim text-xs">Dati grezzi</div>
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
