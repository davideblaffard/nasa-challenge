import React from 'react'
import { useNavigate } from 'react-router-dom'
import Tooltip from './Tooltip'

const COLS = [
  { label: 'NAME',        align: 'text-left',   tip: 'Designazione NASA. Click per scheda completa.' },
  { label: 'DATE',        align: 'text-left',   tip: 'Data close approach nel range selezionato.' },
  { label: 'DIAM (m)',    align: 'text-right',  tip: 'Diametro medio stimato in metri.' },
  { label: 'SPEED (km/h)', align: 'text-right', tip: 'Velocità relativa al close approach.' },
  { label: 'DIST (km)',   align: 'text-right',  tip: 'Miss distance — distanza minima dalla Terra.' },
  { label: 'STATUS',      align: 'text-center', tip: 'PHO = Potentially Hazardous Object (NASA): diametro >140m, dist <0.05 AU.' },
]

function SkeletonRow() {
  return (
    <tr className="border-b-2 border-dim/20">
      {[90, 70, 50, 60, 60, 40].map((w, i) => (
        <td key={i} className="px-4 py-3">
          <div className="skeleton h-3" style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AsteroidTable({ asteroids, isLoading }) {
  const navigate = useNavigate()

  if (!isLoading && asteroids.length === 0) {
    return (
      <div className="px-border px-border-dim bg-cosmos p-12 text-center">
        <div className="text-dim text-lg mb-4">[ NO DATA ]</div>
        <div className="text-[8px] text-dim leading-6">Nessun asteroide trovato.</div>
      </div>
    )
  }

  return (
    <div className="px-border px-border-dim bg-cosmos overflow-hidden">
      <div className="px-4 py-3 border-b-2 border-dim/30 text-[8px] text-dim">
        ▶ ASTEROID LIST
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-[8px]">
          <thead>
            <tr className="border-b-2 border-dim/30">
              {COLS.map(c => (
                <th key={c.label} className={`${c.align} px-4 py-3 text-dim`}>
                  <Tooltip content={c.tip} position="bottom">
                    <span className="border-b border-dotted border-dim/50 pb-px cursor-help">
                      {c.label}
                    </span>
                  </Tooltip>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {isLoading
              ? Array.from({ length: 8 }, (_, i) => <SkeletonRow key={i} />)
              : asteroids.map(a => (
                  <tr
                    key={a.nasa_id}
                    className="border-b-2 border-dim/10 hover:bg-dim/10 cursor-pointer"
                    style={{ transition: 'none' }}
                    onClick={() => navigate(`/asteroid/${a.nasa_id}`)}
                  >
                    <td className="px-4 py-3">
                      <span className="text-silver">{a.name}</span>
                    </td>
                    <td className="px-4 py-3 text-cyan">{a.close_approach_date}</td>
                    <td className="px-4 py-3 text-right text-pulse">
                      {Math.round(a.diameter_avg_m).toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-right text-amber">
                      {Math.round(a.velocity_kmh).toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-right text-orange">
                      {Math.round(a.miss_distance_km).toLocaleString('it-IT')}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {a.is_potentially_hazardous ? (
                        <Tooltip content="Potentially Hazardous Object — diam >140m, dist <7.5M km" position="left">
                          <span className="px-border px-border-red text-hazard text-[7px] px-2 py-1 cursor-help animate-pixel-pulse">
                            !! PHO
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Non classificato PHO da NASA" position="left">
                          <span className="px-border px-border-green text-pulse text-[7px] px-2 py-1 cursor-help">
                            OK
                          </span>
                        </Tooltip>
                      )}
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
