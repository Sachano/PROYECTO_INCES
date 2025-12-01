import React from 'react'
import { NavLink } from 'react-router-dom'

export default function BottomNav(){
  return (
    <nav className="bottom-nav">
      <NavLink to="/" className={({isActive}) => isActive ? 'bn-item active' : 'bn-item'} end>🏠<span>Home</span></NavLink>
      <NavLink to="/cursos" className={({isActive}) => isActive ? 'bn-item active' : 'bn-item'}>📚<span>Cursos</span></NavLink>
      <NavLink to="/perfil" className={({isActive}) => isActive ? 'bn-item active' : 'bn-item'}>👤<span>Mi Perfil</span></NavLink>
      <NavLink to="/alertas" className={({isActive}) => isActive ? 'bn-item active' : 'bn-item'}>🔔<span>Alertas</span></NavLink>
      <NavLink to="/ajustes" className={({isActive}) => isActive ? 'bn-item active' : 'bn-item'}>⚙️<span>Ajustes</span></NavLink>
    </nav>
  )
}
