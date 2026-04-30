import React from 'react'

export default function ErrorBanner({ message }) {
  return (
    <div className="mb-8 px-border px-border-red bg-hazard/10 px-5 py-4 text-hazard text-[8px] leading-6">
      ▶ {message}
    </div>
  )
}
