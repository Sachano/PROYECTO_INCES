import React from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useUI } from '../context/UIContext.jsx'
import { IoMenuOutline, IoSearchOutline, IoNotificationsOutline } from 'react-icons/io5'

export default function Header(){
  const navigate = useNavigate()
  const location = useLocation()
  const { toggleSidebar, toggleSidebarCollapsed } = useUI()

  function pageTitleFromPath(pathname){
    const p = String((pathname||'').split('/')[1]||'').toLowerCase()
    const map = {
      '': 'Home',
      'cursos': 'Cursos',
      'perfil': 'Perfil',
      'alertas': 'Alertas',
      'aula-virtual': 'Aula Virtual',
      'usuarios': 'Usuarios',
      'login': 'Entrar'
    }
    return map[p] || (p ? p.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()) : 'Home')
  }

  function onMenu(){
    try{
      const isMobile = window.matchMedia && window.matchMedia('(max-width: 860px)').matches
      if(isMobile) toggleSidebar()
      else toggleSidebarCollapsed()
    }catch{
      // Fallback seguro
      toggleSidebarCollapsed()
    }
  }
  return (
    <header className="app-header">
      <div className="topbar">
        <button className="icon-btn" aria-label="menu" type="button" onClick={onMenu}>
          <IoMenuOutline />
        </button>
        {/* logo removed as requested */}
        <div className="page-title">{pageTitleFromPath(location.pathname)}</div>
        <div className="right-icons">
          <button className="icon-btn" aria-label="search" type="button" onClick={() => navigate('/cursos')}>
            <IoSearchOutline />
          </button>
          <button className="icon-btn" aria-label="notifications" type="button" onClick={() => navigate('/alertas')}>
            <IoNotificationsOutline />
          </button>
        </div>
      </div>
    </header>
  )
}
