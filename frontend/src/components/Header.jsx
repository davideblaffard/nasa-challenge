import React from 'react'
import { Link } from 'react-router-dom'

export default function Header() {
  return (
    <header className="border-b-2 border-pulse/40 bg-cosmos sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-4 group">
          <div className="w-8 h-8 bg-void px-border px-border-green flex items-center justify-center">
            <div className="w-3 h-3 bg-pulse animate-pixel-pulse" />
          </div>
          <div>
            <div className="text-pulse text-xs tracking-widest">NASA NEO</div>
            <div className="text-dim text-[8px] mt-1 hidden sm:block">NEAR EARTH OBJECT MONITOR</div>
          </div>
        </Link>
        <div className="flex items-center gap-3 text-[8px] text-pulse">
          <span className="w-2 h-2 bg-pulse animate-pixel-blink inline-block" />
          <span>LIVE</span>
        </div>
      </div>
    </header>
  )
}
