import React from 'react'

export default function Tooltip({ content, children, position = 'top' }) {
  const posClasses = {
    top:    'bottom-full left-1/2 -translate-x-1/2 mb-3',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-3',
    right:  'left-full top-1/2 -translate-y-1/2 ml-3',
    left:   'right-full top-1/2 -translate-y-1/2 mr-3',
  }

  return (
    <span className="relative group inline-flex">
      {children}
      <span
        className={`absolute ${posClasses[position]} z-50 px-3 py-2 bg-cosmos px-border px-border-dim text-[8px] text-silver whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none leading-5 max-w-[220px] whitespace-normal`}
        style={{ transition: 'opacity 0.1s steps(1)' }}
      >
        {content}
      </span>
    </span>
  )
}
