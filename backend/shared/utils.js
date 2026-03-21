// Utility functions for the application

// Generate a random secure password
export function generateSecurePassword(length = 10) {
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%'
  let password = ''
  // Ensure at least one uppercase, one lowercase, one number, and one special char
  const uppercases = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const lowercases = 'abcdefghijklmnopqrstuvwxyz'
  const numbers = '0123456789'
  const specials = '!@#$%'
  
  password += uppercases[Math.floor(Math.random() * uppercases.length)]
  password += lowercases[Math.floor(Math.random() * lowercases.length)]
  password += numbers[Math.floor(Math.random() * numbers.length)]
  password += specials[Math.floor(Math.random() * specials.length)]
  
  for (let i = 4; i < length; i++) {
    password += charset[Math.floor(Math.random() * charset.length)]
  }
  
  // Shuffle the password
  return password.split('').sort(() => Math.random() - 0.5).join('')
}

// Generate enrollment/matricula based on INCES format
// Format: {period}-{location}-{area}-{year}
// Period: 1 (Jan-Jun) or 2 (Jul-Dec)
// Location: SC (San Cristóbal), CCS (Caracas), MC (Maracaibo), etc.
// Area: INF (Informática), TXT (Textil), ELÉC (Electricidad), CARP (Carpintería), SOLD (Soldadura), etc.
export function generateEnrollment(location, area) {
  const now = new Date()
  const year = now.getFullYear()
  const month = now.getMonth() + 1
  const period = month <= 6 ? 1 : 2 // 1 = first half, 2 = second half
  
  // Format: 1-SC-INF-2026
  return `${period}-${location}-${area}-${year}`
}

// Valid locations in Venezuela (state capitals and major cities)
export const INCES_LOCATIONS = [
  { code: 'SC', name: 'San Cristóbal' },
  { code: 'CCS', name: 'Caracas' },
  { code: 'MC', name: 'Maracaibo' },
  { code: 'VAL', name: 'Valencia' },
  { code: 'BARQ', name: 'Barquisimeto' },
  { code: 'MCBO', name: 'Maturín' },
  { code: 'CCC', name: 'Ciudad Bolívar' },
  { code: 'CUM', name: 'Cumaná' },
  { code: 'PTO', name: 'Puerto La Cruz' },
  { code: 'GUAY', name: 'Guayana' },
  { code: 'BARIN', name: 'Barinas' },
  { code: 'MERIDA', name: 'Mérida' },
  { code: 'TRUJ', name: 'Trujillo' },
  { code: 'TACHIRA', name: 'San Cristóbal (Táchira)' },
  { code: 'ZULIA', name: 'Zulia' },
  { code: 'LARA', name: 'Lara' },
  { code: 'CARABOBO', name: 'Carabobo' },
  { code: 'ARAGUA', name: 'Aragua' },
  { code: 'VARGAS', name: 'Vargas' },
  { code: 'ANZOATEGUI', name: 'Anzoátegui' },
  { code: 'SUCRE', name: 'Sucre' },
  { code: 'MONAGAS', name: 'Monagas' },
  { code: 'BOLIVAR', name: 'Bolívar' },
  { code: 'APURE', name: 'Apure' },
  { code: 'DANGRAD', name: 'Delta Amacuro' },
  { code: 'AMAZONAS', name: 'Amazonas' },
]

// Course areas / career paths
export const INCES_AREAS = [
  { code: 'INF', name: 'Informática' },
  { code: 'TXT', name: 'Textil' },
  { code: 'ELEC', name: 'Electricidad' },
  { code: 'CARP', name: 'Carpintería' },
  { code: 'SOLD', name: 'Soldadura' },
  { code: 'MEC', name: 'Mecánica' },
  { code: 'MECL', name: 'Mecánica Ligera (Autos)' },
  { code: 'ELEC', name: 'Electrónica' },
  { code: 'CONST', name: 'Construcción' },
  { code: 'ADMIN', name: 'Administración' },
  { code: 'CONT', name: 'Contabilidad' },
  { code: 'RRHH', name: 'Recursos Humanos' },
  { code: 'MARK', name: 'Marketing Digital' },
  { code: 'DIS', name: 'Diseño' },
  { code: 'UX', name: 'Experiencia de Usuario (UX)' },
  { code: 'PROG', name: 'Programación' },
  { code: 'PYTHON', name: 'Python Básico' },
  { code: 'GER', name: 'Gestión de Proyectos' },
  { code: 'ASIST', name: 'Asistente Administrativo' },
  { code: 'RELE', name: 'Reparación de Electrodomésticos' },
]

// Security questions for password recovery
export const SECURITY_QUESTIONS = [
  { id: 'mascota', question: '¿Cómo se llama tu mascota?' },
  { id: 'abuela_materna', question: '¿Cómo se llama tu abuela materna?' },
  { id: 'abuela_paterna', question: '¿Cómo se llama tu abuela paterna?' },
  { id: 'lugar_nacimiento', question: '¿En qué hospital o lugar naciste?' },
  { id: 'colegio_bachiller', question: '¿En qué colegio te graduaste de bachiller?' },
  { id: 'primaria', question: '¿En qué escuela te graduaste de primaria?' },
  { id: 'ciudad_favorita', question: '¿Cuál es tu ciudad favorita?' },
  { id: 'comida_favorita', question: '¿Cuál es tu comida favorita?' },
  { id: 'pelicula_favorita', question: '¿Cuál es tu película favorita?' },
  { id: 'musica_favorita', question: '¿Cuál es tu género musical favorito?' },
]
