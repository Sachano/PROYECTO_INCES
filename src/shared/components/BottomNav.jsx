import { NavLink } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext.jsx'
import { HiHome, HiBookOpen, HiBell, HiUser, HiAcademicCap } from 'react-icons/hi'

const ITEMS = [
  { to: '/dashboard', label: 'Inicio', icon: HiHome },
  { to: '/cursos', label: 'Cursos', icon: HiBookOpen },
  { to: '/aula-virtual', label: 'Aula', icon: HiAcademicCap },
  { to: '/alertas', label: 'Alertas', icon: HiBell },
  { to: '/perfil', label: 'Perfil', icon: HiUser },
]

export default function BottomNav(){
  const { user } = useAuth()

  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ to, label, icon: Icon }) => {
        if (label === 'Aula' && user?.role !== 'estudiante' && user?.role !== 'docente') return null
        return (
          <NavLink key={to} to={to} end={to === '/dashboard'} className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        )
      })}
    </nav>
  )
}
