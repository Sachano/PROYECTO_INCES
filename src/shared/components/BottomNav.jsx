import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../modules/auth/context/AuthContext.jsx'
import { HiHome, HiBookOpen, HiBell, HiUser, HiAcademicCap, HiLogout } from 'react-icons/hi'

const ITEMS = [
  { to: '/', label: 'Inicio', icon: HiHome },
  { to: '/cursos', label: 'Cursos', icon: HiBookOpen },
  { to: '/aula-virtual', label: 'Aula', icon: HiAcademicCap },
  { to: '/alertas', label: 'Alertas', icon: HiBell },
  { to: '/perfil', label: 'Perfil', icon: HiUser },
]

export default function BottomNav(){
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout(){
    logout()
    navigate('/login')
  }

  return (
    <nav className="bottom-nav">
      {ITEMS.map(({ to, label, icon: Icon }) => {
        if (label === 'Aula' && user?.role !== 'estudiante' && user?.role !== 'docente' && user?.role !== 'administrador' && user?.role !== 'master') return null
        return (
          <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `bn-item${isActive ? ' active' : ''}`}>
            <Icon size={20} />
            <span>{label}</span>
          </NavLink>
        )
      })}
      <button type="button" className="bn-item bn-logout" onClick={handleLogout}>
        <HiLogout size={20} />
        <span>Salir</span>
      </button>
    </nav>
  )
}
