import React from 'react'
import { IoInformationCircleOutline, IoAddCircleOutline, IoTimeOutline, IoPersonOutline } from 'react-icons/io5'

export default function CourseCardGrid({ course, onDetails, onEnroll }){
  // Placeholder card shown when a base user searches and course is incomplete
  if(course && course.placeholder){
    return (
      <article className="grid-card placeholder">
        <div className="grid-media">
          <div className="grid-thumb missing">Contenido en perfeccionamiento academico</div>
        </div>
        <div className="grid-body">
          <h3 className="grid-title">Contenido en perfeccionamiento academico</h3>
          <div className="grid-meta">
            <span className="meta-item muted">Este curso está en proceso de publicación</span>
          </div>
          <div className="grid-actions">
            <button type="button" className="btn small outline" disabled>
              <span className="btn-ico"><IoInformationCircleOutline /></span>
              Detalles
            </button>
            <button type="button" className="btn small primary" disabled>
              <span className="btn-ico"><IoAddCircleOutline /></span>
              Inscribirme
            </button>
          </div>
        </div>
      </article>
    )
  }

  const badgeClass = course.tag === 'Virtual' ? 'grid-badge virtual' : 'grid-badge presencial'
  const hasImage = !!(course.coverImg || course.img)
  const img = course.coverImg || course.img || ''

  return (
    <article className="grid-card">
      <div className="grid-media">
        {hasImage ? (
          <img className="grid-thumb" src={img} alt={`Portada ${course.title || ''}`} loading="lazy" />
        ) : (
          <div className="grid-thumb missing">falta foto del curso</div>
        )}
        <div className={badgeClass}>{course.tag}</div>
      </div>
      <div className="grid-body">
        <h3 className="grid-title">{course.title}</h3>
        <div className="grid-meta">
          <span className="meta-item"><IoPersonOutline /> {course.author}</span>
          <span className="meta-item"><IoTimeOutline /> {course.hours} hrs</span>
        </div>
        <div className="grid-actions">
          <button type="button" className="btn small outline" onClick={() => onDetails && onDetails()}>
            <span className="btn-ico"><IoInformationCircleOutline /></span>
            Detalles
          </button>
          <button type="button" className="btn small primary" onClick={() => onEnroll && onEnroll()}>
            <span className="btn-ico"><IoAddCircleOutline /></span>
            Inscribirme
          </button>
        </div>
      </div>
    </article>
  )
}

