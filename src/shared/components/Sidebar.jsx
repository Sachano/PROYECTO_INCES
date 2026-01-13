import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="brand">inces</div>
      <nav className="nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>
          <span className="nav-ico">🏠</span> <span>Home</span>
        </NavLink>
        <NavLink to="/cursos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-ico">📚</span> <span>Cursos</span>
        </NavLink>
        <NavLink to="/perfil" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-ico">👤</span> <span>Perfil</span>
        </NavLink>
        <NavLink to="/alertas" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>
          <span className="nav-ico">🔔</span> <span>Alertas</span>
        </NavLink>
      </nav>
    </aside>
  )
}
