import React, { useState, useEffect } from 'react'
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
  IoCloseOutline,
} from 'react-icons/io5'
import { getCourseRequirements } from '../utils/courseRequirements.js'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import { api } from '../../../services/api.js'

export default function CourseModal({ open, onClose, course }){
  if(!course) return null
  const { user } = useAuth()
  const role = user?.role || null
  const [busy, setBusy] = useState(false)
  const [editMode, setEditMode] = useState(false)
  const [form, setForm] = useState({})

  useEffect(() => {
    setForm({
      title: course.title || '',
      description: course.description || '',
      longDescription: course.longDescription || '',
      hours: course.hours || '',
      syllabusUrl: course.syllabusUrl || '',
      instructorUserId: course.instructorUserId ?? ''
    })
    setEditMode(false)
  }, [course])
  const [imageFile, setImageFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    if(imageFile){
      const url = URL.createObjectURL(imageFile)
      setPreviewUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setPreviewUrl('')
  }, [imageFile])

  const isVirtual = String(course.tag || '').toLowerCase() === 'virtual'
  const badgeClass = isVirtual ? 'course-detail-badge virtual' : 'course-detail-badge presencial'
  const typeLabel = isVirtual ? 'Virtual' : 'Presencial'

  const instructor = course.instructor || null
  const instructorName = instructor
    ? [instructor.firstName, instructor.lastName].filter(Boolean).join(' ')
    : 'Sin docente aún'
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
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            {role === 'master' && (
              <button className="btn danger" disabled={busy} onClick={async () => {
                if(!confirm('¿Eliminar este curso? Esta acción es irreversible.')) return
                try{
                  setBusy(true)
                  await api.courses.delete(course.id)
                  setBusy(false)
                  onClose && onClose()
                  alert('Curso eliminado')
                }catch(err){
                  setBusy(false)
                  alert('No se pudo eliminar el curso')
                }
              }}>Eliminar</button>
            )}

            {(role === 'master' || role === 'admin') && (
              !editMode ? (
                <button className="btn" disabled={busy} onClick={() => setEditMode(true)}>Editar</button>
              ) : (
                <>
                  <button className="btn primary" disabled={busy} onClick={async () => {
                    // Build updates only for allowed fields
                    const updates = {}
                    if(role === 'master'){
                      if(String(form.title || '').trim() !== String(course.title || '')) updates.title = form.title
                      if(String(form.description || '').trim() !== String(course.description || '')) updates.description = form.description
                    }
                    if(String(form.longDescription || '').trim() !== String(course.longDescription || '')) updates.longDescription = form.longDescription
                    if(Number(form.hours) !== Number(course.hours)) updates.hours = Number(form.hours)
                    if(String(form.syllabusUrl || '') !== String(course.syllabusUrl || '')) updates.syllabusUrl = form.syllabusUrl
                    if(String(form.instructorUserId || '') !== String(course.instructorUserId ?? '')) updates.instructorUserId = form.instructorUserId === '' ? null : Number(form.instructorUserId)

                    try{
                      setBusy(true)
                      // If an image file was selected, upload it first and include the returned url
                      if(imageFile){
                        try{
                          const uploaded = await api.courses.uploadImage(imageFile)
                          // prefer coverImg field
                          if(uploaded && uploaded.url) updates.coverImg = uploaded.url
                        }catch(e){
                          // upload failed
                          console.error('Image upload failed', e)
                          setBusy(false)
                          alert('No se pudo subir la imagen')
                          return
                        }
                      }

                      const updated = await api.courses.update(course.id, updates)
                      setBusy(false)
                      setEditMode(false)
                      setImageFile(null)
                      setPreviewUrl('')
                      // Update local form and rely on parent to refresh if needed
                      if(updated && updated.id) {
                        setForm({
                          title: updated.title || '',
                          description: updated.description || '',
                          longDescription: updated.longDescription || '',
                          hours: updated.hours || '',
                          syllabusUrl: updated.syllabusUrl || '',
                          instructorUserId: updated.instructorUserId ?? ''
                        })
                      }
                      alert('Curso actualizado')
                    }catch(err){
                      setBusy(false)
                      alert('No se pudo actualizar el curso')
                    }
                  }}>Guardar</button>

                  <button className="btn" disabled={busy} onClick={() => {
                    // cancel
                    setForm({
                      title: course.title || '',
                      description: course.description || '',
                      longDescription: course.longDescription || '',
                      hours: course.hours || '',
                      syllabusUrl: course.syllabusUrl || '',
                      instructorUserId: course.instructorUserId ?? ''
                    })
                    setEditMode(false)
                    setImageFile(null)
                    setPreviewUrl('')
                  }}>Cancelar</button>
                </>
              )
            )}
          </div>

          <div style={{ display: 'flex', gap: 8 }}>
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
          <button className="icon-btn course-detail-close" onClick={onClose} aria-label="Cerrar" type="button">
            <IoCloseOutline />
          </button>
          <div className="course-detail-toplabel">
            <span className="course-detail-topbadge">Detalles del curso</span>
          </div>
          <div className={badgeClass}>{typeLabel}</div>
        </div>

        <div className="course-detail-content">
          <div className="course-detail-head">
            {editMode ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {role === 'master' && (
                  <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
                )}
                <div style={{ display: 'flex', gap: 8 }}>
                  <div style={{ display: 'grid' }}>
                    <label className="muted">Horas</label>
                    <input className="input" type="number" min="1" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
                  </div>
                  <div style={{ display: 'grid' }}>
                    <label className="muted">Modalidad</label>
                    <div className="muted">{String(course.tag || '')}</div>
                  </div>
                </div>
              </div>
            ) : (
              <h2 className="course-detail-title">{course.title}</h2>
            )}
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
                  <span className="meta-line"><IoRibbonOutline /> {instructor?.specialty || 'Especialidad por definir'}</span>
                  <span className="meta-line"><IoMailOutline /> {instructor?.email || '—'}</span>
                  <span className="meta-line"><IoCallOutline /> {instructor?.phone || '—'}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="course-detail-section">
            <h3 className="section-h">Descripción</h3>
            {editMode ? (
              <div style={{ display: 'grid', gap: 8 }}>
                {role === 'master' && (
                  <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
                )}
                <textarea className="input" rows={5} value={form.longDescription} onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))} />
                <label className="muted">URL contenido programático</label>
                <input className="input" value={form.syllabusUrl} onChange={e => setForm(f => ({ ...f, syllabusUrl: e.target.value }))} />
                <label className="muted">ID docente encargado (vacío para quitar)</label>
                <input className="input" value={form.instructorUserId} onChange={e => setForm(f => ({ ...f, instructorUserId: e.target.value }))} />

                {role === 'master' && (
                  <div style={{ display: 'grid', gap: 8 }}>
                    <label className="muted">Imagen del curso (png/jpg/svg) — opcional</label>
                    <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={e => setImageFile((e.target.files || [])[0] || null)} />
                    {previewUrl ? (
                      <img src={previewUrl} alt="preview" style={{ width: 180, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                    ) : (
                      (course.coverImg || course.img) && <img src={course.coverImg || course.img} alt="current" style={{ width: 180, height: 100, objectFit: 'cover', borderRadius: 8 }} />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <p className="course-detail-description">{description}</p>
            )}
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
