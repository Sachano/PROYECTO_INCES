import React, {useEffect, useRef, useState} from 'react'
import Header from '../../../shared/components/Header.jsx'
import { api } from '../../../services/api.js'
import { getCharCountDisplay, validateField, VALIDATION_RULES } from '../../../shared/utils'

export default function Perfil(){
  const [form, setForm] = useState({name:'', username:'', email:'', bio:'', avatarUrl:''})
  const [saving, setSaving] = useState(false)
  const [fieldErrors, setFieldErrors] = useState({ name: '', username: '', email: '', bio: '' })
  const [avatarFile, setAvatarFile] = useState(null)
  const [avatarPreview, setAvatarPreview] = useState(null)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const fileInputRef = useRef(null)

  function handleChange(field, value) {
    setForm(prev => ({ ...prev, [field]: value }))
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

  function handleAvatarChange(e){
    const file = e.target.files[0]
    if (!file) return
    setAvatarFile(file)
    setAvatarPreview(URL.createObjectURL(file))
  }

  async function handleAvatarUpload(){
    if (!avatarFile) return
    setUploadingAvatar(true)
    try {
      const result = await api.profile.uploadAvatar(avatarFile)
      if (result.avatarUrl) {
        setForm(prev => ({ ...prev, avatarUrl: result.avatarUrl }))
        setAvatarPreview(null)
        setAvatarFile(null)
      }
    } catch (err) {
      alert('Error al subir la foto')
    } finally {
      setUploadingAvatar(false)
    }
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <h2>Mi Perfil</h2>
        <div className="profile-header">
          <div className="avatar-wrapper">
            <div
              className="avatar-circle"
              onClick={() => fileInputRef.current?.click()}
              role="button"
              tabIndex={0}
              onKeyDown={e => e.key === 'Enter' && fileInputRef.current?.click()}
            >
              {avatarPreview ? (
                <img src={avatarPreview} alt="Preview" className="avatar-img" />
              ) : form.avatarUrl ? (
                <img src={form.avatarUrl} alt="Avatar" className="avatar-img" />
              ) : (
                form.name ? form.name[0] : 'U'
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/png,image/jpeg,image/jpg,image/webp"
              className="avatar-input"
              onChange={handleAvatarChange}
            />
            <button
              className="avatar-upload-btn"
              type="button"
              onClick={() => fileInputRef.current?.click()}
              title="Cambiar foto"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>
            </button>
          </div>
          {avatarFile && (
            <div className="avatar-actions">
              <button className="btn primary small" type="button" onClick={handleAvatarUpload} disabled={uploadingAvatar}>
                {uploadingAvatar ? 'Subiendo...' : 'Guardar foto'}
              </button>
              <button className="btn ghost small" type="button" onClick={() => { setAvatarFile(null); setAvatarPreview(null); if(fileInputRef.current) fileInputRef.current.value = '' }}>
                Cancelar
              </button>
            </div>
          )}
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
