import React from 'react'

export default function ErrorBanner({ message }) {
  return (
    <div className="mb-8 border border-hazard/50 bg-hazard/10 rounded px-5 py-4 text-hazard text-sm font-mono tracking-wide">
      ⚠ {message}
    </div>
  )
}
