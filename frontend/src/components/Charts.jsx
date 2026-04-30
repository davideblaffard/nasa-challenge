import React from 'react'
import {
  ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, BarChart, Bar,
} from 'recharts'

const PULSE = '#00ff88'
const HAZARD = '#ff3366'
const DIM = '#8888aa'

const axisStyle = { fill: DIM, fontSize: 10, fontFamily: 'Space Mono' }
const gridStyle = { stroke: 'rgba(255,255,255,0.05)' }
const tooltipStyle = {
  background: '#12121e',
  border: '1px solid rgba(255,255,255,0.1)',
  fontFamily: 'Space Mono',
  fontSize: 11,
}

function SkeletonChart() {
  return <div className="skeleton rounded" style={{ height: 250 }} />
}

function EmptyChart() {
  return (
    <div className="flex items-center justify-center text-dim text-xs tracking-widest" style={{ height: 250 }}>
      NO DATA
    </div>
  )
}

function ScatterDistance({ data }) {
  const points = data.map(a => ({
    name: a.name,
    date: new Date(a.close_approach_date + 'T00:00:00').getTime(),
    dateLabel: new Date(a.close_approach_date + 'T00:00:00').toLocaleDateString('it-IT', { day: '2-digit', month: 'short', year: 'numeric' }),
    distance: Math.round(a.miss_distance_km),
    velocity: Math.round(a.velocity_kmh),
    hazardous: a.is_potentially_hazardous,
  }))

  return (
    <ResponsiveContainer width="100%" height={250}>
      <ScatterChart>
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} />
        <XAxis
          dataKey="date"
          type="number"
          domain={['auto', 'auto']}
          tickFormatter={v =>
            new Date(v).toLocaleDateString('it-IT', { month: 'short', day: 'numeric' })
          }
          tick={axisStyle}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          label={{ value: 'DATA', position: 'insideBottomRight', offset: -5, fill: DIM, fontSize: 9, fontFamily: 'Space Mono' }}
        />
        <YAxis
          dataKey="distance"
          tickFormatter={v => `${(v / 1_000_000).toFixed(1)}M`}
          tick={axisStyle}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          width={50}
          label={{ value: 'km', angle: -90, position: 'insideLeft', offset: 10, fill: DIM, fontSize: 9, fontFamily: 'Space Mono' }}
        />
        <Tooltip
          cursor={{ strokeDasharray: '3 3', stroke: 'rgba(255,255,255,0.1)' }}
          content={({ payload }) => {
            if (!payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div style={{ ...tooltipStyle, padding: '10px 14px', minWidth: 180 }}>
                <div style={{ color: d?.hazardous ? HAZARD : PULSE, fontWeight: 700, marginBottom: 6, fontSize: 11 }}>
                  {d?.hazardous ? '⚠ PHO' : '✓ SICURO'}
                </div>
                <div style={{ color: '#fff', marginBottom: 4, fontSize: 11 }}>{d?.name}</div>
                <div style={{ color: DIM, fontSize: 10, marginBottom: 2 }}>📅 {d?.dateLabel}</div>
                <div style={{ color: DIM, fontSize: 10, marginBottom: 2 }}>📍 {d?.distance?.toLocaleString('it-IT')} km</div>
                <div style={{ color: DIM, fontSize: 10 }}>💨 {d?.velocity?.toLocaleString('it-IT')} km/h</div>
              </div>
            )
          }}
        />
        <Scatter data={points} isAnimationActive={false}>
          {points.map((p, i) => (
            <Cell key={i} fill={p.hazardous ? HAZARD : PULSE} fillOpacity={0.85} r={5} />
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
    <ResponsiveContainer width="100%" height={250}>
      <BarChart data={top20} barCategoryGap="20%">
        <CartesianGrid strokeDasharray="3 3" {...gridStyle} vertical={false} />
        <XAxis
          dataKey="name"
          tick={{ ...axisStyle, fontSize: 9 }}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          angle={-45}
          textAnchor="end"
          interval={0}
          height={50}
        />
        <YAxis
          tickFormatter={v => `${v}m`}
          tick={axisStyle}
          axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
          tickLine={false}
          width={50}
          label={{ value: 'm', angle: -90, position: 'insideLeft', offset: 10, fill: DIM, fontSize: 9, fontFamily: 'Space Mono' }}
        />
        <Tooltip
          cursor={{ fill: 'rgba(255,255,255,0.04)' }}
          content={({ payload }) => {
            if (!payload?.length) return null
            const d = payload[0]?.payload
            return (
              <div style={{ ...tooltipStyle, padding: '10px 14px', minWidth: 190 }}>
                <div style={{ color: d?.hazardous ? HAZARD : PULSE, fontWeight: 700, marginBottom: 6, fontSize: 11 }}>
                  {d?.hazardous ? '⚠ PHO' : '✓ SICURO'}
                </div>
                <div style={{ color: '#fff', marginBottom: 4, fontSize: 11 }}>{d?.fullName}</div>
                <div style={{ color: DIM, fontSize: 10, marginBottom: 2 }}>📐 Medio: {d?.diameter} m</div>
                <div style={{ color: DIM, fontSize: 10, marginBottom: 2 }}>↕ Range: {d?.diamMin}–{d?.diamMax} m</div>
                <div style={{ color: DIM, fontSize: 10 }}>📅 {d?.date}</div>
              </div>
            )
          }}
        />
        <Bar dataKey="diameter" radius={[3, 3, 0, 0]} isAnimationActive={false}>
          {top20.map((e, i) => (
            <Cell key={i} fill={e.hazardous ? HAZARD : PULSE} fillOpacity={0.8} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  )
}

function ChartLegend() {
  return (
    <div className="flex items-center gap-5 mt-4 pt-3 border-t border-white/5">
      <span className="flex items-center gap-2 text-xs text-dim font-mono">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: PULSE }} />
        SICURO
      </span>
      <span className="flex items-center gap-2 text-xs text-dim font-mono">
        <span className="w-3 h-3 rounded-full flex-shrink-0" style={{ background: HAZARD }} />
        PHO — Potentially Hazardous Object
      </span>
    </div>
  )
}

export default function Charts({ data, isLoading }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
      <div className="bg-nebula border border-white/10 rounded p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="text-xs text-dim tracking-widest">DISTANZA DI AVVICINAMENTO</div>
        </div>
        <div className="text-dim text-xs mb-5" style={{ fontSize: 10 }}>
          Ogni punto = un asteroide. Asse Y = distanza dalla Terra al momento del passaggio.
        </div>
        {isLoading ? <SkeletonChart /> : !data?.length ? <EmptyChart /> : <ScatterDistance data={data} />}
        {!isLoading && data?.length > 0 && <ChartLegend />}
      </div>
      <div className="bg-nebula border border-white/10 rounded p-6">
        <div className="flex items-start justify-between mb-1">
          <div className="text-xs text-dim tracking-widest">TOP 20 PER DIAMETRO STIMATO</div>
        </div>
        <div className="text-dim text-xs mb-5" style={{ fontSize: 10 }}>
          Diametro medio stimato in metri. Hover per range min/max e data di avvicinamento.
        </div>
        {isLoading ? <SkeletonChart /> : !data?.length ? <EmptyChart /> : <DiameterBar data={data} />}
        {!isLoading && data?.length > 0 && <ChartLegend />}
      </div>
    </div>
  )
}
