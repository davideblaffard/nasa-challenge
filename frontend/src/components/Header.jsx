import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b border-pulse/20 bg-cosmos/80 backdrop-blur-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="w-8 h-8 rounded-full bg-pulse/20 border border-pulse/50 flex items-center justify-center transition-all group-hover:glow-pulse">
            <div className="w-3 h-3 rounded-full bg-pulse animate-pulse" />
          </div>
          <span className="font-display text-2xl tracking-widest text-pulse">NASA NEO</span>
          <span className="text-dim text-xs tracking-widest hidden sm:block">NEAR EARTH OBJECT MONITOR</span>
        </Link>
        <div className="flex items-center gap-2 text-xs text-dim font-mono">
          <div className="w-2 h-2 rounded-full bg-pulse animate-pulse" />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  )
}
