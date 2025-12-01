import React from 'react'

export default function Header(){
  return (
    <header className="app-header">
      <div className="topbar">
        <button className="icon-btn" aria-label="menu">☰</button>
        <div className="logo">
          <img src="/logo-small.svg" alt="Inces" />
        </div>
        <div className="right-icons">
          <button className="icon-btn" aria-label="search">🔍</button>
          <button className="icon-btn" aria-label="notifications">🔔</button>
        </div>
      </div>
    </header>
  )
}
