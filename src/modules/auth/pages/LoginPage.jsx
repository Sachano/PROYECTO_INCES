import React, { useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { IoIdCardOutline, IoLockClosedOutline, IoEyeOutline, IoEyeOffOutline, IoLogInOutline } from 'react-icons/io5'

export default function LoginPage(){
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || '/'

  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
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
      setError('Credenciales inválidas. Prueba con cédula o correo y clave inces1.')
    }finally{
      setBusy(false)
    }
  }

  return (
    <div className="auth-shell">
      <div className="auth-card">
        <div className="auth-panel">
          <div className="auth-hero">
            <h1>INCES</h1>
            <p>Plataforma SACHANO · Cursos, aula virtual y gestión por roles.</p>
          </div>
          <div className="auth-body">
            <h2 className="auth-title">Iniciar sesión</h2>
            <p className="auth-sub">Ingresa tu cédula (ej: V-12345678) o correo institucional.</p>

            <form onSubmit={onSubmit} style={{ display: 'grid', gap: 12, marginTop: 14 }}>
              <label className="field">
                <span className="field-label">Identificador</span>
                <div className="field-control">
                  <span className="field-ico" aria-hidden><IoIdCardOutline /></span>
                  <input
                    className="input"
                    value={identifier}
                    onChange={e => setIdentifier(e.target.value)}
                    placeholder="V-12345678 o correo@inces.gob.ve"
                    autoFocus
                  />
                </div>
              </label>

              <label className="field">
                <span className="field-label">Clave</span>
                <div className="field-control">
                  <span className="field-ico" aria-hidden><IoLockClosedOutline /></span>
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Tu clave"
                  />
                  <span className="pass-toggle">
                    <button className="icon-btn" type="button" onClick={() => setShowPass(v => !v)} aria-label={showPass ? 'Ocultar clave' : 'Mostrar clave'}>
                      {showPass ? <IoEyeOffOutline /> : <IoEyeOutline />}
                    </button>
                  </span>
                </div>
              </label>

              {error && <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{error}</div>}

              <div className="auth-actions">
                <div className="auth-hint">Acceso seguro con roles: base · admin · master</div>
                <button className="btn primary" disabled={busy || !identifier.trim() || !password}>
                  <span className="btn-ico"><IoLogInOutline /></span>
                  {busy ? 'Validando…' : 'Entrar'}
                </button>
              </div>

              <div className="auth-samples">
                <div style={{ fontWeight: 900, marginBottom: 6, color: 'var(--dark)' }}>Usuarios de prueba</div>
                <div><b>Estudiante:</b> ana.perez@inces.gob.ve / V-12345678</div>
                <div><b>Admin:</b> carlos.gomez@inces.gob.ve / V-23456789</div>
                <div><b>Master:</b> maria.rodriguez@inces.gob.ve / V-34567890</div>
                <div style={{ marginTop: 6 }}><b>Clave:</b> inces1.</div>
              </div>
            </form>
          </div>
        </div>

        <div className="auth-panel">
          <div className="auth-hero">
            <h1>Accede rápido</h1>
            <p>Explora cursos, gestiona usuarios y trabaja en el aula virtual con una interfaz moderna y consistente.</p>
          </div>
          <div className="auth-body">
            <div className="card" style={{ padding: 14, background: 'rgba(16,24,40,0.02)' }}>
              <div style={{ fontWeight: 950 }}>Consejos</div>
              <ul style={{ margin: '10px 0 0', paddingLeft: 18, color: 'var(--muted)', display: 'grid', gap: 6 }}>
                <li>Usa el menú para navegar por módulos.</li>
                <li>El rol master administra usuarios y asignaciones.</li>
                <li>Admin publica contenido/tareas; base entrega en PDF.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
