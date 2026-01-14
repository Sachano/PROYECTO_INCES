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
  const { sidebarOpen, closeSidebar } = useUI()

  function navClass({ isActive }){
    return isActive ? 'nav-item active' : 'nav-item'
  }

  return (
    <aside className={sidebarOpen ? 'sidebar open' : 'sidebar'}>
      <div className="brand">
        <div className="brand-mark">INCES</div>
        <div className="brand-chip">SACHANO</div>
      </div>
      <nav className="nav">
        <NavLink to="/" className={navClass} end onClick={closeSidebar}>
          <span className="nav-ico"><IoHomeOutline /></span> <span>Home</span>
        </NavLink>
        <NavLink to="/cursos" className={navClass} onClick={closeSidebar}>
          <span className="nav-ico"><IoBookOutline /></span> <span>Cursos</span>
        </NavLink>
        <NavLink to="/perfil" className={navClass} onClick={closeSidebar}>
          <span className="nav-ico"><IoPersonCircleOutline /></span> <span>Perfil</span>
        </NavLink>
        <NavLink to="/alertas" className={navClass} onClick={closeSidebar}>
          <span className="nav-ico"><IoNotificationsOutline /></span> <span>Alertas</span>
        </NavLink>

        {(user?.role === 'base' || user?.role === 'admin') && (
          <NavLink to="/aula-virtual" className={navClass} onClick={closeSidebar}>
            <span className="nav-ico"><IoSchoolOutline /></span> <span>Aula Virtual</span>
          </NavLink>
        )}

        {user?.role === 'master' && (
          <NavLink to="/usuarios" className={navClass} onClick={closeSidebar}>
            <span className="nav-ico"><IoPeopleOutline /></span> <span>Usuarios</span>
          </NavLink>
        )}
      </nav>

      <div style={{ marginTop: 'auto', padding: 12 }}>
        {user && (
          <div style={{ display: 'grid', gap: 8 }}>
            <div style={{ fontWeight: 950 }}>{user.firstName} {user.lastName}</div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
              <span className="role-chip">
                <IoShieldCheckmarkOutline /> {String(user.role || '').toUpperCase()}
              </span>
            </div>
            <button className="btn" onClick={() => { logout(); closeSidebar() }}>
              <span className="btn-ico"><IoLogOutOutline /></span>
              Cerrar sesión
            </button>
          </div>
        )}
      </div>
    </aside>
  )
}
