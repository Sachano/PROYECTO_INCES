const BASE = import.meta.env.VITE_API_URL || '/api'

// Simple in-memory cache for GET requests
const apiCache = new Map()
const CACHE_DURATION = 30000 // 30 seconds

function getToken(){
  try{
    return sessionStorage.getItem('auth_token') || ''
  }catch{
    return ''
  }
}

// Error handling utility for API responses
export const API_ERRORS = {
  USER_ALREADY_EXISTS: 'Ya existe un usuario con esa cédula o correo electrónico',
  MISSING_REQUIRED_FIELDS: 'Por favor completa todos los campos requeridos',
  INVALID_CREDENTIALS: 'Usuario o contraseña incorrectos',
  TOKEN_EXPIRED: 'La sesión ha expirado. Por favor inicia sesión nuevamente',
  UNAUTHORIZED: 'No tienes permisos para realizar esta acción',
  MINIMUM_SECURITY_QUESTIONS: 'Debes seleccionar al menos 2 preguntas de seguridad',
  NETWORK_ERROR: 'Error de conexión. Verifica tu internet e intenta de nuevo',
  SERVER_ERROR: 'Error del servidor. Intenta más tarde',
  UNKNOWN_ERROR: 'Ocurrió un error inesperado. Por favor intenta de nuevo',
  NOT_FOUND: 'Recurso no encontrado',
  FORBIDDEN: 'Acceso denegado',
}

function getApiErrorMessage(error, defaultMsg = API_ERRORS.UNKNOWN_ERROR) {
  if (!error) return defaultMsg

  const serverError = error?.body?.error
  const serverMsg = error?.body?.message

  if (serverError && API_ERRORS[serverError]) {
    return API_ERRORS[serverError]
  }

  const status = error?.status
  if (status === 401) return API_ERRORS.UNAUTHORIZED
  if (status === 403) return API_ERRORS.FORBIDDEN
  if (status === 404) return API_ERRORS.NOT_FOUND
  if (status === 500) return API_ERRORS.SERVER_ERROR
  if (status === 0) return API_ERRORS.NETWORK_ERROR

  if (serverMsg) return serverMsg

  return defaultMsg
}

function logApiError(error, context = '') {
  const logData = {
    context,
    status: error?.status,
    error: error?.body?.error,
    message: error?.body?.message || error?.message,
    timestamp: new Date().toISOString()
  }
  console.error('API Error:', logData)
}

// Cache utilities
function getCached(key){
  const entry = apiCache.get(key)
  if(!entry) return null
  
  if(Date.now() - entry.timestamp > CACHE_DURATION){
    apiCache.delete(key)
    return null
  }
  
  return entry.data
}

function setCache(key, data){
  apiCache.set(key, {
    data,
    timestamp: Date.now()
  })
}

function clearCache(){
  apiCache.clear()
}

// Export clearCache for manual cache invalidation
export { clearCache, getApiErrorMessage, logApiError }

async function http(method, url, data, useCache = false){
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if(token) headers.Authorization = `Bearer ${token}`

  // Generate cache key for GET requests
  const cacheKey = useCache ? `${method}:${url}:${JSON.stringify(data || {})}` : null

  // Check cache for GET requests
  if(useCache && method === 'GET' && cacheKey){
    const cached = getCached(cacheKey)
    if(cached) return cached
  }

  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  })
  const text = await res.text()
  let body = null
  try{ body = text ? JSON.parse(text) : null }catch(e){ body = text }
  if(!res.ok){
    const err = new Error(`HTTP ${res.status}`)
    err.status = res.status
    err.body = body
    throw err
  }

  // Cache successful GET responses
  if(useCache && method === 'GET' && cacheKey){
    setCache(cacheKey, body)
  }

  return body
}

export const api = {
  auth: {
    login: async ({ identifier, password }) => http('POST', '/auth/login', { identifier, password }),
    me: async () => http('GET', '/auth/me', null, true),
    forgot: async ({ email, cedula }) => http('POST', '/auth/forgot', { email, cedula }),
    reset: async ({ token, newPassword }) => http('POST', '/auth/reset', { token, newPassword })
  },
  courses: {
    list: async (params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/courses${qs}`, null, true)
    },
    get: async (id) => http('GET', `/courses/${id}`, null, true),
    create: async (data) => http('POST', '/courses', data),
    setInstructor: async (courseId, instructorUserId) => http('PUT', `/courses/${courseId}/instructor`, { instructorUserId }),
    uploadImage: async (file) => {
      const token = getToken()
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(`${BASE}/courses/upload-image`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    },
    update: async (courseId, data) => http('PUT', `/courses/${courseId}`, data),
    delete: async (courseId) => http('DELETE', `/courses/${courseId}`),
  },
  alerts: {
    list: async () => http('GET', '/alerts', null, true),
    markRead: async (id) => http('POST', `/alerts/${id}/read`)
  },
  profile: {
    get: async () => http('GET', '/profile', null, true),
    update: async (data) => http('PUT', '/profile', data)
  },
  users: {
    list: async (params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/users${qs}`, null, true)
    },
    get: async (id) => http('GET', `/users/${id}`, null, true),
    delete: async (id) => http('DELETE', `/users/${id}`),
    setStatus: async (id, status) => http('PATCH', `/users/${id}/status`, { status }),
    create: async (data) => http('POST', '/users', data)
  },
  virtualClassroom: {
    listCourses: async () => http('GET', '/aula-virtual/courses', null, true),
    enroll: async (courseId) => http('POST', `/aula-virtual/courses/${courseId}/enroll`),
    listStudents: async (courseId) => http('GET', `/aula-virtual/courses/${courseId}/students`, null, true),
    listPosts: async (courseId, params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/aula-virtual/courses/${courseId}/posts${qs}`, null, true)
    },
    createPost: async (courseId, { type, title, description, dueAt, files = [] }) => {
      const token = getToken()
      const fd = new FormData()
      fd.append('type', type)
      fd.append('title', title)
      fd.append('description', description ?? '')
      if(dueAt) fd.append('dueAt', dueAt)
      for(const f of files) fd.append('files', f)

      const res = await fetch(`${BASE}/aula-virtual/courses/${courseId}/posts`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    },
    getMySubmission: async (courseId, assignmentId) => http('GET', `/aula-virtual/courses/${courseId}/assignments/${assignmentId}/submissions/me`),
    listAssignmentSubmissions: async (courseId, assignmentId) => http('GET', `/aula-virtual/courses/${courseId}/assignments/${assignmentId}/submissions`),
    submitAssignment: async (courseId, assignmentId, file) => {
      const token = getToken()
      const fd = new FormData()
      fd.append('file', file)

      const res = await fetch(`${BASE}/aula-virtual/courses/${courseId}/assignments/${assignmentId}/submissions`, {
        method: 'POST',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        body: fd
      })
      if(!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    },
  }
}

// Export the api object
export default api
