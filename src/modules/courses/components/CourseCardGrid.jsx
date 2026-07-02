import React from 'react'
import { IoInformationCircleOutline, IoAddCircleOutline, IoTimeOutline, IoPersonOutline } from 'react-icons/io5'

const CARD_COLORS = [
  { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', badge: '#667eea', name: 'purple' },
  { bg: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', badge: '#f5576c', name: 'pink' },
  { bg: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', badge: '#4facfe', name: 'blue' },
  { bg: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', badge: '#43e97b', name: 'green' },
  { bg: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', badge: '#fa709a', name: 'sunset' },
  { bg: 'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', badge: '#a18cd1', name: 'lavender' },
  { bg: 'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)', badge: '#d57eeb', name: 'peach' },
  { bg: 'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)', badge: '#8ec5fc', name: 'soft-blue' },
]

function getCardColor(title = '') {
  let hash = 0
  for (let i = 0; i < title.length; i++) {
    hash = title.charCodeAt(i) + ((hash << 5) - hash)
  }
  return CARD_COLORS[Math.abs(hash) % CARD_COLORS.length]
}

export default function CourseCardGrid({ course, onDetails, onEnroll }){
  const badgeClass = course.tag === 'Virtual' ? 'grid-badge virtual' : 'grid-badge presencial'
  const hasImage = !!(course.coverImg || course.img)
  const img = course.coverImg || course.img || ''
  const cardColor = getCardColor(course.title)

  const style = {
    '--card-accent': cardColor.badge,
    '--card-accent-bg': cardColor.bg,
  }

  return (
    <article className="grid-card" style={style}>
      <div className="grid-media">
        {hasImage ? (
          <img className="grid-thumb" src={img} alt={`Portada ${course.title || ''}`} loading="lazy" />
        ) : (
          <div className="grid-thumb gradient-placeholder" style={{ background: cardColor.bg }}>
            <span className="gradient-placeholder-text">{course.title?.charAt(0) || '?'}</span>
          </div>
        )}
        <div className={`grid-overlay ${course.tag === 'Virtual' ? 'virtual' : 'presencial'}`} />
        <div className={badgeClass}>{course.tag}</div>
      </div>
      <div className="grid-body">
        <h3 className="grid-title">{course.title}</h3>
        <div className="grid-meta">
          <span className="meta-item"><IoPersonOutline /> {course.author}</span>
          <span className="meta-item"><IoTimeOutline /> {course.hours} hrs</span>
        </div>
        <div className="grid-actions">
          <button type="button" className="btn small outline card-btn" onClick={() => onDetails && onDetails()}>
            <span className="btn-ico"><IoInformationCircleOutline /></span>
            Detalles
          </button>
          <button type="button" className="btn small primary card-btn" onClick={() => onEnroll && onEnroll()}>
            <span className="btn-ico"><IoAddCircleOutline /></span>
            Inscribirme
          </button>
        </div>
      </div>
    </article>
  )
}
