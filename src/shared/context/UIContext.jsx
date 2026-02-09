import React, { createContext, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }){
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const value = useMemo(() => {
    return {
      sidebarOpen,
      sidebarCollapsed,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen(v => !v),

      collapseSidebar: () => setSidebarCollapsed(true),
      expandSidebar: () => setSidebarCollapsed(false),
      toggleSidebarCollapsed: () => setSidebarCollapsed(v => !v),
    }
  }, [sidebarOpen, sidebarCollapsed])

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(){
  const ctx = useContext(UIContext)
  if(!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
