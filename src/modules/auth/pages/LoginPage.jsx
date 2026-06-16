import React, { useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { sanitizeIdentifierInput, isLikelyCedula, validateCedulaFormat, validateEmailFormat } from '../../../shared/utils.js'

export default function LoginPage(){
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)

  // use shared sanitize helper

  function handleIdentifierChange(e){
    const clean = sanitizeIdentifierInput(e.target.value)
    setIdentifier(clean)
  }

  // derive identifier type for badge: show only when user types
  // - series of digits -> 'cedula'
  // - otherwise -> 'email'
  const idTrim = identifier.trim()
  const idType = idTrim === '' ? '' : (isLikelyCedula(idTrim) ? 'cedula' : 'email')

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    setBusy(true)
    try{
      // Basic client-side validation: either a valid email (must include @ and .com) or a cedula (only digits)
      const id = identifier.trim()
      if(isLikelyCedula(id)){
        if(!validateCedulaFormat(id)){
          setError('Cédula inválida. Debe contener entre 6 y 10 dígitos.')
          setBusy(false)
          return
        }
      }else{
        if(!validateEmailFormat(id)){
          setError('Correo inválido. Debe incluir @ y un dominio válido (ej. .com, .ve)')
          setBusy(false)
          return
        }
      }
      await login(identifier, password)
      navigate(from, { replace: true })
    }catch(err){
      console.error('Login error', err)
      const msg = err?.body?.message || err?.body?.error || err?.message || 'Credenciales inválidas'
      setError(msg)
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell minimal">
      <div className="auth-card minimal-card">
        {/* replace text brand with logo image; put file in public/assets/inces-logo.png */}
        <div className="login-brand">
          <img src="/assets/inces-logo.png" alt="INCES" className="login-logo" />
        </div>
        <form className="login-form" onSubmit={onSubmit}>
          <h2>Iniciar sesión</h2>
          <div className="input-group input-with-badge">
            <label className="sr-only">Correo o cédula</label>
            <input
              className="input"
              value={identifier}
              onChange={handleIdentifierChange}
              placeholder="Correo o cédula"
              autoFocus
            />
            {idType && (
              <div className={`id-badge ${idType === 'email' ? 'badge-email' : 'badge-cedula'}`}>
                {idType === 'email' ? 'Correo' : 'Cédula'}
              </div>
            )}
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
            <Link to="/auth/forgot">¿Olvidaste tu contraseña?</Link>
            <Link to="/auth/register">Crear cuenta</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
