import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../../services/api.js'

export default function VerifyEmailPage(){
  const { token } = useParams()
  const [status, setStatus] = useState('loading') // loading | success | error

  useEffect(() => {
    if(!token){
      setStatus('error')
      return
    }
    fetch(`/api/auth/verify-email/${token}`)
      .then(r => r.json())
      .then(data => setStatus(data.ok ? 'success' : 'error'))
      .catch(() => setStatus('error'))
  }, [token])

  return (
    <div className="auth-shell">
      <div className="auth-panel" style={{maxWidth:480,textAlign:'center',padding:40}}>
        {status === 'loading' && (
          <>
            <div style={{fontSize:48,marginBottom:16}}>⏳</div>
            <h2>Verificando tu correo...</h2>
          </>
        )}
        {status === 'success' && (
          <>
            <div style={{fontSize:48,marginBottom:16}}>✅</div>
            <h2>Correo verificado</h2>
            <p style={{color:'var(--muted)',margin:'12px 0 24px'}}>
              Tu cuenta ha sido verificada exitosamente. Ya puedes iniciar sesión.
            </p>
            <Link to="/login" className="btn full">Iniciar sesión</Link>
          </>
        )}
        {status === 'error' && (
          <>
            <div style={{fontSize:48,marginBottom:16}}>❌</div>
            <h2>Enlace inválido o expirado</h2>
            <p style={{color:'var(--muted)',margin:'12px 0 24px'}}>
              El enlace de verificación no es válido o ha expirado.
            </p>
            <Link to="/login" className="btn">Volver al login</Link>
          </>
        )}
      </div>
    </div>
  )
}
