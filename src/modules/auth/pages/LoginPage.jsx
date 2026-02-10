import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'

export default function LoginPage(){
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    setBusy(true)
    try{
      await login(identifier, password)
      navigate(from, { replace: true })
    }catch(err){
      setError('Credenciales inválidas')
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell minimal">
      <div className="auth-card minimal-card">
        <div className="login-brand">INCES</div>
        <form className="login-form" onSubmit={onSubmit}>
          <h2>Iniciar sesión</h2>
          <div className="input-group">
            <label className="sr-only">Correo o cédula</label>
            <input
              className="input"
              value={identifier}
              onChange={e => setIdentifier(e.target.value)}
              placeholder="Correo o cédula"
              autoFocus
            />
          </div>

          <div className="input-group">
            <label className="sr-only">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña"
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <button className="btn primary full" type="submit" disabled={busy || !identifier.trim() || !password}>
            {busy ? 'Entrando…' : 'Entrar'}
          </button>

          <div className="login-links">
            <a href="#/auth/forgot">¿Olvidaste tu contraseña?</a>
            <a href="#/auth/register">Crear cuenta</a>
          </div>
        </form>
      </div>
    </div>
  )
}
