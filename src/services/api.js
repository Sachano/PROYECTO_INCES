const BASE = '/api'

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
export { clearCache }

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
    setStatus: async (id, status) => http('PATCH', `/users/${id}/status`, { status })
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
