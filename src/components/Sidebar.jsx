import React from 'react'
import { NavLink } from 'react-router-dom'

export default function Sidebar(){
  return (
    <aside className="sidebar">
      <div className="brand">inces</div>
      <nav className="nav">
        <NavLink to="/" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>Home</NavLink>
        <NavLink to="/cursos" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Cursos</NavLink>
        <NavLink to="/perfil" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Mi Perfil</NavLink>
        <NavLink to="/alertas" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Alertas</NavLink>
        <NavLink to="/ajustes" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Ajustes</NavLink>
      </nav>
    </aside>
  )
}
