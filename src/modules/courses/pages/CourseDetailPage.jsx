import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import Header from '../../../shared/components/Header.jsx'
import { api } from '../../../services/api.js'

export default function CursoDetail() {
  const { id } = useParams()
  const [course, setCourse] = useState(null)

  useEffect(() => {
    api.courses.get(id).then(setCourse).catch(() => setCourse({ id, title:'Curso no encontrado', description:'No hay información para este curso.' }))
  }, [id])

  return (
    <>
      <Header />
      <main className="container page-content">
        <section className="course-detail">
          <div className="course-detail-card">
            <img src={(course && course.img) || '/assets/course1.svg'} alt={(course && course.title) || ''} className="course-detail-img" />
            <div className="course-detail-meta">
              <h1>{course ? course.title : 'Cargando...'}</h1>
              <p className="muted">{course ? `${course.hours || 0} hrs • ${course.tag || ''}` : ''}</p>
              <p className="muted">
                Docente: {course?.instructor ? `${course.instructor.firstName} ${course.instructor.lastName} (${course.instructor.email})` : 'Sin docente aún'}
              </p>
              <p className="lead">{course ? course.description : ''}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
