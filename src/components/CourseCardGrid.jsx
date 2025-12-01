import React from 'react'
import { Link } from 'react-router-dom'

export default function CourseCardGrid({course}){
  return (
    <div className="course-card">
      <img src={course.img || '/course1.svg'} alt={course.title} />
      <div className="course-card-body">
        <h3>{course.title}</h3>
        <p className="muted">{course.author}</p>
        <div className="course-card-meta">
          <span>{course.hours} hrs</span>
          <Link to={`/cursos/${course.id}`} className="btn small">Ver</Link>
        </div>
      </div>
    </div>
  )
}

