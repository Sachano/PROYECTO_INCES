import React from 'react'

export function Tabs({ value, onChange, options = [] }){
  return (
    <div className="tabs">
      {options.map(opt => (
        <button
          key={opt.value}
          className={value === opt.value ? 'tab active' : 'tab'}
          onClick={() => onChange(opt.value)}
        >{opt.label}</button>
      ))}
    </div>
  )
}
