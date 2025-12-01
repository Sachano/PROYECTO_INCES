import React from 'react'

export default function CourseCard({title, weeks, type, img}){
  return (
    <article className="card">
      <div className="avatar">{img ? <img src={img} alt="avatar" /> : <div className="placeholder">👩</div>}</div>
      <div className="card-body">
        <h4 className="card-title">{title}</h4>
        <p className="card-sub">{weeks}</p>
      </div>
      <div className={`badge ${type === 'Virtual' ? 'badge-virtual' : 'badge-pres'}`}>
        {type}
      </div>
    </article>
  )
}
