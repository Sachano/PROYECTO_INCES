import React from 'react'
import { NavLink } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext.jsx'
import { useUI } from '../context/UIContext.jsx'
import {
  IoHomeOutline,
  IoBookOutline,
  IoPersonCircleOutline,
  IoNotificationsOutline,
  IoSchoolOutline,
  IoPeopleOutline,
  IoLogOutOutline,
  IoShieldCheckmarkOutline,
} from 'react-icons/io5'

export default function Sidebar(){
  const { user, logout } = useAuth()
  const { sidebarOpen, sidebarCollapsed, closeSidebar } = useUI()

  function navClass({ isActive }){
    return isActive ? 'nav-item active' : 'nav-item'
  }

  return (
    <aside className={sidebarOpen ? (sidebarCollapsed ? 'sidebar open collapsed' : 'sidebar open') : (sidebarCollapsed ? 'sidebar collapsed' : 'sidebar')}>
      <div className="brand">
        <div className="brand-mark">{sidebarCollapsed ? 'I' : 'INCES'}</div>
        <div className="brand-chip">SACHANO</div>
      </div>
      <nav className="nav">
        <NavLink to="/" className={navClass} end onClick={closeSidebar} title="Home">
          <span className="nav-ico"><IoHomeOutline /></span> <span className="nav-label">Home</span>
        </NavLink>
        <NavLink to="/cursos" className={navClass} onClick={closeSidebar} title="Cursos">
          <span className="nav-ico"><IoBookOutline /></span> <span className="nav-label">Cursos</span>
        </NavLink>
        <NavLink to="/perfil" className={navClass} onClick={closeSidebar} title="Perfil">
          <span className="nav-ico"><IoPersonCircleOutline /></span> <span className="nav-label">Perfil</span>
        </NavLink>
        <NavLink to="/alertas" className={navClass} onClick={closeSidebar} title="Alertas">
          <span className="nav-ico"><IoNotificationsOutline /></span> <span className="nav-label">Alertas</span>
        </NavLink>

        {(user?.role === 'base' || user?.role === 'admin') && (
          <NavLink to="/aula-virtual" className={navClass} onClick={closeSidebar} title="Aula Virtual">
            <span className="nav-ico"><IoSchoolOutline /></span> <span className="nav-label">Aula Virtual</span>
          </NavLink>
        )}

        {user?.role === 'master' && (
          <NavLink to="/usuarios" className={navClass} onClick={closeSidebar} title="Usuarios">
            <span className="nav-ico"><IoPeopleOutline /></span> <span className="nav-label">Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div className="sidebar-footer" style={{ marginTop: 'auto', padding: 12 }}>
        {user && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div className="sidebar-user" style={{ fontWeight: 950 }}>{user.firstName} {user.lastName}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="role-chip">
                <IoShieldCheckmarkOutline /> {String(user.role || '').toUpperCase()}
              </span>
            </div>
            <button className="btn" onClick={() => { logout(); closeSidebar() }} title="Cerrar sesión" type="button">
              <span className="btn-ico"><IoLogOutOutline /></span>
              <span className="nav-label">Cerrar sesión</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
