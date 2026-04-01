import React, { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import api from '../../../services/api'

// Security questions available
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

// INCES Locations
const LOCATIONS = [
  { code: 'SC', name: 'San Cristóbal' },
  { code: 'CCS', name: 'Caracas' },
  { code: 'MC', name: 'Maracaibo' },
  { code: 'VAL', name: 'Valencia' },
  { code: 'BARQ', name: 'Barquisimeto' },
  { code: 'MCBO', name: 'Maturín' },
  { code: 'CCC', name: 'Ciudad Bolívar' },
  { code: 'CUM', name: 'Cumaná' },
  { code: 'PTO', name: 'Puerto La Cruz' },
  { code: 'GUAY', name: 'Guayana' },
  { code: 'BARIN', name: 'Barinas' },
  { code: 'MERIDA', name: 'Mérida' },
  { code: 'TRUJ', name: 'Trujillo' },
  { code: 'LARA', name: 'Lara' },
  { code: 'CARABOBO', name: 'Carabobo' },
  { code: 'ARAGUA', name: 'Aragua' },
  { code: 'ANZOATEGUI', name: 'Anzoátegui' },
  { code: 'SUCRE', name: 'Sucre' },
  { code: 'MONAGAS', name: 'Monagas' },
  { code: 'BOLIVAR', name: 'Bolívar' },
]

// Course Areas
const AREAS = [
  { code: 'INF', name: 'Informática' },
  { code: 'TXT', name: 'Textil' },
  { code: 'ELEC', name: 'Electricidad' },
  { code: 'CARP', name: 'Carpintería' },
  { code: 'SOLD', name: 'Soldadura' },
  { code: 'MECL', name: 'Mecánica Ligera (Autos)' },
  { code: 'ADMIN', name: 'Administración' },
  { code: 'CONT', name: 'Contabilidad' },
  { code: 'MARK', name: 'Marketing Digital' },
  { code: 'DIS', name: 'Diseño' },
  { code: 'UX', name: 'Experiencia de Usuario (UX)' },
  { code: 'PROG', name: 'Programación' },
  { code: 'PYTHON', name: 'Python Básico' },
  { code: 'GER', name: 'Gestión de Proyectos' },
  { code: 'ASIST', name: 'Asistente Administrativo' },
  { code: 'RELE', name: 'Reparación de Electrodomésticos' },
]

// Cedula types
const CEDULA_TYPES = ['V', 'J', 'E', 'C', 'G', 'FP']

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
  
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [success, setSuccess] = useState(false)
  const [enrollment, setEnrollment] = useState('')
  const [duplicateErrors, setDuplicateErrors] = useState({
    email: '',
    phone: '',
    emergencyPhone: ''
  })

  function handleChange(e) {
    const { name, value } = e.target
    
    // Apply input restrictions based on field type
    let filteredValue = value
    
    if (name === 'firstName' || name === 'lastName') {
      // Only letters (including accented) and spaces
      filteredValue = value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '')
    } else if (name === 'cedula') {
      // Only numbers
      filteredValue = value.replace(/[^0-9]/g, '')
    } else if (name === 'phone' || name === 'emergencyPhone') {
      // Only numbers
      filteredValue = value.replace(/[^0-9]/g, '')
    }
    
    setFormData(prev => ({ ...prev, [name]: filteredValue }))
    
    // Clear duplicate error when user changes the field
    if (duplicateErrors[name]) {
      setDuplicateErrors(prev => ({ ...prev, [name]: '' }))
    }
  }

  function handleSecurityQuestionChange(index, field, value) {
    // Only allow letters, numbers, and spaces for security question answers
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

  // Check for duplicate data
  async function checkDuplicates() {
    const errors = { email: '', phone: '', emergencyPhone: '' }
    let hasDuplicates = false

    try {
      // Check email
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

      // Check phone
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

      // Check emergency phone
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

  // Generate 6-character verification token (for future use)
  function generateVerificationToken() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
    let token = ''
    for (let i = 0; i < 6; i++) {
      token += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return token
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setBusy(true)

    try {
      // Validation
      if (!formData.firstName || !formData.lastName || !formData.cedula || 
          !formData.email || !formData.phone || !formData.location || !formData.area) {
        setError('Por favor completa todos los campos requeridos')
        setBusy(false)
        return
      }

      // Validate security questions
      const validQuestions = formData.securityQuestions.filter(
        sq => sq.question && sq.answer.trim()
      )
      if (validQuestions.length < 2) {
        setError('Debes seleccionar y responder al menos 2 preguntas de seguridad')
        setBusy(false)
        return
      }

      // Validate cedula format (6-10 digits)
      const cedulaDigits = formData.cedula.replace(/\D/g, '')
      if (cedulaDigits.length < 6 || cedulaDigits.length > 10) {
        setError('La cédula debe tener entre 6 y 10 dígitos')
        setBusy(false)
        return
      }

      // Validate email format
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(formData.email)) {
        setError('Por favor ingresa un correo electrónico válido')
        setBusy(false)
        return
      }

      // Validate phone
      const phoneDigits = formData.phone.replace(/\D/g, '')
      if (phoneDigits.length < 10) {
        setError('El teléfono debe tener al menos 10 dígitos')
        setBusy(false)
        return
      }

      // Check for duplicates
      const hasDuplicates = await checkDuplicates()
      if (hasDuplicates) {
        setError('Por favor corrige los datos duplicados antes de continuar')
        setBusy(false)
        return
      }

      // Generate verification token (for future use - not applied yet)
      const verificationToken = generateVerificationToken()
      console.log('Verification token generated (for future use):', verificationToken)

      const response = await api.post('/auth/register', {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        cedulaType: formData.cedulaType,
        cedula: formData.cedula.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim(),
        emergencyPhone: formData.emergencyPhone.trim(),
        location: formData.location,
        area: formData.area,
        securityQuestions: validQuestions
      })

      if (response.ok) {
        setSuccess(true)
        setEnrollment(response.enrollment || '')
      }
    } catch (err) {
      console.error('Registration error:', err)
      const errorMsg = err?.response?.data?.error
      if (errorMsg === 'USER_ALREADY_EXISTS') {
        setError('Ya existe un usuario con esa cédula o correo electrónico')
      } else if (errorMsg === 'MISSING_REQUIRED_FIELDS') {
        setError('Por favor completa todos los campos requeridos')
      } else if (errorMsg === 'MINIMUM_SECURITY_QUESTIONS') {
        setError('Debes seleccionar al menos 2 preguntas de seguridad')
      } else {
        setError('Error al crear la cuenta. Por favor intenta de nuevo.')
      }
    } finally {
      setBusy(false)
    }
  }

  if (success) {
    return (
      <div className="auth-shell minimal">
        <div className="auth-card minimal-card">
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
              hemos enviado tus credenciales de acceso al correo electrónico<br/>
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
              Por favor revisa tu correo electrónico para ver tu contraseña temporal.<br/>
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
      <div className="auth-card minimal-card">
        <div className="login-brand">
          <img src="/assets/inces-logo.png" alt="INCES" className="login-logo" />
        </div>
        
        <form className="login-form" onSubmit={handleSubmit}>
          <h2>Crear Cuenta</h2>
          
          {/* Personal Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              Información Personal
            </h3>
            
            <div className="input-group">
              <label className="sr-only">Nombres</label>
              <input
                className="input"
                name="firstName"
                value={formData.firstName}
                onChange={handleChange}
                placeholder="Nombres *"
                required
              />
            </div>
            
            <div className="input-group">
              <label className="sr-only">Apellidos</label>
              <input
                className="input"
                name="lastName"
                value={formData.lastName}
                onChange={handleChange}
                placeholder="Apellidos *"
                required
              />
            </div>
            
            <div className="input-group" style={{ display: 'flex', gap: '8px' }}>
              <select
                className="input"
                name="cedulaType"
                value={formData.cedulaType}
                onChange={handleChange}
                style={{ width: '80px', appearance: 'auto' }}
              >
                {CEDULA_TYPES.map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
              <input
                className="input"
                name="cedula"
                value={formData.cedula}
                onChange={handleChange}
                placeholder="Cédula (ej: 12345678) *"
                required
                style={{ flex: 1 }}
              />
            </div>
          </div>

          {/* Contact Information */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              Información de Contacto
            </h3>
            
            <div className="input-group">
              <label className="sr-only">Correo Electrónico</label>
              <input
                className="input"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Correo Electrónico *"
                required
              />
              {duplicateErrors.email && (
                <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                  {duplicateErrors.email}
                </div>
              )}
            </div>
            
            <div className="input-group">
              <label className="sr-only">Teléfono Celular</label>
              <input
                className="input"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Teléfono Celular *"
                required
              />
              {duplicateErrors.phone && (
                <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                  {duplicateErrors.phone}
                </div>
              )}
            </div>
            
            <div className="input-group">
              <label className="sr-only">Teléfono de Emergencia</label>
              <input
                className="input"
                name="emergencyPhone"
                value={formData.emergencyPhone}
                onChange={handleChange}
                placeholder="Teléfono de Emergencia (opcional)"
              />
              {duplicateErrors.emergencyPhone && (
                <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                  {duplicateErrors.emergencyPhone}
                </div>
              )}
            </div>
          </div>

          {/* Location and Area */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              Centro de Estudios
            </h3>
            
            <div className="input-group">
              <label className="sr-only">Sede / Ubicación</label>
              <select
                className="input"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                style={{ appearance: 'auto' }}
              >
                <option value="">Selecciona la Sede *</option>
                {LOCATIONS.map(loc => (
                  <option key={loc.code} value={loc.code}>
                    {loc.name} ({loc.code})
                  </option>
                ))}
              </select>
            </div>
            
            <div className="input-group">
              <label className="sr-only">Área / Curso</label>
              <select
                className="input"
                name="area"
                value={formData.area}
                onChange={handleChange}
                required
                style={{ appearance: 'auto' }}
              >
                <option value="">Selecciona el Área/Curso *</option>
                {AREAS.map(area => (
                  <option key={area.code} value={area.code}>
                    {area.name} ({area.code})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Security Questions */}
          <div style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
              Preguntas de Seguridad (Mínimo 2) *
            </h3>
            
            {formData.securityQuestions.map((sq, index) => (
              <div key={index} style={{ marginBottom: '15px' }}>
                <select
                  className="input"
                  value={sq.question}
                  onChange={(e) => handleSecurityQuestionChange(index, 'question', e.target.value)}
                  style={{ appearance: 'auto', marginBottom: '8px' }}
                >
                  <option value="">Pregunta {index + 1} *</option>
                  {SECURITY_QUESTIONS.map(q => (
                    <option key={q.id} value={q.question}>
                      {q.question}
                    </option>
                  ))}
                </select>
                <input
                  className="input"
                  value={sq.answer}
                  onChange={(e) => handleSecurityQuestionChange(index, 'answer', e.target.value)}
                  placeholder={`Respuesta a pregunta ${index + 1} *`}
                  disabled={!sq.question}
                />
              </div>
            ))}
          </div>

          {error && <div className="form-error">{error}</div>}

          <button 
            className="btn primary full" 
            type="submit" 
            disabled={busy || !formData.firstName || !formData.lastName || !formData.cedula || !formData.email || !formData.phone || !formData.location || !formData.area}
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
