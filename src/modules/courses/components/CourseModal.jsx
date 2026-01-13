import React from 'react'
import Modal from '../../../shared/components/ui/Modal.jsx'
import {
  IoTimeOutline,
  IoLaptopOutline,
  IoBusinessOutline,
  IoPersonCircleOutline,
  IoMailOutline,
  IoCallOutline,
  IoRibbonOutline,
  IoDownloadOutline,
  IoCheckmarkCircleOutline,
} from 'react-icons/io5'
import { getCourseRequirements } from '../utils/courseRequirements.js'

export default function CourseModal({ open, onClose, course }){
  if(!course) return null

  const isVirtual = String(course.tag || '').toLowerCase() === 'virtual'
  const badgeClass = isVirtual ? 'course-detail-badge virtual' : 'course-detail-badge presencial'
  const typeLabel = isVirtual ? 'Virtual' : 'Presencial'

  const instructor = course.instructor || {}
  const instructorName = [instructor.firstName, instructor.lastName].filter(Boolean).join(' ') || course.author || 'Docente'
  const requirements = getCourseRequirements(course.tag)

  const description = course.longDescription || course.description || 'Descripción no disponible por el momento.'
  const syllabusUrl = course.syllabusUrl || ''

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={null}
      hideHeader
      cardClassName="edge-to-edge"
      bodyClassName="edge-to-edge"
      footer={
        <div className="course-detail-footer">
          <button className="btn" onClick={onClose}>Cerrar</button>
          {syllabusUrl ? (
            <a className="btn primary" href={syllabusUrl} download>
              <span className="btn-ico"><IoDownloadOutline /></span>
              Descargar contenido programático
            </a>
          ) : (
            <button className="btn primary" type="button" disabled title="Próximamente">
              <span className="btn-ico"><IoDownloadOutline /></span>
              Descargar contenido programático
            </button>
          )}
        </div>
      }
    >
      <div className="course-detail-modal">
        <div className="course-detail-hero">
          <img
            src={course.coverImg || '/assets/home.png'}
            alt={course.title}
            className="course-detail-img"
            loading="lazy"
          />
          <button className="icon-btn course-detail-close" onClick={onClose} aria-label="Cerrar">✕</button>
          <div className="course-detail-toplabel">
            <span className="course-detail-topbadge">Detalles del curso</span>
          </div>
          <div className={badgeClass}>{typeLabel}</div>
        </div>

        <div className="course-detail-content">
          <div className="course-detail-head">
            <h2 className="course-detail-title">{course.title}</h2>
            <div className="course-detail-meta">
              <span className="meta-chip">
                <IoTimeOutline /> {course.hours} hrs
              </span>
              <span className="meta-chip">
                {isVirtual ? <IoLaptopOutline /> : <IoBusinessOutline />}
                {typeLabel}
              </span>
            </div>
          </div>

          <section className="course-detail-section course-detail-section--instructor">
            <h3 className="section-h">Docente</h3>
            <div className="instructor-card">
              <div className="instructor-avatar" aria-hidden>
                <IoPersonCircleOutline />
              </div>
              <div className="instructor-body">
                <div className="instructor-name">{instructorName}</div>
                <div className="instructor-meta">
                  <span className="meta-line"><IoRibbonOutline /> {instructor.specialty || 'Especialidad por definir'}</span>
                  <span className="meta-line"><IoMailOutline /> {instructor.email || 'correo@inces.gob.ve'}</span>
                  <span className="meta-line"><IoCallOutline /> {instructor.phone || '+58 000-0000000'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="course-detail-section">
            <h3 className="section-h">Descripción</h3>
            <p className="course-detail-description">{description}</p>
          </section>

          <section className="course-detail-section">
            <div className="requirements-card">
              <div className="requirements-head">
                <div>
                  <div className="requirements-title">{requirements.title}</div>
                  <div className="requirements-sub">Según el tipo de curso: {typeLabel}</div>
                </div>
              </div>
              <div className="requirements-list">
                {requirements.items.map(r => (
                  <div key={r.key} className="requirements-item">
                    <IoCheckmarkCircleOutline />
                    <div className="requirements-text">
                      <div className="req-label">{r.label}</div>
                      <div className="req-note">{r.note}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      </div>
    </Modal>
  )
}
