import React from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, BarChart, Bar,
} from 'recharts'

const C = {
  pulse:  '#00ff41',
  hazard: '#ff2a6d',
  cyan:   '#05d9e8',
  amber:  '#ffd700',
  dim:    '#666688',
  cosmos: '#0d0d1a',
}

const axisStyle = { fill: C.dim, fontSize: 8, fontFamily: '"Press Start 2P"' }
const gridStyle = { stroke: 'rgba(255,255,255,0.05)', strokeDasharray: '4 4' }
const ttStyle   = {
  background: C.cosmos,
  border: `2px solid ${C.dim}`,
  fontFamily: '"Press Start 2P"',
  fontSize: 8,
  boxShadow: `3px 3px 0 ${C.dim}`,
}

function SkeletonChart() {
  return <div className="skeleton" style={{ height: 240 }} />
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center text-dim text-[8px]" style={{ height: 240 }}>
      [ NO DATA ]
    </div>
  )
}

function Legend() {
  return (
    <div className="flex gap-6 mt-4 pt-3 border-t-2 border-dim/20">
      <span className="flex items-center gap-2 text-[8px] text-dim">
        <span className="w-3 h-3 inline-block flex-shrink-0" style={{ background: C.pulse }} />
        SAFE
      </span>
      <span className="flex items-center gap-2 text-[8px] text-dim">
        <span className="w-3 h-3 inline-block flex-shrink-0" style={{ background: C.hazard }} />
        PHO
      </span>
    </div>
  )
}

function ScatterDistance({ data }) {
  const points = data.map(a => ({
    name: a.name,
    date: new Date(a.close_approach_date + 'T00:00:00').getTime(),
    dateLabel: new Date(a.close_approach_date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short' }),
    distance: Math.round(a.miss_distance_km),
    velocity: Math.round(a.velocity_kmh),
    hazardous: a.is_potentially_hazardous,
  }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <ScatterChart>
        <CartesianGrid {...gridStyle} />
        <XAxis
          dataKey="date" type="number" domain={['auto', 'auto']}
          tickFormatter={v => new Date(v).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })}
          tick={axisStyle} axisLine={{ stroke: C.dim }} tickLine={false}
        />
        <YAxis
          dataKey="distance" tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`}
          tick={axisStyle} axisLine={{ stroke: C.dim }} tickLine={false} width={55}
        />
        <Tooltip
          cursor={false}
          content={({ payload }) => {
            if (!payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div style={{ ...ttStyle, padding: '10px 12px', minWidth: 170 }}>
                <div style={{ color: d?.hazardous ? C.hazard : C.pulse, marginBottom: 8 }}>
                  {d?.hazardous ? '!! PHO' : '>> SAFE'}
                </div>
                <div style={{ color: C.dim, marginBottom: 4, fontSize: 7 }}>{d?.name}</div>
                <div style={{ color: C.cyan,  marginBottom: 2 }}>DATE: {d?.dateLabel}</div>
                <div style={{ color: C.amber, marginBottom: 2 }}>DIST: {d?.distance?.toLocaleString('it-IT')} km</div>
                <div style={{ color: '#c0c0d0' }}>SPD:  {d?.velocity?.toLocaleString('it-IT')} km/h</div>
              </div>
            )
          }}
        />
        <Scatter data={points} isAnimationActive={false}>
          {points.map((p, i) => (
            <Cell key={i} fill={p.hazardous ? C.hazard : C.pulse} fillOpacity={0.9} r={5} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  )
}

function DiameterBar({ data }) {
  const top20 = [...data]
    .sort((a, b) => b.diameter_avg_m - a.diameter_avg_m)
    .slice(0, 20)
    .map(a => ({
      fullName: a.name,
      name: a.name.replace(/[()]/g, '').trim().split(' ').slice(-1)[0],
      diameter: Math.round(a.diameter_avg_m),
      diamMin: (a.diameter_min_km * 1000).toFixed(0),
      diamMax: (a.diameter_max_km * 1000).toFixed(0),
      hazardous: a.is_potentially_hazardous,
      date: a.close_approach_date,
    }))

  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={top20} barCategoryGap="20%">
        <CartesianGrid {...gridStyle} vertical={false} />
        <XAxis
          dataKey="name" tick={{ ...axisStyle, fontSize: 7 }}
          axisLine={{ stroke: C.dim }} tickLine={false}
          angle={-45} textAnchor="end" interval={0} height={50}
        />
        <YAxis
          tickFormatter={v => `${v}m`} tick={axisStyle}
          axisLine={{ stroke: C.dim }} tickLine={false} width={50}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.03)' }}
          content={({ payload }) => {
            if (!payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div style={{ ...ttStyle, padding: '10px 12px', minWidth: 180 }}>
                <div style={{ color: d?.hazardous ? C.hazard : C.pulse, marginBottom: 8 }}>
                  {d?.hazardous ? '!! PHO' : '>> SAFE'}
                </div>
                <div style={{ color: C.dim, marginBottom: 6, fontSize: 7 }}>{d?.fullName}</div>
                <div style={{ color: C.pulse, marginBottom: 2 }}>AVG: {d?.diameter} m</div>
                <div style={{ color: C.dim,   marginBottom: 2, fontSize: 7 }}>MIN: {d?.diamMin} m</div>
                <div style={{ color: C.dim,   marginBottom: 4, fontSize: 7 }}>MAX: {d?.diamMax} m</div>
                <div style={{ color: C.cyan }}>DATE: {d?.date}</div>
              </div>
            )
          }}
        />
        <Bar dataKey="diameter" radius={0} isAnimationActive={false}>
          {top20.map((e, i) => (
            <Cell key={i} fill={e.hazardous ? C.hazard : C.pulse} fillOpacity={0.85} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

export default function Charts({ data, isLoading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <div className="px-border px-border-cyan bg-cosmos p-6">
        <div className="text-[8px] text-cyan mb-1">▶ MISS DISTANCE OVER TIME</div>
        <div className="text-[7px] text-dim mb-5 leading-5">
          Ogni punto = asteroide. Asse Y = km dalla Terra.
        </div>
        {isLoading ? <SkeletonChart /> : !data?.length ? <EmptyChart /> : <ScatterDistance data={data} />}
        {!isLoading && data?.length > 0 && <Legend />}
      </div>
      <div className="px-border px-border-amber bg-cosmos p-6">
        <div className="text-[8px] text-amber mb-1">▶ TOP 20 BY DIAMETER</div>
        <div className="text-[7px] text-dim mb-5 leading-5">
          Diametro medio stimato. Hover per min/max e data.
        </div>
        {isLoading ? <SkeletonChart /> : !data?.length ? <EmptyChart /> : <DiameterBar data={data} />}
        {!isLoading && data?.length > 0 && <Legend />}
      </div>
    </div>
  )
}
