import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../../services/api.js'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import Header from '../../../shared/components/Header.jsx'
import { IoSchoolOutline, IoRefreshOutline, IoPersonOutline } from 'react-icons/io5'

export default function VirtualClassroomHomePage(){
  const { user } = useAuth()
  const [courses, setCourses] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  async function load(){
    setBusy(true)
    setError('')
    try{
      const res = await api.virtualClassroom.listCourses()
      setCourses(res)
    }catch{
      setError('No se pudieron cargar los cursos del aula virtual.')
    }finally{
      setBusy(false)
    }
  }

  useEffect(() => { load() }, [])

  return (
    <>
      <Header />
      <main className="page-content">
        <div className="vc-header">
          <div>
            <h1 className="vc-title"><IoSchoolOutline /> Aula Virtual</h1>
            <p className="vc-sub">
              {user?.role === 'base'
                ? 'Accede a tus cursos inscritos y entrega tareas en PDF.'
                : 'Publica contenido, tareas y notas para tus cursos asignados.'}
            </p>
          </div>
          <div style={{ display: 'flex', gap: 10, alignItems: 'center', flexWrap: 'wrap' }}>
            <span className="vc-chip"><IoPersonOutline /> {String(user?.role || '').toUpperCase()}</span>
            <button className="btn" onClick={load} disabled={busy} type="button">
              <span className="btn-ico"><IoRefreshOutline /></span>
              Recargar
            </button>
          </div>
        </div>

        {error && <div style={{ color: 'var(--accent)', fontWeight: 900, marginTop: 10 }}>{error}</div>}

        <div style={{ display: 'grid', gap: 12, marginTop: 12 }}>
          {busy && <div className="muted">Cargando…</div>}
          {!busy && !courses.length && (
            <div className="card vc-course-card">
              <div>
                <div style={{ fontWeight: 1000 }}>Sin cursos disponibles</div>
                <div className="muted" style={{ marginTop: 6 }}>
                  {user?.role === 'base'
                    ? 'Inscríbete en un curso para ver su aula virtual.'
                    : user?.role === 'admin'
                      ? 'Aún no tienes cursos asignados como docente.'
                      : 'No hay cursos registrados.'}
                </div>
              </div>
            </div>
          )}

          {courses.map(c => (
            <div key={c.id} className="card vc-course-card">
              <div className="vc-course-left">
                <img className="vc-course-img" src={c.coverImg || c.img || '/assets/course1.svg'} alt={c.title} loading="lazy" />
                <div>
                  <div className="vc-course-name">{c.title}</div>
                  <div className="vc-course-meta">
                    {c.instructor ? `${c.instructor.firstName} ${c.instructor.lastName}` : 'Sin docente'} · {c.tag} · {c.hours} hrs
                  </div>
                </div>
              </div>
              <Link className="btn primary" to={`/aula-virtual/${c.id}`}>
                Entrar
              </Link>
            </div>
          ))}
        </div>
      </main>
    </>
  )
}
