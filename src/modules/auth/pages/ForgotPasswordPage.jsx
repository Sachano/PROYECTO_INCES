import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../../services/api.js'
import { getCharCountDisplay, validateField, VALIDATION_RULES } from '../../../shared/utils'

export default function ForgotPasswordPage(){
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [cedula, setCedula] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  const [fieldErrors, setFieldErrors] = useState({ email: '', cedula: '' })

  function sanitizeEmailInput(v){
    if(!v) return ''
    return v.replace(/[^a-zA-Z0-9@.\-_+]/g, '')
  }

  function sanitizeCedulaInput(v){
    if(!v) return ''
    return v.replace(/[^0-9-]/g, '')
  }

  function handleEmailChange(value) {
    const sanitized = sanitizeEmailInput(value)
    setEmail(sanitized)
    // Validate
    const validation = validateField('email', sanitized)
    let errorMsg = validation.error
    if (sanitized && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(sanitized)) {
      errorMsg = 'Debe contener @ y un dominio válido'
    }
    setFieldErrors(prev => ({ ...prev, email: errorMsg }))
  }

  function handleCedulaChange(value) {
    const sanitized = sanitizeCedulaInput(value)
    setCedula(sanitized)
    // Validate
    const digits = sanitized.replace(/\D/g, '')
    let errorMsg = ''
    if (digits.length > 0 && (digits.length < 6 || digits.length > 10)) {
      errorMsg = 'La cédula debe tener entre 6 y 10 dígitos'
    }
    setFieldErrors(prev => ({ ...prev, cedula: errorMsg }))
  }

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    setMessage('')
    setBusy(true)
    try{
      if(!email && !cedula){
        setError('Ingresa correo o cédula')
        setBusy(false)
        return
      }
      const res = await api.auth.forgot({ email, cedula })
      if(res && res.resetLink){
        setMessage('Se ha enviado un enlace a tu correo electrónico.')
      }else{
        setMessage('Si el usuario existe, se ha enviado un email para restablecer la contraseña.')
      }
      setBusy(false)
    }catch(err){
      setError('Error al solicitar restablecimiento')
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell minimal">
      <div className="auth-card minimal-card">
        {/* Back button - white arrow, transparent background, thin black border */}
        <button 
          className="back-btn"
          onClick={() => navigate('/login')}
          type="button"
          aria-label="Volver al login"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>

        <form className="login-form" onSubmit={onSubmit}>
          <h2>Recuperar contraseña</h2>
          <p className="auth-sub">Ingrese su correo o cédula para enviar instrucciones de restablecimiento.</p>

          <div className="input-group">
            <label className="sr-only">Correo</label>
            <input
              className="input"
              value={email}
              onChange={e => handleEmailChange(e.target.value)}
              placeholder="Correo electrónico"
            />
          </div>
          {email.length > 0 && (
            <div style={{
              fontSize: '11px',
              marginTop: '4px',
              textAlign: 'right',
              color: email.length > VALIDATION_RULES.email.maxLength ? '#e94560' : '#888'
            }}>
              {email.length}/{VALIDATION_RULES.email.maxLength} caracteres
            </div>
          )}
          {fieldErrors.email && (
            <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
              {fieldErrors.email}
            </div>
          )}

          <div className="input-group">
            <label className="sr-only">Cédula</label>
            <input
              className="input"
              value={cedula}
              onChange={e => handleCedulaChange(e.target.value)}
              placeholder="Número de cédula"
            />
          </div>
          {cedula.length > 0 && (
            <div style={{
              fontSize: '11px',
              marginTop: '4px',
              textAlign: 'right',
              color: '#888'
            }}>
              {cedula.replace(/\D/g, '').length} dígitos
            </div>
          )}
          {fieldErrors.cedula && (
            <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
              {fieldErrors.cedula}
            </div>
          )}

          {error && <div className="form-error">{error}</div>}
          {message && <div className="auth-samples" style={{marginTop:8}}>{message}</div>}

          <button className="btn primary full" type="submit" disabled={busy || (!email && !cedula)}>
            {busy ? 'Enviando…' : 'Enviar instrucciones'}
          </button>

          <div className="login-links">
            <Link to="/login">Volver al login</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
