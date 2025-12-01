import React, {useState} from 'react'
import Header from '../components/Header.jsx'

export default function Perfil(){
  const [form, setForm] = useState({name:'Juan Perez', email:'juan@example.com', bio:'Apasionado por la formación.'})

  function save(e){
    e.preventDefault()
    alert('Perfil guardado (mock): ' + JSON.stringify(form))
  }

  return (
    <div className="page-root">
      <Header />
      <main className="page-content">
        <h2>Mi Perfil</h2>
        <form onSubmit={save} style={{display:'grid',gap:12,maxWidth:640}}>
          <label>Nombre <input value={form.name} onChange={e=>setForm({...form,name:e.target.value})} /></label>
          <label>Email <input value={form.email} onChange={e=>setForm({...form,email:e.target.value})} /></label>
          <label>Bio <textarea value={form.bio} onChange={e=>setForm({...form,bio:e.target.value})} rows={4} /></label>
          <div style={{display:'flex',gap:12}}>
            <button className="btn primary" type="submit">Guardar</button>
            <button className="btn ghost" type="button" onClick={()=>alert('Cambios descartados')}>Descartar</button>
          </div>
        </form>
      </main>
    </div>
  )
}
