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
              <div className="course-detail-info">
                <span className="course-detail-label">Curso</span>
                <h1 className="course-detail-title">{course ? course.title : 'Cargando...'}</h1>
                <div className="course-detail-badges">
                  <span className={`course-detail-badge ${course?.tag === 'Virtual' ? 'virtual' : 'presencial'}`}>
                    {course?.tag || 'Sin modalidad'}
                  </span>
                </div>
                <p className="muted course-detail-summary">
                  {course ? `${course.hours || 0} hrs • ${course.tag || 'Sin etiqueta'}` : ''}
                </p>
                <p className="muted course-detail-instructor">
                  Docente: {course?.instructor ? `${course.instructor.firstName} ${course.instructor.lastName} (${course.instructor.email})` : 'Sin docente aún'}
                </p>
              </div>
              <p className="lead course-detail-description">{course ? course.description : ''}</p>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}
