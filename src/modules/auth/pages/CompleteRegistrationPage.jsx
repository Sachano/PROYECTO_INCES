import React, { useState } from 'react'
import { useParams, Link } from 'react-router-dom'

export default function CompleteRegistrationPage(){
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)

  async function handleSubmit(e){
    e.preventDefault()
    setError('')

    if(!password || password.length < 8){
      setError('La contraseña debe tener al menos 8 caracteres')
      return
    }
    if(password !== confirmPassword){
      setError('Las contraseñas no coinciden')
      return
    }

    setBusy(true)
    try{
      const res = await fetch('/api/auth/complete-invitation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password })
      })
      const data = await res.json()
      if(!res.ok){
        setError(data.message || data.error || 'Error al completar el registro')
        return
      }
      setSuccess(true)
    }catch(err){
      setError('Error de conexión. Intenta de nuevo.')
    }finally{
      setBusy(false)
    }
  }

  if(success){
    return (
      <div className="auth-shell minimal">
        <div className="auth-card minimal-card">
          <div className="login-brand">
            <img src="/assets/inces-logo.png" alt="INCES" className="login-logo" />
          </div>
          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '60px', height: '60px', borderRadius: '50%',
              background: '#4caf50', display: 'flex', alignItems: 'center',
              justifyContent: 'center', margin: '0 auto 20px'
            }}>
              <span style={{ color: 'white', fontSize: '30px' }}>✓</span>
            </div>
            <h2 style={{ color: '#1a1a2e', marginBottom: '15px' }}>¡Registro completado!</h2>
            <p style={{ color: '#4a4a4a', marginBottom: '20px' }}>
              Tu cuenta ha sido activada exitosamente.<br />
              Ya puedes iniciar sesión con tu contraseña.
            </p>
            <Link to="/login" className="btn primary full" style={{ textDecoration: 'none', display: 'inline-block' }}>
              Ir a Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell minimal">
      <div className="auth-card minimal-card">
        <div className="login-brand">
          <img src="/assets/inces-logo.png" alt="INCES" className="login-logo" />
        </div>
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Completar registro</h2>
          <p className="auth-sub">Establece tu contraseña para activar tu cuenta.</p>

          <div className="input-group">
            <label className="sr-only">Contraseña</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña *"
              required
              minLength={8}
            />
          </div>
          {password.length > 0 && password.length < 8 && (
            <div style={{ fontSize: '11px', color: '#e94560', marginTop: '4px' }}>
              La contraseña debe tener al menos 8 caracteres
            </div>
          )}

          <div className="input-group">
            <label className="sr-only">Confirmar Contraseña</label>
            <input
              className="input"
              type="password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              placeholder="Confirmar Contraseña *"
              required
            />
          </div>
          {confirmPassword.length > 0 && password !== confirmPassword && (
            <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
              Las contraseñas no coinciden
            </div>
          )}

          {error && <div className="form-error">{error}</div>}

          <button className="btn primary full" type="submit" disabled={busy || !password || !confirmPassword}>
            {busy ? 'Activando cuenta...' : 'Activar cuenta'}
          </button>
        </form>
      </div>
    </div>
  )
}