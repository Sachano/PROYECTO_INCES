const BASE = '/api'

function getToken(){
  try{
    return sessionStorage.getItem('auth_token') || ''
  }catch{
    return ''
  }
}

async function http(method, url, data){
  const token = getToken()
  const headers = { 'Content-Type': 'application/json' }
  if(token) headers.Authorization = `Bearer ${token}`

  const res = await fetch(`${BASE}${url}`, {
    method,
    headers,
    body: data ? JSON.stringify(data) : undefined
  })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export const api = {
  auth: {
    login: async ({ identifier, password }) => http('POST', '/auth/login', { identifier, password }),
    me: async () => http('GET', '/auth/me')
  },
  courses: {
    list: async (params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/courses${qs}`)
    },
    get: async (id) => http('GET', `/courses/${id}`),
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
  },
  alerts: {
    list: async () => http('GET', '/alerts'),
    markRead: async (id) => http('POST', `/alerts/${id}/read`)
  },
  profile: {
    get: async () => http('GET', '/profile'),
    update: async (data) => http('PUT', '/profile', data)
  },
  users: {
    list: async (params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/users${qs}`)
    },
    get: async (id) => http('GET', `/users/${id}`),
    delete: async (id) => http('DELETE', `/users/${id}`),
    setStatus: async (id, status) => http('PATCH', `/users/${id}/status`, { status })
  },
  virtualClassroom: {
    listCourses: async () => http('GET', '/aula-virtual/courses'),
    enroll: async (courseId) => http('POST', `/aula-virtual/courses/${courseId}/enroll`),
    listStudents: async (courseId) => http('GET', `/aula-virtual/courses/${courseId}/students`),
    listPosts: async (courseId, params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/aula-virtual/courses/${courseId}/posts${qs}`)
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
