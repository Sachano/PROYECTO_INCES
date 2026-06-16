import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function RequireAuth(){
  const { user, loading } = useAuth()
  const location = useLocation()

  if(loading) return <div style={{ padding: 18 }}>Cargando…</div>
  if(!user) return <Navigate to="/login" replace state={{ from: location }} />
  return <Outlet />
}
