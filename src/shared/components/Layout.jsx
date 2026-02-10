import React from 'react'
import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar.jsx'
import Footer from './Footer.jsx'
import { UIProvider, useUI } from '../context/UIContext.jsx'

function Shell({ children }){
  const { sidebarOpen, closeSidebar } = useUI()

  return (
    <div className="app-shell">
      <div
        className={sidebarOpen ? 'sidebar-backdrop open' : 'sidebar-backdrop'}
        onClick={closeSidebar}
        aria-hidden
      />
      <Sidebar />
      <div className="app-main">
        {children ?? <Outlet />}
      </div>
    </div>
  )
}

export default function Layout({ children }){
  return (
    <UIProvider>
      <Shell>{children}</Shell>
    </UIProvider>
  )
}
