import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'

const C = {
  bg: '#070f1a',
  fine: 'rgba(70,130,210,0.07)',
  coarse: 'rgba(70,130,210,0.14)',
  line: '#1e3d60',
  lineBright: '#3a6a9e',
  text: '#5a96c8',
  textBright: '#9ecae8',
  textDim: 'rgba(90,150,200,0.45)',
  white: '#ddeeff',
  accent: '#00b8d4',
  danger: '#ff4466',
  coin: '#ffd700',
  coinGlow: '#ff9500',
}

const BOOT_LINES = [
  '> INITIALIZING NASA NEO TRACKER v1.0...',
  '> CONNECTING TO RAILWAY POSTGRESQL...',
  '> DATABASE CONNECTION: OK',
  '> LOADING ASTEROID FEED MODULE...',
  '> NASA NEOWS API: ONLINE',
  '> RECHARTS RENDERER: READY',
  '> ALL SYSTEMS NOMINAL',
  '',
  '> LAUNCHING DASHBOARD...',
]

function useBreakpoint() {
  const get = () =>
    typeof window === 'undefined' ? 'desktop' :
    window.innerWidth < 640 ? 'mobile' :
    window.innerWidth < 1024 ? 'tablet' : 'desktop'
  const [bp, setBp] = useState(get)
  useEffect(() => {
    const h = () => setBp(get())
    window.addEventListener('resize', h)
    return () => window.removeEventListener('resize', h)
  }, [])
  return bp
}

function BootOverlay() {
  const [lines, setLines] = useState([])
  const [idx, setIdx] = useState(0)

  useEffect(() => {
    if (idx >= BOOT_LINES.length) return
    const t = setTimeout(() => {
      setLines(prev => [...prev, BOOT_LINES[idx]])
      setIdx(i => i + 1)
    }, idx === 0 ? 0 : 190)
    return () => clearTimeout(t)
  }, [idx])

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 200,
      backgroundColor: '#000',
      fontFamily: "'Press Start 2P', monospace",
      padding: '48px 56px',
      display: 'flex', flexDirection: 'column', justifyContent: 'center',
    }}>
      <div style={{ fontSize: '7px', color: C.textDim, marginBottom: 24, letterSpacing: '0.1em' }}>
        NASA NEO MONITOR — BOOT SEQUENCE
      </div>
      {lines.map((line, i) => (
        <div key={i} style={{
          color: line.startsWith('>') ? '#00ff41' : 'transparent',
          fontSize: '9px',
          lineHeight: '2.6',
          opacity: i < lines.length - 1 ? 0.65 : 1,
          letterSpacing: '0.03em',
        }}>
          {line || ' '}
        </div>
      ))}
      {idx < BOOT_LINES.length && (
        <div style={{ color: '#00ff41', fontSize: '9px', lineHeight: '2.6', animation: 'pixel-blink 0.8s steps(1) infinite' }}>
          █
        </div>
      )}
    </div>
  )
}

function CornerMark({ top, bottom, left, right }) {
  return (
    <div style={{
      position: 'absolute',
      ...(top != null ? { top } : {}),
      ...(bottom != null ? { bottom } : {}),
      ...(left != null ? { left } : {}),
      ...(right != null ? { right } : {}),
      width: 20, height: 20,
      color: C.lineBright, fontSize: '14px',
      lineHeight: 1, opacity: 0.7, userSelect: 'none',
      pointerEvents: 'none',
    }}>+</div>
  )
}

function DimBar({ width = '100%', height = 6, opacity = 0.45, color }) {
  return (
    <div style={{
      width, height,
      backgroundColor: color || C.lineBright,
      opacity, borderRadius: 1,
    }} />
  )
}

function Box({ style, callout, highlighted = false, children, ...handlers }) {
  return (
    <div style={{
      position: 'relative',
      cursor: 'crosshair',
      border: highlighted
        ? `2px solid ${C.accent}`
        : `1px dashed ${C.lineBright}`,
      backgroundColor: highlighted
        ? 'rgba(0,184,212,0.10)'
        : 'rgba(0,80,160,0.05)',
      boxShadow: highlighted
        ? `0 0 18px ${C.accent}55, inset 0 0 28px rgba(0,184,212,0.06)`
        : 'none',
      transition: 'border 0.14s, background-color 0.14s, box-shadow 0.14s',
      ...style,
    }} {...handlers}>
      {callout && (
        <div style={{
          position: 'absolute', top: -12, right: -12,
          width: 24, height: 24, borderRadius: '50%',
          border: highlighted ? `2px solid ${C.accent}` : `1px solid ${C.accent}`,
          backgroundColor: highlighted ? C.accent : C.bg,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: '7px', lineHeight: '1',
          color: highlighted ? C.bg : C.accent,
          fontFamily: "'Press Start 2P', monospace",
          zIndex: 2, flexShrink: 0,
          transition: 'background-color 0.14s, color 0.14s, border 0.14s',
        }}>{callout}</div>
      )}
      {children}
    </div>
  )
}

// ─── Schematic sections by breakpoint ──────────────────────────────────────

const HEIGHTS = {
  desktop: { h1: 50, h2: 60, h3: 72, h4: 120, h5: 44, h6: 108 },
  tablet:  { h1: 44, h2: 52, h3: 60, h4: 100, h5: 38, h6:  92 },
  mobile:  { h1: 36, h2: 44, h3: 50, h4:  80, h5: 32, h6:  76 },
}

function Schematic({ bp, hoveredSection, setHoveredSection }) {
  const hover = (section) => ({
    onPointerEnter: () => setHoveredSection(section),
    onPointerLeave: () => setHoveredSection(null),
  })
  const h = HEIGHTS[bp]
  const titleSize = bp === 'mobile' ? '13px' : bp === 'tablet' ? '16px' : '18px'
  const labelSize = bp === 'mobile' ? '4px' : '5px'

  return (
    <div style={{ flex: 2, minWidth: 0 }}>
      {/* Drawing title */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end',
        borderBottom: `1px solid ${C.line}`,
        paddingBottom: '14px', marginBottom: '20px',
      }}>
        <div>
          <div style={{ fontSize: titleSize, color: C.white, letterSpacing: '0.04em', marginBottom: 8 }}>
            NASA NEO MONITOR TUTORIAL
          </div>
          <div style={{ fontSize: bp === 'mobile' ? '4.5px' : '5.5px', color: C.textDim, letterSpacing: '0.1em' }}>
            {bp === 'mobile'
              ? 'NEAR-EARTH OBJECT SYSTEM'
              : 'NEAR-EARTH OBJECT TRACKING SYSTEM — UI SCHEMATIC'}
          </div>
        </div>
        {bp !== 'mobile' && (
          <div style={{ textAlign: 'right', fontSize: '5px', color: C.textDim, lineHeight: 2.2 }}>
            <div>SCALE: NTS</div>
            <div>DO NOT SCALE</div>
          </div>
        )}
      </div>

      {/* Dimension line */}
      {bp !== 'mobile' && (
        <div style={{
          display: 'flex', alignItems: 'center', marginBottom: 16,
          fontSize: '5px', color: C.textDim,
        }}>
          <div style={{ width: 6, height: 1, backgroundColor: C.textDim }} />
          <div style={{ flex: 1, height: 1, backgroundImage: `repeating-linear-gradient(to right, ${C.textDim} 0, ${C.textDim} 3px, transparent 3px, transparent 7px)` }} />
          <div style={{ padding: '0 8px', whiteSpace: 'nowrap' }}>— FULL VIEWPORT WIDTH —</div>
          <div style={{ flex: 1, height: 1, backgroundImage: `repeating-linear-gradient(to right, ${C.textDim} 0, ${C.textDim} 3px, transparent 3px, transparent 7px)` }} />
          <div style={{ width: 6, height: 1, backgroundColor: C.textDim }} />
        </div>
      )}

      {/* UI Mock */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

        {/* ① Header */}
        <Box callout="1" highlighted={hoveredSection === '①'}
          {...hover('①')}
          style={{ height: h.h1, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <div style={{ width: 10, height: 10, backgroundColor: C.danger, opacity: 0.8 }} />
            <DimBar width={90} height={7} opacity={0.7} />
          </div>
          <div style={{ flex: 1 }} />
          <DimBar width={44} height={6} opacity={0.35} />
          <DimBar width={44} height={6} opacity={0.35} />
          <DimBar width={44} height={6} opacity={0.35} />
        </Box>

        {/* ② Date range */}
        <Box callout="2" highlighted={hoveredSection === '②'}
          {...hover('②')}
          style={{ height: h.h2, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: '5px', color: C.textDim, marginRight: 4 }}>FROM</div>
          <div style={{ width: 72, height: 16, border: `1px dashed ${C.lineBright}`, opacity: 0.7, flexShrink: 0 }} />
          <div style={{ fontSize: '7px', color: C.textDim }}>→</div>
          <div style={{ fontSize: '5px', color: C.textDim, marginRight: 4 }}>TO</div>
          <div style={{ width: 72, height: 16, border: `1px dashed ${C.lineBright}`, opacity: 0.7, flexShrink: 0 }} />
          <div style={{ width: 52, height: 22, border: `1px solid ${C.accent}`, opacity: 0.7, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <DimBar width={28} height={5} opacity={0.7} />
          </div>
        </Box>

        {/* ③ Stat cards */}
        <div style={{ display: 'flex', gap: 4 }} {...hover('③')}>
          {[
            ['TOTAL NEO', C.accent],
            ['HAZARDOUS', C.danger],
            ['AVG DIA.', C.lineBright],
          ].map(([label, color], i) => (
            <Box key={i}
              callout={i === 0 ? '3' : undefined}
              highlighted={hoveredSection === '③'}
              style={{ flex: 1, height: h.h3, padding: '10px 12px', display: 'flex', flexDirection: 'column', gap: 6 }}>
              <DimBar width="55%" height={5} opacity={0.4} />
              <div style={{ width: '78%', height: 12, backgroundColor: color, opacity: 0.38 }} />
              <div style={{ fontSize: labelSize, color: C.textDim }}>{label}</div>
            </Box>
          ))}
        </div>

        {/* ④ Charts */}
        <div style={{ display: 'flex', gap: 4 }} {...hover('④')}>
          <Box callout="4" highlighted={hoveredSection === '④'}
            style={{ flex: 1, height: h.h4, padding: '8px 10px', position: 'relative' }}>
            <div style={{ fontSize: labelSize, color: C.textDim, marginBottom: 6 }}>SCATTER — DISTANCE vs SIZE</div>
            <div style={{ position: 'relative', height: `calc(100% - 18px)`, overflow: 'hidden' }}>
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, height: 1, backgroundColor: C.line }} />
              <div style={{ position: 'absolute', bottom: 0, left: 0, top: 0, width: 1, backgroundColor: C.line }} />
              {[
                [15,55], [28,30], [42,70], [55,20], [67,48],
                [80,62], [22,82], [48,15], [70,38], [35,52],
              ].map(([x, y], i) => (
                <div key={i} style={{
                  position: 'absolute',
                  left: `${x}%`, bottom: `${y}%`,
                  width: i % 3 === 0 ? 7 : 5,
                  height: i % 3 === 0 ? 7 : 5,
                  borderRadius: '50%',
                  backgroundColor: i % 3 === 0 ? C.danger : C.accent,
                  opacity: 0.75,
                  border: `1px solid ${i % 3 === 0 ? C.danger : C.accent}`,
                  transform: 'translate(-50%, 50%)',
                }} />
              ))}
            </div>
          </Box>
          <Box highlighted={hoveredSection === '④'}
            style={{ flex: 1, height: h.h4, padding: '8px 10px' }}>
            <div style={{ fontSize: labelSize, color: C.textDim, marginBottom: 6 }}>BAR — DAILY ASTEROID COUNT</div>
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 3, height: `calc(100% - 18px)`, paddingBottom: 1 }}>
              {[55, 72, 38, 90, 48, 65, 80].map((hh, i) => (
                <div key={i} style={{
                  flex: 1, height: `${hh}%`,
                  backgroundColor: C.accent, opacity: 0.38,
                  border: `1px solid ${C.accent}`,
                }} />
              ))}
            </div>
          </Box>
        </div>

        {/* ⑤ Filter bar */}
        <Box callout="5" highlighted={hoveredSection === '⑤'}
          {...hover('⑤')}
          style={{ height: h.h5, padding: '0 12px', display: 'flex', alignItems: 'center', gap: 8 }}>
          {['ALL', 'HAZARDOUS', 'SAFE', 'SORT: VELOCITY ▼'].map((f, i) => (
            <div key={i} style={{
              padding: '3px 8px',
              border: `1px solid ${i === 0 ? C.accent : C.lineBright}`,
              fontSize: bp === 'mobile' ? '3.5px' : '4.5px',
              color: i === 0 ? C.accent : C.textDim,
              opacity: i === 0 ? 1 : 0.7,
              whiteSpace: 'nowrap',
            }}>{f}</div>
          ))}
        </Box>

        {/* ⑥ Data table */}
        <Box callout="6" highlighted={hoveredSection === '⑥'}
          {...hover('⑥')}
          style={{ height: h.h6, padding: '8px 12px' }}>
          <div style={{ display: 'flex', gap: 10, marginBottom: 6, paddingBottom: 5, borderBottom: `1px solid ${C.line}` }}>
            {['NAME', 'DATE', 'DIAMETER', 'VELOCITY', 'MISS DIST'].map((col, i) => (
              <div key={i} style={{ flex: i === 0 ? 2 : 1 }}>
                <DimBar width="80%" height={5} opacity={0.6} />
              </div>
            ))}
          </div>
          {[0.85, 0.55, 0.3, 0.15, 0.08].map((op, i) => (
            <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 6 }}>
              {[2, 1, 1, 1, 1].map((flex, j) => (
                <div key={j} style={{ flex }}>
                  <DimBar width={`${55 + ((i + j) * 7) % 35}%`} height={5} opacity={op * 0.7} />
                </div>
              ))}
            </div>
          ))}
        </Box>

      </div>
    </div>
  )
}

// ─── Right panel ────────────────────────────────────────────────────────────

const LEGEND_ITEMS = [
  ['①', 'NAVIGATION HEADER'],
  ['②', 'DATE RANGE PICKER'],
  ['③', 'STAT CARDS (×3)'],
  ['④', 'DATA VISUALIZATIONS'],
  ['⑤', 'FILTER CONTROLS'],
  ['⑥', 'ASTEROID DATA TABLE'],
]

const SPECS = [
  ['BACKEND', 'FastAPI + PostgreSQL'],
  ['FRONTEND', 'React + Vite'],
  ['HOSTING', 'Railway + Vercel'],
  ['DATA SRC', 'NASA NeoWS API'],
  ['CACHE TTL', '7 DAYS / ENTRY'],
  ['MAX RANGE', '365 DAYS'],
  ['CHUNKING', '7-DAY API SPLITS'],
]

function Panel({ bp, hoveredSection, setHoveredSection, phase, credits, onCoin }) {
  const panelWidth = bp === 'desktop' ? '0 0 300px' : bp === 'tablet' ? '0 0 240px' : '100%'
  const legendTextSize = bp === 'mobile' ? '6px' : '7px'
  const specTextSize = bp === 'mobile' ? '5px' : '6px'
  const headerSize = bp === 'mobile' ? '6px' : '7px'

  return (
    <div style={{
      flex: bp === 'mobile' ? 'none' : panelWidth,
      width: bp === 'mobile' ? '100%' : undefined,
      display: 'flex', flexDirection: 'column', gap: '20px',
    }}>

      {/* Component legend */}
      <div style={{
        border: `1px solid ${C.line}`,
        backgroundColor: 'rgba(0,60,120,0.08)',
        padding: '16px 18px',
      }}>
        <div style={{
          fontSize: headerSize, color: C.textBright, letterSpacing: '0.08em',
          borderBottom: `1px solid ${C.line}`,
          paddingBottom: '10px', marginBottom: '14px',
        }}>
          COMPONENT LEGEND
        </div>
        {LEGEND_ITEMS.map(([n, label], i) => {
          const active = hoveredSection === n
          return (
            <div
              key={n}
              onPointerEnter={() => setHoveredSection(n)}
              onPointerLeave={() => setHoveredSection(null)}
              onPointerDown={() => setHoveredSection(n)}
              onPointerUp={() => setHoveredSection(null)}
              style={{
                display: 'flex', gap: 10, alignItems: 'center',
                padding: '5px 8px', margin: '0 -8px 2px',
                cursor: 'pointer',
                backgroundColor: active ? 'rgba(0,184,212,0.09)' : 'transparent',
                transition: 'background-color 0.12s',
              }}
            >
              <div style={{
                width: 28, height: 28, borderRadius: '50%',
                border: active ? `2px solid ${C.accent}` : `1px solid ${C.accent}`,
                backgroundColor: active ? C.accent : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '14px', lineHeight: '1',
                color: active ? C.bg : C.accent,
                flexShrink: 0,
                transition: 'background-color 0.12s, color 0.12s, border 0.12s',
              }}>{i + 1}</div>
              <span style={{
                fontSize: legendTextSize,
                color: active ? C.textBright : C.textDim,
                transition: 'color 0.12s',
              }}>{label}</span>
            </div>
          )
        })}
      </div>

      {/* System specs */}
      <div style={{
        border: `1px solid ${C.line}`,
        backgroundColor: 'rgba(0,60,120,0.08)',
        padding: '16px 18px',
      }}>
        <div style={{
          fontSize: headerSize, color: C.textBright, letterSpacing: '0.08em',
          borderBottom: `1px solid ${C.line}`,
          paddingBottom: '10px', marginBottom: '14px',
        }}>
          SYSTEM SPECIFICATIONS
        </div>
        {SPECS.map(([k, v]) => (
          <div key={k} style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'baseline',
            marginBottom: 9, gap: 8,
          }}>
            <span style={{ fontSize: specTextSize, color: C.textDim, flexShrink: 0 }}>{k}</span>
            <span style={{ fontSize: specTextSize, color: C.text, textAlign: 'right' }}>{v}</span>
          </div>
        ))}
      </div>

      {/* EXPLORE */}
      <div style={{
        border: `1px solid ${C.line}`,
        backgroundColor: 'rgba(0,60,120,0.08)',
        padding: '22px 18px',
        display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16,
      }}>
        <div style={{ fontSize: '6px', color: C.textDim, letterSpacing: '0.12em' }}>
          CREDITS:{' '}
          <span style={{ color: credits > 0 ? C.coin : C.textDim }}>
            {credits.toString().padStart(2, '0')}
          </span>
        </div>

        <button
          onClick={onCoin}
          disabled={phase !== 'idle'}
          className={phase === 'idle' ? 'coin-btn-pulse' : ''}
          style={{
            width: '100%',
            padding: '18px 12px',
            backgroundColor: phase !== 'idle' ? '#111a2a' : C.coin,
            color: phase !== 'idle' ? C.textDim : '#0a0a00',
            border: phase !== 'idle'
              ? `2px solid ${C.line}`
              : `2px solid ${C.coinGlow}`,
            boxShadow: phase !== 'idle'
              ? 'none'
              : `0 0 22px ${C.coinGlow}99, 5px 5px 0 ${C.coinGlow}`,
            fontFamily: "'Press Start 2P', monospace",
            fontSize: bp === 'mobile' ? '10px' : '13px',
            letterSpacing: '0.04em',
            cursor: phase !== 'idle' ? 'not-allowed' : 'pointer',
            transition: 'none',
            display: 'block',
          }}
          onMouseEnter={e => { if (phase === 'idle') e.currentTarget.style.filter = 'brightness(1.18)' }}
          onMouseLeave={e => { e.currentTarget.style.filter = '' }}
          onMouseDown={e => {
            if (phase === 'idle') {
              e.currentTarget.style.transform = 'translate(3px,3px)'
              e.currentTarget.style.boxShadow = `2px 2px 0 ${C.coinGlow}`
            }
          }}
          onMouseUp={e => {
            e.currentTarget.style.transform = ''
            e.currentTarget.style.boxShadow = phase === 'idle'
              ? `0 0 22px ${C.coinGlow}99, 5px 5px 0 ${C.coinGlow}`
              : 'none'
          }}
        >
          {phase === 'idle' ? '>> EXPLORE <<' : 'LOADING...'}
        </button>

        <div style={{
          fontSize: '5px', color: C.textDim,
          textAlign: 'center', lineHeight: 2.5, letterSpacing: '0.06em',
        }}>
          PRESS TO ACCESS LIVE<br />ASTEROID TRACKING DATA
        </div>
      </div>

    </div>
  )
}

// ─── Main export ─────────────────────────────────────────────────────────────

export default function LandingPage() {
  const [phase, setPhase] = useState('idle')
  const [credits, setCredits] = useState(0)
  const [hoveredSection, setHoveredSection] = useState(null)
  const bp = useBreakpoint()
  const navigate = useNavigate()
  const bootTimer = useRef(null)

  useEffect(() => {
    return () => { if (bootTimer.current) clearTimeout(bootTimer.current) }
  }, [])

  function handleCoin() {
    if (phase !== 'idle') return
    setCredits(1)
    setPhase('boot')
    bootTimer.current = setTimeout(() => navigate('/dashboard'), BOOT_LINES.length * 190 + 500)
  }

  const mainPadding =
    bp === 'desktop' ? '32px 56px' :
    bp === 'tablet'  ? '24px 32px' : '20px 20px'

  const mainGap =
    bp === 'desktop' ? '40px' :
    bp === 'tablet'  ? '28px' : '24px'

  return (
    <>
      <div style={{
        minHeight: '100vh',
        backgroundColor: C.bg,
        backgroundImage: `
          linear-gradient(${C.fine} 1px, transparent 1px),
          linear-gradient(90deg, ${C.fine} 1px, transparent 1px),
          linear-gradient(${C.coarse} 1px, transparent 1px),
          linear-gradient(90deg, ${C.coarse} 1px, transparent 1px)
        `,
        backgroundSize: '16px 16px, 16px 16px, 80px 80px, 80px 80px',
        fontFamily: "'Press Start 2P', monospace",
        color: C.text,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
        overflow: 'hidden',
      }}>

        {bp !== 'mobile' && (
          <>
            <CornerMark top={12} left={14} />
            <CornerMark top={12} right={14} />
            <CornerMark bottom={36} left={14} />
            <CornerMark bottom={36} right={14} />
          </>
        )}

        {/* Classification bar */}
        <div style={{
          borderBottom: `1px solid ${C.line}`,
          padding: bp === 'mobile' ? '8px 20px' : '8px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: bp === 'mobile' ? '5px' : '6.5px',
          color: C.textDim,
          letterSpacing: '0.08em',
          flexWrap: 'wrap',
          gap: 6,
        }}>
          <span style={{ color: C.text }}>TECHNICAL SPECIFICATION — UNCLASSIFIED</span>
          {bp !== 'mobile' && <span>DOC NO: NEO-TRACK-2026-001</span>}
          <span>REV 1.0 // SHEET 1 OF 1</span>
        </div>

        {/* Main content */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: bp === 'mobile' ? 'column' : 'row',
          padding: mainPadding,
          gap: mainGap,
          alignItems: 'flex-start',
        }}>
          <Schematic bp={bp} hoveredSection={hoveredSection} setHoveredSection={setHoveredSection} />
          <Panel
            bp={bp}
            hoveredSection={hoveredSection}
            setHoveredSection={setHoveredSection}
            phase={phase}
            credits={credits}
            onCoin={handleCoin}
          />
        </div>

        {/* Title block footer */}
        <div style={{
          borderTop: `1px solid ${C.line}`,
          display: 'flex',
          fontSize: '5.5px',
          flexWrap: 'wrap',
        }}>
          {bp !== 'mobile' && (
            <div style={{ flex: 1, borderRight: `1px solid ${C.line}`, minWidth: 0 }}>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '48px 88px 1fr 72px',
                borderBottom: `1px solid ${C.line}`,
                padding: '5px 24px', color: C.textDim,
              }}>
                {['REV', 'DATE', 'DESCRIPTION', 'BY'].map(h => <span key={h}>{h}</span>)}
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: '48px 88px 1fr 72px',
                padding: '5px 24px', color: C.text,
              }}>
                <span>1.0</span>
                <span>2026-05</span>
                <span>INITIAL DESIGN — NEO ASTEROID TRACKER UI</span>
                <span>DEB</span>
              </div>
            </div>
          )}
          <div style={{
            padding: '8px 28px',
            minWidth: bp === 'mobile' ? '100%' : 260,
            display: 'flex', flexDirection: 'column', gap: 6,
          }}>
            <div style={{ fontSize: '10px', color: C.white, letterSpacing: '0.04em' }}>NASA NEO MONITOR TUTORIAL</div>
            <div style={{ color: C.textDim, letterSpacing: '0.08em' }}>NEAR-EARTH OBJECT TRACKING SYSTEM</div>
            <div style={{ color: C.textDim, marginTop: 4 }}>DWG NO: NEO-UI-001 // SCALE: NTS // REV: 1.0</div>
          </div>
        </div>

      </div>

      {phase === 'boot' && <BootOverlay />}

      <style>{`
        .coin-btn-pulse {
          animation: coinPulse 1.8s steps(1) infinite;
        }
        @keyframes coinPulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.55; }
        }
      `}</style>
    </>
  )
}
