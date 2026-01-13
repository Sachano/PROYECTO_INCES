import React from 'react'
import Sidebar from './Sidebar.jsx'

export default function Layout({ children }){
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        {children}
      </div>
    </div>
  )
}
