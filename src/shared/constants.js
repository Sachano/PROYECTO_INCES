export const ASSETS = {
  LOGO: '/assets/inces-logo.png',
  LOGO_SMALL: '/assets/logo-small.svg',
  LOGIN_BG: '/assets/Inces-fondo-login.jpg',
  HERO_BG: '/assets/home.png',
  HERO: '/assets/hero.svg',
  PLACEHOLDER_COURSE: '/assets/course1.svg',
  PLACEHOLDER_COURSE2: '/assets/course2.svg',
  COURSES: {
    ASISTENTE_ADMIN: '/assets/cursos/asistente-administrativo.jpg',
    CARPINTERIA: '/assets/cursos/carpinteria.jpg',
    ELECTRICIDAD: '/assets/cursos/electricidad-residencial.jpg',
    GESTION_PROYECTOS: '/assets/cursos/gestion-de-proyectos.png',
    INTRO_UX: '/assets/cursos/introduccion-a-ux.jpg',
    MARKETING: '/assets/cursos/marketing-digital.jpg',
    MECANICA: '/assets/cursos/mecanica-lijera.jpg',
    PROGRAMACION: '/assets/cursos/programacion-web.jpg',
    PYTHON: '/assets/cursos/python-basico.jpg',
    REPARACIONES: '/assets/cursos/reparacion-de-electrodomesticos.jpg',
    SOLDADURA: '/assets/cursos/soldadura-basica.jpg',
  }
}

export function courseImage(path) {
  if (!path || path === '/assets/course1.svg') return ASSETS.PLACEHOLDER_COURSE
  if (path.startsWith('http')) return path
  return path.startsWith('/') ? path : `/${path}`
}
