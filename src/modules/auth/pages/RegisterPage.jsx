import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api, { getApiErrorMessage, logApiError } from '../../../services/api'
import { validateField, VALIDATION_RULES } from '../../../shared/utils'
import PersonalInfoSection from '../components/PersonalInfoSection.jsx'
import LocationAreaSection from '../components/LocationAreaSection.jsx'
import SecurityQuestionsSection from '../components/SecurityQuestionsSection.jsx'

const SECURITY_QUESTIONS = [
  { id: 'mascota', question: '¿Cómo se llama tu mascota?' },
  { id: 'abuela_materna', question: '¿Cómo se llama tu abuela materna?' },
  { id: 'abuela_paterna', question: '¿Cómo se llama tu abuela paterna?' },
  { id: 'lugar_nacimiento', question: '¿En qué hospital o lugar naciste?' },
  { id: 'colegio_bachiller', question: '¿En qué colegio te graduaste de bachiller?' },
  { id: 'primaria', question: '¿En qué escuela te graduaste de primaria?' },
  { id: 'ciudad_favorita', question: '¿Cuál es tu ciudad favorita?' },
  { id: 'comida_favorita', question: '¿Cuál es tu comida favorita?' },
  { id: 'pelicula_favorita', question: '¿Cuál es tu película favorita?' },
  { id: 'musica_favorita', question: '¿Cuál es tu género musical favorito?' },
]

export default function RegisterPage() {
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    cedulaType: 'V',
    cedula: '',
    email: '',
    phone: '',
    emergencyPhone: '',
    location: '',
    area: '',
    securityQuestions: [
      { question: '', answer: '' },
      { question: '', answer: '' }
    ]
  })

  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [enrollment, setEnrollment] = useState('')
  const [duplicateErrors, setDuplicateErrors] = useState({})
  const [securityError, setSecurityError] = useState('')

  function handleChange(e) {
    const { name, value } = e.target
    let filteredValue = value

    if (name === 'firstName' || name === 'lastName') {
      filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    } else if (name === 'cedula') {
      filteredValue = value.replace(/[^0-9]/g, '')
    } else if (name === 'phone' || name === 'emergencyPhone') {
      filteredValue = value.replace(/[^0-9]/g, '')
    }

    setFormData(prev => ({ ...prev, [name]: filteredValue }))

    if (duplicateErrors[name]) {
      setDuplicateErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function handleSecurityQuestionChange(index, field, value) {
    let filteredValue = value
    if (field === 'answer') {
      filteredValue = value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    }

    setFormData(prev => {
      const newQuestions = [...prev.securityQuestions]
      newQuestions[index] = { ...newQuestions[index], [field]: filteredValue }
      return { ...prev, securityQuestions: newQuestions }
    })
  }

  async function checkDuplicates() {
    const errors = { cedula: '', email: '', phone: '', emergencyPhone: '' }
    let hasDuplicates = false

    try {
      if (formData.cedula) {
        const cedulaRes = await api.post('/auth/check-duplicate', {
          field: 'cedula',
          value: formData.cedulaType + formData.cedula.trim()
        })
        if (cedulaRes.exists) {
          errors.cedula = 'Esta cédula ya está registrada'
          hasDuplicates = true
        }
      }

      if (formData.email) {
        const emailRes = await api.post('/auth/check-duplicate', {
          field: 'email',
          value: formData.email.trim().toLowerCase()
        })
        if (emailRes.exists) {
          errors.email = 'Este correo electrónico ya está registrado'
          hasDuplicates = true
        }
      }

      if (formData.phone) {
        const phoneRes = await api.post('/auth/check-duplicate', {
          field: 'phone',
          value: formData.phone.trim()
        })
        if (phoneRes.exists) {
          errors.phone = 'Este número de teléfono ya está registrado'
          hasDuplicates = true
        }
      }

      if (formData.emergencyPhone) {
        const emergencyRes = await api.post('/auth/check-duplicate', {
          field: 'emergencyPhone',
          value: formData.emergencyPhone.trim()
        })
        if (emergencyRes.exists) {
          errors.emergencyPhone = 'Este teléfono de emergencia ya está registrado'
          hasDuplicates = true
        }
      }
    } catch (err) {
      console.error('Error checking duplicates:', err)
    }

    setDuplicateErrors(errors)
    return hasDuplicates
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setSecurityError('')
    setBusy(true)

    try {
      if (!formData.firstName || !formData.lastName || !formData.cedula ||
          !formData.email || !formData.phone || !formData.location || !formData.area) {
        setError('Por favor completa todos los campos requeridos')
        setBusy(false)
        return
      }

      const validQuestions = formData.securityQuestions.filter(
        sq => sq.question && sq.answer.trim()
      )
      if (validQuestions.length < 2) {
        setSecurityError('Debes seleccionar y responder al menos 2 preguntas de seguridad')
        setBusy(false)
        return
      }

      const cedulaDigits = formData.cedula.replace(/\D/g, '')
      if (cedulaDigits.length < 6 || cedulaDigits.length > 10) {
        setError('La cédula debe tener entre 6 y 10 dígitos')
        setBusy(false)
        return
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingresa un correo electrónico válido')
        setBusy(false)
        return
      }

      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length < 10) {
        setError('El teléfono debe tener al menos 10 dígitos')
        setBusy(false)
        return
      }

      if (password.length < 8) {
        setError('La contraseña debe tener al menos 8 caracteres')
        setBusy(false)
        return
      }

      if (password !== confirmPassword) {
        setError('Las contraseñas no coinciden')
        setBusy(false)
        return
      }

      const hasDuplicates = await checkDuplicates()
      if (hasDuplicates) {
        setError('Alguna de la información dada ya está registrada')
        setBusy(false)
        return
      }

      if (formData.phone && formData.emergencyPhone && formData.phone.trim() === formData.emergencyPhone.trim()) {
        setError('El teléfono personal no puede ser igual al teléfono de emergencia')
        setBusy(false)
        return
      }

      const response = await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        cedulaType: formData.cedulaType,
        cedula: formData.cedula.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        password,
        location: formData.location,
        area: formData.area,
        securityQuestions: validQuestions
      })

      if (response.ok) {
        setSuccess(true)
        setEnrollment(response.enrollment || '')
      }
    } catch (err) {
      logApiError(err, 'RegisterPage')
      setError(getApiErrorMessage(err, 'Error al crear la cuenta. Por favor intenta de nuevo.'))
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="auth-shell minimal">
        <div className="auth-card minimal-card register-card">
          <div className="login-brand">
            <img src="/assets/inces-logo.png" alt="INCES" className="login-logo" />
          </div>

          <div style={{ textAlign: 'center', padding: '20px 0' }}>
            <div style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              background: '#4caf50',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <span style={{ color: 'white', fontSize: '30px' }}>✓</span>
            </div>

            <h2 style={{ color: '#1a1a2e', marginBottom: '15px' }}>¡Cuenta creada exitosamente!</h2>

            <p style={{ color: '#4a4a4a', marginBottom: '20px' }}>
              hemos enviado tus credenciales de acceso al correo electrónico<br />
              <strong>{formData.email}</strong>
            </p>

            <div style={{
              background: '#f8f9fa',
              padding: '15px',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p style={{ color: '#4a4a4a', fontSize: '14px', margin: '0 0 5px 0' }}>
                Tu matrícula es:
              </p>
              <p style={{
                color: '#e94560',
                fontSize: '24px',
                fontWeight: 'bold',
                margin: '0'
              }}>
                {enrollment}
              </p>
            </div>

            <p style={{ color: '#888', fontSize: '14px', marginBottom: '20px' }}>
              Por favor revisa tu correo electrónico para ver tu contraseña temporal.<br />
              Te recomendamos cambiar tu contraseña al iniciar sesión.
            </p>

            <Link
              to="/login"
              className="btn primary full"
              style={{ textDecoration: 'none', display: 'inline-block' }}
            >
              Ir a Iniciar sesión
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="auth-shell minimal">
      <div className="auth-card minimal-card register-card">
        <div className="login-brand">
          <img src="/assets/inces-logo.png" alt="INCES" className="login-logo" />
        </div>

        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Crear Cuenta</h2>

          <PersonalInfoSection
            formData={{
              firstName: formData.firstName,
              lastName: formData.lastName,
              cedulaType: formData.cedulaType,
              cedula: formData.cedula,
              email: formData.email,
              phone: formData.phone,
              emergencyPhone: formData.emergencyPhone,
              charLimitErrors: {},
              duplicateErrors
            }}
            onChange={handleChange}
            errors={{}}
          />

          <LocationAreaSection
            location={formData.location}
            area={formData.area}
            onChange={handleChange}
            errors={{}}
          />

          <SecurityQuestionsSection
            questions={formData.securityQuestions}
            onChange={handleSecurityQuestionChange}
            validationError={securityError}
          />

          <div className="input-group">
            <label className="sr-only">Contraseña</label>
            <input
              className="input"
              type="password"
              name="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="Contraseña *"
              required
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
              name="confirmPassword"
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

          <button
            className="btn primary full"
            type="submit"
            disabled={busy || !formData.firstName || !formData.lastName || !formData.cedula || !formData.email || !formData.phone || !formData.location || !formData.area || !password || !confirmPassword}
          >
            {busy ? 'Creando cuenta...' : 'Crear Cuenta'}
          </button>

          <div className="login-links">
            <Link to="/login">¿Ya tienes cuenta? Iniciar sesión</Link>
          </div>
        </form>
      </div>
    </div>
  )
}