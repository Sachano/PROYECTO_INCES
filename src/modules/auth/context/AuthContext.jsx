import React, { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../../../services/api.js'

const AuthContext = createContext(null)

const TOKEN_KEY = 'auth_token'
const USER_KEY = 'auth_user'

function readSession(){
  try{
    const token = sessionStorage.getItem(TOKEN_KEY) || ''
    const userRaw = sessionStorage.getItem(USER_KEY)
    const user = userRaw ? JSON.parse(userRaw) : null
    return { token, user }
  }catch{
    return { token: '', user: null }
  }
}

function writeSession({ token, user }){
  sessionStorage.setItem(TOKEN_KEY, token)
  sessionStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearSession(){
  sessionStorage.removeItem(TOKEN_KEY)
  sessionStorage.removeItem(USER_KEY)
}

export function AuthProvider({ children }){
  const [token, setToken] = useState('')
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const s = readSession()
    setToken(s.token)
    setUser(s.user)

    async function validate(){
      if(!s.token){
        setLoading(false)
        return
      }
      try{
        const res = await api.auth.me()
        setUser(res.user)
        writeSession({ token: s.token, user: res.user })
      }catch{
        clearSession()
        setToken('')
        setUser(null)
      }finally{
        setLoading(false)
      }
    }

    validate()
  }, [])

  async function login(identifier, password){
    const res = await api.auth.login({ identifier, password })
    setToken(res.token)
    setUser(res.user)
    writeSession({ token: res.token, user: res.user })
    return res.user
  }

  function logout(){
    clearSession()
    setToken('')
    setUser(null)
  }

  const value = useMemo(() => ({ token, user, loading, login, logout }), [token, user, loading])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(){
  const ctx = useContext(AuthContext)
  if(!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
