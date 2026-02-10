import React from 'react'
import { useLocation } from 'react-router-dom'

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

export default function Footer(){
  const location = useLocation()
  const title = pageTitleFromPath(location.pathname)
  // Footer is now displayed in header; keep component for backward compatibility
  return null
}
