import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Header from '../components/Header.jsx'

// Mock fetch helper (in-memory). In a real app replace with API call.
const findCourseById = (courses, id) => courses.find(c => String(c.id) === String(id))

const MOCK_COURSES = [
  { id: 1, title: 'React avanzado', author: 'María Pérez', hours: 12, img: '/course1.svg', description: 'Aprende patrones avanzados en React y optimización.' },
  { id: 2, title: 'Node.js práctico', author: 'Carlos Ruiz', hours: 8, img: '/course2.svg', description: 'Construye APIs REST y microservicios con Node.js.' },
  { id: 3, title: 'Diseño UI/UX', author: 'Andrea Gómez', hours: 6, img: '/course3.svg', description: 'Fundamentos de diseño centrado en el usuario.' }
]

export default function CursoDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const course = findCourseById(MOCK_COURSES, id) || { id, title: 'Curso no encontrado', description: 'No hay información para este curso.' }

  const [form, setForm] = useState({ name: '', email: '' })
  const [status, setStatus] = useState(null)

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
    <div className="app-root">
      <Header />
      <main className="container page-content">
        <section className="course-detail">
          <div className="course-detail-card">
            <img src={course.img || '/course1.svg'} alt={course.title} className="course-detail-img" />
            <div className="course-detail-meta">
              <h1>{course.title}</h1>
              <p className="muted">{course.author} • {course.hours || 0} hrs</p>
              <p className="lead">{course.description}</p>
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
    </div>
  )
}
