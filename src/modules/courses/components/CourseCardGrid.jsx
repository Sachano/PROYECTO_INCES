import React from 'react'
import { IoInformationCircleOutline, IoAddCircleOutline, IoTimeOutline, IoPersonOutline } from 'react-icons/io5'

export default function CourseCardGrid({ course, onDetails, onEnroll }){
  const badgeClass = course.tag === 'Virtual' ? 'grid-badge virtual' : 'grid-badge presencial'
  const img = course.coverImg || course.img || '/assets/home.png'

  return (
    <article className="grid-card">
      <div className="grid-media">
        <img className="grid-thumb" src={img} alt="Portada del curso" loading="lazy" />
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

