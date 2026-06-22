import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'

const UIContext = createContext(null)

export function UIProvider({ children }){
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [theme, setTheme] = useState(() => {
    if(typeof window === 'undefined') return 'light'

    const stored = window.localStorage.getItem('theme')
    const resolved = stored === 'dark' ? 'dark' : 'light'
    window.localStorage.setItem('theme', resolved)
    document.documentElement.dataset.theme = resolved
    return resolved
  })

  useEffect(() => {
    try {
      document.documentElement.dataset.theme = theme
      window.localStorage.setItem('theme', theme)
    } catch {
      // Ignore environments without window/localStorage
    }
  }, [theme])

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

      theme,
      isDarkTheme: theme === 'dark',
      setTheme,
      toggleTheme: () => setTheme(v => v === 'dark' ? 'light' : 'dark'),
      setLightTheme: () => setTheme('light'),
      setDarkTheme: () => setTheme('dark'),
    }
  }, [sidebarOpen, sidebarCollapsed, theme])

  return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}

export function useUI(){
  const ctx = useContext(UIContext)
  if(!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
