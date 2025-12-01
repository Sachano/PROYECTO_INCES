import React from 'react'

export default function CourseHorizontal({title, info, tag, img}){
  return (
    <article className="course-card">
      <div className="course-left">
        <img src={img} alt="thumb" className="course-avatar-img" />
        <div className="course-meta">
          <div className="course-title">{title}</div>
          <div className="course-info">{info}</div>
        </div>
      </div>
      <div className="course-right">
        <span className={`ch-tag ${tag==='Virtual' ? 'virtual' : 'pres'}`}>{tag}</span>
      </div>
    </article>
  )
}
