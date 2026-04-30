import React from 'react'

export default function Tooltip({ content, children, position = 'top' }) {
  const posClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
  }

  const arrowClasses = {
    top: 'top-full left-1/2 -translate-x-1/2 border-t-cosmos',
    bottom: 'bottom-full left-1/2 -translate-x-1/2 border-b-cosmos',
    right: 'right-full top-1/2 -translate-y-1/2 border-r-cosmos',
    left: 'left-full top-1/2 -translate-y-1/2 border-l-cosmos',
  }

  return (
    <span className="relative group inline-flex">
      {children}
      <span
        className={`absolute ${posClasses[position]} z-50 px-3 py-2 bg-cosmos border border-white/20 rounded text-xs font-mono text-white whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-150 shadow-lg`}
      >
        {content}
        <span
          className={`absolute ${arrowClasses[position]} border-4 border-transparent`}
        />
      </span>
    </span>
  )
}
