import React from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireRole({ roles = [], children }){
  const { user, loading } = useAuth()
  if(loading) return <div style={{ padding: 18 }}>Cargando…</div>

  const role = user?.role
  if(!role || !roles.includes(role)) return <Navigate to="/" replace />

  return children
}
