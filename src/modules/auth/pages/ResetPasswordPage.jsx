import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../../services/api.js'

export default function ResetPasswordPage(){
  const { token } = useParams()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [showTips, setShowTips] = useState(false)

  useEffect(() => {
    if(!token) setError('Token no presente en la URL.')
  }, [token])

  async function onSubmit(e){
    e.preventDefault()
    setError('')
    // enforce frontend password rules to match backend: min 8 chars, must include letter and number
    if(!password || password.length < 8){
      setError('La contraseña debe tener al menos 8 caracteres.')
      return
    }
    if(!/[A-Za-z]/.test(password) || !/[0-9]/.test(password)){
      setError('La contraseña debe incluir al menos una letra y un número.')
      return
    }
    if(password !== confirm){
      setError('Las contraseñas no coinciden.')
      return
    }
    setBusy(true)
    try{
      await api.auth.reset({ token, newPassword: password })
      setMessage('Contraseña restablecida. Redirigiendo al login...')
      setTimeout(() => navigate('/login'), 1800)
    }catch(err){
      // prefer server-provided message when available
      const serverMsg = err && err.body && err.body.message
      setError(serverMsg || 'No se pudo restablecer la contraseña. Token inválido o expirado.')
    }finally{
      setBusy(false)
    }
  }

  function computeStrength(pw){
    if(!pw) return { score: 0, label: 'Vacía' }
    let score = 0
    if(pw.length >= 8) score += 40
    if(/[A-Z]/.test(pw)) score += 15
    if(/[a-z]/.test(pw)) score += 15
    if(/[0-9]/.test(pw)) score += 15
    if(/[^A-Za-z0-9]/.test(pw)) score += 15
    if(score > 100) score = 100
    const label = score < 40 ? 'Débil' : (score < 75 ? 'Medio' : 'Fuerte')
    return { score, label }
  }

  return (
    <div className="auth-shell minimal">
      <div className="auth-card minimal-card">
        <form className="login-form" onSubmit={onSubmit}>
          <h2>Restablecer contraseña</h2>
          {error && <div className="form-error">{error}</div>}
          {message && <div className="auth-samples">{message}</div>}

          <div className="input-group">
            <label className="sr-only">Nueva contraseña</label>
            <div className="pw-input-wrapper">
              <input
                className="input"
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Nueva contraseña"
                onFocus={() => setShowTips(true)}
                onBlur={() => setShowTips(false)}
                aria-describedby="pw-recs"
              />
              <button
                type="button"
                className="pw-info-btn"
                aria-label="Recomendaciones para contraseña"
                onMouseEnter={() => setShowTips(true)}
                onMouseLeave={() => setShowTips(false)}
              >i</button>
              {showTips && (
                <div id="pw-recs" className="pw-tooltip" role="status">
                  <strong>Recomendaciones</strong>
                  <ul>
                    <li>Mínimo 8 caracteres</li>
                    <li>Incluye letras y números</li>
                    <li>Usa mayúsculas y símbolos para mayor seguridad</li>
                  </ul>
                </div>
              )}
            </div>
            <div className="pw-strength">
              {(() => {
                const s = computeStrength(password)
                return (
                  <>
                    <div className="pw-bar" aria-hidden>
                      <div className="pw-fill" style={{ width: `${s.score}%`, background: s.score < 40 ? '#e74c3c' : s.score < 75 ? 'linear-gradient(90deg,#f39c12,#f6c85f)' : 'linear-gradient(90deg,#27ae60,#2ecc71)' }} />
                    </div>
                    <div className="pw-label">{s.label} — {s.score}%</div>
                  </>
                )
              })()}
            </div>
          </div>

          <div className="input-group">
            <label className="sr-only">Confirmar contraseña</label>
            <input className="input" type="password" value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Confirmar contraseña" />
          </div>

          <button className="btn primary full" type="submit" disabled={busy || !token}>
            {busy ? 'Procesando…' : 'Restablecer contraseña'}
          </button>
        </form>
      </div>
    </div>
  )
}
