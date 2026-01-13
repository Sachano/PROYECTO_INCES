const BASE = '/api'

async function http(method, url, data){
  const res = await fetch(`${BASE}${url}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: data ? JSON.stringify(data) : undefined
  })
  if(!res.ok) throw new Error(`HTTP ${res.status}`)
  return await res.json()
}

export const api = {
  courses: {
    list: async (params = {}) => {
      const q = new URLSearchParams(params).toString()
      const qs = q ? `?${q}` : ''
      return await http('GET', `/courses${qs}`)
    },
    get: async (id) => http('GET', `/courses/${id}`)
  },
  alerts: {
    list: async () => http('GET', '/alerts'),
    markRead: async (id) => http('POST', `/alerts/${id}/read`)
  },
  profile: {
    get: async () => http('GET', '/profile'),
    update: async (data) => http('PUT', '/profile', data)
  }
}
