import React, { createContext, useContext, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }){
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const value = useMemo(() => {
    return {
      sidebarOpen,
      openSidebar: () => setSidebarOpen(true),
      closeSidebar: () => setSidebarOpen(false),
      toggleSidebar: () => setSidebarOpen(v => !v),
    }
  }, [sidebarOpen])

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(){
  const ctx = useContext(UIContext)
  if(!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
