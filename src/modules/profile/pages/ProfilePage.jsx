import React, {useEffect, useState} from 'react'
import Header from '../../../shared/components/Header.jsx'
import { api } from '../../../services/api.js'
import { getCharCountDisplay, validateField, VALIDATION_RULES } from '../../../shared/utils'

export default function Perfil(){
  const [form, setForm] = useState({name:'', username:'', email:'', bio:'', avatarUrl:''})
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ name: '', username: '', email: '', bio: '' })

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
    // Validate
    let fieldName = field
    if (field === 'username') fieldName = 'userName'
    if (field === 'email') fieldName = 'userEmail'
    const validation = validateField(fieldName, value)
    let errorMsg = validation.error
    if (field === 'email' && value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      errorMsg = 'Debe contener @ y un dominio válido'
    }
    setFieldErrors(prev => ({ ...prev, [field]: errorMsg }))
  }

  useEffect(() => {
    api.profile.get().then(p => setForm({
      name: p.name || '', username: p.username || '', email: p.email || '', bio: p.bio || '', avatarUrl: p.avatarUrl || ''
    }))
  }, [])

  async function save(e){
    e.preventDefault()
    setSaving(true)
    const updated = await api.profile.update(form)
    setForm(f => ({...f, ...updated}))
    setSaving(false)
    alert('Perfil guardado')
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <h2>Mi Perfil</h2>
        <div className="profile-header">
          <div className="avatar-circle">{form.name ? form.name[0] : 'U'}</div>
          <div className="profile-stats">
            <div><strong>128</strong><span>Seguidores</span></div>
            <div><strong>56</strong><span>Siguiendo</span></div>
            <div><strong>3</strong><span>Cursos</span></div>
          </div>
        </div>

        <form onSubmit={save} className="profile-form">
          <div className="form-row">
            <label>Nombre</label>
            <input value={form.name} onChange={e=>handleChange('name', e.target.value)} />
            {form.name.length > 0 && (
              <div style={{
                fontSize: '11px',
                marginTop: '4px',
                textAlign: 'right',
                color: form.name.length > VALIDATION_RULES.name.maxLength ? '#e94560' : '#888'
              }}>
                {form.name.length}/{VALIDATION_RULES.name.maxLength} caracteres
              </div>
            )}
            {fieldErrors.name && (
              <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                {fieldErrors.name}
              </div>
            )}
          </div>
          <div className="form-row">
            <label>Usuario</label>
            <input value={form.username} onChange={e=>handleChange('username', e.target.value)} />
            {form.username.length > 0 && (
              <div style={{
                fontSize: '11px',
                marginTop: '4px',
                textAlign: 'right',
                color: form.username.length > VALIDATION_RULES.userName.maxLength ? '#e94560' : '#888'
              }}>
                {form.username.length}/{VALIDATION_RULES.userName.maxLength} caracteres
              </div>
            )}
            {fieldErrors.username && (
              <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                {fieldErrors.username}
              </div>
            )}
          </div>
          <div className="form-row">
            <label>Email</label>
            <input value={form.email} onChange={e=>handleChange('email', e.target.value)} />
            {form.email.length > 0 && (
              <div style={{
                fontSize: '11px',
                marginTop: '4px',
                textAlign: 'right',
                color: form.email.length > VALIDATION_RULES.userEmail.maxLength ? '#e94560' : '#888'
              }}>
                {form.email.length}/{VALIDATION_RULES.userEmail.maxLength} caracteres
              </div>
            )}
            {fieldErrors.email && (
              <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                {fieldErrors.email}
              </div>
            )}
          </div>
          <div className="form-row">
            <label>Bio</label>
            <textarea value={form.bio} onChange={e=>handleChange('bio', e.target.value)} rows={4} />
            {form.bio.length > 0 && (
              <div style={{
                fontSize: '11px',
                marginTop: '4px',
                textAlign: 'right',
                color: form.bio.length > VALIDATION_RULES.bio.maxLength ? '#e94560' : '#888'
              }}>
                {form.bio.length}/{VALIDATION_RULES.bio.maxLength} caracteres
              </div>
            )}
            {fieldErrors.bio && (
              <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
                {fieldErrors.bio}
              </div>
            )}
          </div>
          <div className="actions">
            <button className="btn primary" type="submit" disabled={saving}>{saving ? 'Guardando...' : 'Guardar'}</button>
            <button className="btn ghost" type="button" onClick={()=>window.location.reload()}>Descartar</button>
          </div>
        </form>
      </main>
    </>
  )
}
