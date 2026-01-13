import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../../../shared/components/Header.jsx'
import { api } from '../../../services/api.js'

export default function CursoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [course, setCourse] = useState(null)
  const [form, setForm] = useState({ name: '', email: '' })
  const [status, setStatus] = useState(null)

  useEffect(() => {
    api.courses.get(id).then(setCourse).catch(() => setCourse({ id, title:'Curso no encontrado', description:'No hay información para este curso.' }))
  }, [id])

  function handleChange(e) {
    const { name, value } = e.target
    setForm(f => ({ ...f, [name]: value }))
  }

  function handleSubmit(e) {
    e.preventDefault()
    // Simular envío (puedes reemplazar por fetch/axios a tu API)
    if (!form.name || !form.email) {
      setStatus({ ok: false, message: 'Por favor completa nombre y correo.' })
      return
    }
    setStatus({ ok: true, message: `Inscripción recibida para ${form.name}. Revisa tu correo: ${form.email}` })
    // Limpiar formulario
    setForm({ name: '', email: '' })
    // Aquí podríamos redirigir o guardar en servidor
    setTimeout(() => navigate('/cursos'), 1800)
  }

  return (
    <>
      <Header />
      <main className="container page-content">
        <section className="course-detail">
          <div className="course-detail-card">
            <img src={(course && course.img) || '/assets/course1.svg'} alt={(course && course.title) || ''} className="course-detail-img" />
            <div className="course-detail-meta">
              <h1>{course ? course.title : 'Cargando...'}</h1>
              <p className="muted">{course ? `${course.author} • ${course.hours || 0} hrs • ${course.tag || ''}` : ''}</p>
              <p className="lead">{course ? course.description : ''}</p>
            </div>
          </div>

          <div className="enroll-form">
            <h2>Inscribirse al curso</h2>
            <form onSubmit={handleSubmit}>
              <label>Nombre</label>
              <input name="name" value={form.name} onChange={handleChange} placeholder="Tu nombre" />

              <label>Correo</label>
              <input name="email" value={form.email} onChange={handleChange} placeholder="tu@correo.com" />

              <button className="btn primary" type="submit">Inscribirme</button>
            </form>
            {status && (
              <div className={status.ok ? 'toast success' : 'toast error'}>{status.message}</div>
            )}
          </div>
        </section>
      </main>
    </>
  )
}
