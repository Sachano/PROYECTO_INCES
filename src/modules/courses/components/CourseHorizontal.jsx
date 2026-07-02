import React from 'react'

const H_COLORS = [
  'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
  'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
]

function getColor(title = '') {
  let hash = 0
  for (let i = 0; i < title.length; i++) hash = title.charCodeAt(i) + ((hash << 5) - hash)
  return H_COLORS[Math.abs(hash) % H_COLORS.length]
}

export default function CourseHorizontal({title, info, tag, img}){
  const hasImage = !!img
  const gradient = getColor(title)

  return (
    <article className="course-card" style={{ '--h-accent': gradient }}>
      <div className="course-left">
        {hasImage ? (
          <img src={img} alt="thumb" className="course-avatar-img" />
        ) : (
          <div className="course-avatar-img course-avatar-placeholder" style={{ background: gradient }}>
            {title?.charAt(0) || '?'}
          </div>
        )}
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
