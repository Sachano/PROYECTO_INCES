import React, {useEffect, useState} from 'react'
import Header from '../../../shared/components/Header.jsx'
import { api } from '../../../services/api.js'

export default function Perfil(){
  const [form, setForm] = useState({name:'', username:'', email:'', bio:'', avatarUrl:''})
  const [saving, setSaving] = useState(false)

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
            <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} />
          </div>
          <div className="form-row">
            <label>Usuario</label>
            <input value={form.username} onChange={e=>setForm({...form,username:e.target.value})} />
          </div>
          <div className="form-row">
            <label>Email</label>
            <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} />
          </div>
          <div className="form-row">
            <label>Bio</label>
            <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={4} />
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
