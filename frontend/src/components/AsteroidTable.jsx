import React from 'react'
import { useNavigate } from 'react-router-dom'
import Tooltip from './Tooltip'

const COL_TIPS = {
  NOME: 'Designazione ufficiale NASA. Clicca per scheda completa.',
  DATA: 'Data del close approach — passaggio più vicino alla Terra nel range selezionato.',
  'DIAMETRO (m)': 'Diametro medio stimato in metri (media tra min e max NASA).',
  'VELOCITÀ (km/h)': 'Velocità relativa al momento del close approach.',
  'DISTANZA (km)': 'Miss distance — distanza minima dalla Terra durante il passaggio.',
  PERICOLO: 'PHO = Potentially Hazardous Object. NASA classifica PHO gli asteroidi con diametro >140m e miss distance <0.05 AU (~7.5M km).',
}

function SkeletonRow() {
  return (
    <tr className="border-b border-white/5">
      {[100, 70, 55, 65, 65, 45].map((w, i) => (
        <td key={i} className="px-6 py-4">
          <div className={`skeleton h-4 rounded`} style={{ width: `${w}%` }} />
        </td>
      ))}
    </tr>
  )
}

export default function AsteroidTable({ asteroids, isLoading }) {
  const navigate = useNavigate()

  if (!isLoading && asteroids.length === 0) {
    return (
      <div className="text-center py-24 text-dim">
        <div className="font-display text-5xl text-white/10 mb-4">NO DATA</div>
        <p className="text-sm tracking-widest">Nessun asteroide trovato nel range selezionato.</p>
      </div>
    )
  }

  return (
    <div className="bg-nebula border border-white/10 rounded overflow-hidden">
      <div className="px-6 py-4 border-b border-white/10 text-xs text-dim tracking-widest">
        LISTA ASTEROIDI
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm font-mono">
          <thead>
            <tr className="border-b border-white/5">
              {[
                ['NOME', 'text-left'],
                ['DATA', 'text-left'],
                ['DIAMETRO (m)', 'text-right'],
                ['VELOCITÀ (km/h)', 'text-right'],
                ['DISTANZA (km)', 'text-right'],
                ['PERICOLO', 'text-center'],
              ].map(([label, align]) => (
                <th key={label} className={`${align} px-6 py-3 text-dim text-xs tracking-widest`}>
                  <Tooltip content={COL_TIPS[label]} position="bottom">
                    <span className="border-b border-dotted border-dim/40 cursor-help pb-px">
                      {label}
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
                    className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                    onClick={() => navigate(`/asteroid/${a.nasa_id}`)}
                  >
                    <td className="px-6 py-4">
                      <span className="text-white">{a.name}</span>
                      <span className="text-dim text-xs ml-2">#{a.nasa_id}</span>
                    </td>
                    <td className="px-6 py-4 text-dim">{a.close_approach_date}</td>
                    <td className="px-6 py-4 text-right text-white">
                      {Math.round(a.diameter_avg_m).toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {Math.round(a.velocity_kmh).toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 text-right text-white">
                      {Math.round(a.miss_distance_km).toLocaleString('it-IT')}
                    </td>
                    <td className="px-6 py-4 text-center">
                      {a.is_potentially_hazardous ? (
                        <Tooltip content="Potentially Hazardous Object — diametro >140m, distanza <7.5M km" position="left">
                          <span className="inline-block px-2 py-1 text-xs bg-hazard/20 text-hazard border border-hazard/40 rounded tracking-widest cursor-help">
                            PHO
                          </span>
                        </Tooltip>
                      ) : (
                        <Tooltip content="Non classificato come pericoloso da NASA" position="left">
                          <span className="inline-block px-2 py-1 text-xs bg-pulse/10 text-pulse border border-pulse/30 rounded tracking-widest cursor-help">
                            SAFE
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
