import React from 'react'
import { useNavigate } from 'react-router-dom'
import { useUI } from '../context/UIContext.jsx'
import { IoMenuOutline, IoSearchOutline, IoNotificationsOutline } from 'react-icons/io5'

export default function Header(){
  const navigate = useNavigate()
  const { toggleSidebar, toggleSidebarCollapsed } = useUI()

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
        <div className="logo">
          <img src="/assets/logo-small.svg" alt="Inces" />
        </div>
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
