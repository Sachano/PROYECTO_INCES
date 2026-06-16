import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../../../shared/components/ui/Modal.jsx'
import { api } from '../../../services/api.js'
import CourseUpsertModal from '../../courses/components/CourseUpsertModal.jsx'
import { IoAddOutline, IoRefreshOutline, IoCloseOutline, IoLinkOutline, IoSwapHorizontalOutline } from 'react-icons/io5'

function CourseCard({ course, onAssign, onUnassign, busy }){
  const img = course.coverImg || course.img || '/assets/course1.svg'
  const modality = course.tag || course.type || '—'
  const hours = course.hours ?? '—'
  const instructorName = course.instructor ? `${course.instructor.firstName} ${course.instructor.lastName}` : 'Sin docente'

  return (
    <div className="card" style={{ padding: 12, display: 'grid', gap: 10 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <img src={img} alt={course.title} style={{ width: 86, height: 58, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(16,24,40,0.08)' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontWeight: 950 }}>{course.title}</div>
          <div className="muted" style={{ marginTop: 4 }}>{modality} • {hours} hrs</div>
          <div className="muted" style={{ marginTop: 4 }}>Docente: {instructorName}</div>
        </div>
      </div>

      <div className="muted" style={{ marginTop: 2 }}>{course.description}</div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'flex-end' }}>
        {onUnassign && (
          <button className="btn" type="button" disabled={busy} onClick={onUnassign}>
            <span className="btn-ico"><IoLinkOutline /></span>
            Quitar
          </button>
        )}
        {onAssign && (
          <button className="btn primary" type="button" disabled={busy} onClick={onAssign}>
            <span className="btn-ico"><IoSwapHorizontalOutline /></span>
            Asignar
          </button>
        )}
      </div>
    </div>
  )
}

export default function CoursePickerModal({ open, onClose, adminUser }){
  const [courses, setCourses] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [q, setQ] = useState('')

  const [creating, setCreating] = useState(false)
  const [actionBusyId, setActionBusyId] = useState(null)

  async function load(){
    setBusy(true)
    setError('')
    try{
      const res = await api.courses.list()
      setCourses(res)
    }catch{
      setError('No se pudieron cargar los cursos.')
    }finally{
      setBusy(false)
    }
  }

  useEffect(() => {
    if(open) load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])

  const filtered = useMemo(() => {
    const query = String(q || '').trim().toLowerCase()
    if(!query) return courses
    return courses.filter(c => {
      const hay = `${c.title || ''} ${c.description || ''} ${c.longDescription || ''}`.toLowerCase()
      return hay.includes(query)
    })
  }, [courses, q])

  const assignedFiltered = useMemo(() => {
    if(!adminUser) return []
    return filtered.filter(c => String(c.instructorUserId ?? '') === String(adminUser.id))
  }, [filtered, adminUser])

  const unassignedFiltered = useMemo(() => {
    return filtered.filter(c => c.instructorUserId == null)
  }, [filtered])

  async function assign(course){
    if(!adminUser) return
    if(String(adminUser.status || '').toLowerCase() !== 'active'){
      alert('Este docente está deshabilitado. Reactívalo para poder asignarle cursos.')
      return
    }
    const already = String(course.instructorUserId ?? '') === String(adminUser.id)
    if(already) return

    if(course.instructorUserId != null){
      const ok = confirm(`Este curso ya tiene docente (${course.instructor?.firstName || ''} ${course.instructor?.lastName || ''}). ¿Reasignar a ${adminUser.firstName} ${adminUser.lastName}?`)
      if(!ok) return
    }

    setActionBusyId(String(course.id))
    try{
      const updated = await api.courses.setInstructor(course.id, adminUser.id)
      setCourses(list => list.map(c => String(c.id) === String(updated.id) ? updated : c))
    }catch{
      alert('No se pudo asignar el curso.')
    }finally{
      setActionBusyId(null)
    }
  }

  async function unassign(course){
    const ok = confirm(`¿Quitar el curso "${course.title}" de ${adminUser.firstName} ${adminUser.lastName}?`)
    if(!ok) return

    setActionBusyId(String(course.id))
    try{
      const updated = await api.courses.setInstructor(course.id, null)
      setCourses(list => list.map(c => String(c.id) === String(updated.id) ? updated : c))
    }catch{
      alert('No se pudo quitar el curso.')
    }finally{
      setActionBusyId(null)
    }
  }

  function close(){
    setError('')
    setCreating(false)
    setActionBusyId(null)
    setQ('')
    onClose && onClose()
  }

  return (
    <>
      <Modal
        open={open}
        onClose={close}
        title={adminUser ? `Asignar cursos a: ${adminUser.firstName} ${adminUser.lastName}` : 'Asignar cursos'}
        footer={
          <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <button className="btn" type="button" onClick={() => setCreating(true)}>
              <span className="btn-ico"><IoAddOutline /></span>
              Crear nuevo curso
            </button>
            <div style={{ display: 'flex', gap: 8 }}>
              <button className="btn" type="button" onClick={load} disabled={busy}>
                <span className="btn-ico"><IoRefreshOutline /></span>
                Recargar
              </button>
              <button className="btn" type="button" onClick={close}>
                <span className="btn-ico"><IoCloseOutline /></span>
                Cerrar
              </button>
            </div>
          </div>
        }
      >
        {error && <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{error}</div>}
        {busy && <div className="muted">Cargando…</div>}

        {adminUser && String(adminUser.status || '').toLowerCase() !== 'active' && (
          <div className="card" style={{ padding: 12, border: '1px solid rgba(244,63,94,0.18)', background: 'rgba(244,63,94,0.06)' }}>
            <div style={{ fontWeight: 950, color: '#9F1239' }}>Docente deshabilitado</div>
            <div className="muted" style={{ marginTop: 4 }}>No podrás asignar nuevos cursos hasta reactivarlo.</div>
          </div>
        )}

        <div style={{ marginTop: 6 }}>
          <input
            className="input"
            placeholder="Buscar curso por nombre o descripción…"
            value={q}
            onChange={e => setQ(e.target.value)}
          />
        </div>

        {!busy && !courses.length && (
          <div className="muted">No hay cursos registrados.</div>
        )}

        {!busy && !!courses.length && (
          <div style={{ display: 'grid', gap: 14 }}>
            <div>
              <div style={{ fontWeight: 950 }}>Cursos asignados</div>
              <div className="muted">Cursos que ya imparte este docente.</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {!assignedFiltered.length && <div className="muted">Sin cursos asignados.</div>}
                {assignedFiltered.map(c => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    busy={actionBusyId === String(c.id)}
                    onUnassign={() => unassign(c)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 950 }}>Cursos disponibles</div>
              <div className="muted">Cursos sin docente. También puedes reasignar desde aquí.</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {unassignedFiltered.map(c => (
                  <CourseCard
                    key={c.id}
                    course={c}
                    busy={actionBusyId === String(c.id)}
                    onAssign={() => assign(c)}
                  />
                ))}
              </div>
            </div>

            <div>
              <div style={{ fontWeight: 950 }}>Todos</div>
              <div className="muted">Vista completa para reasignar si hace falta.</div>
              <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                {filtered.map(c => {
                  const isMine = String(c.instructorUserId ?? '') === String(adminUser?.id)
                  const canAssign = !isMine
                  return (
                    <CourseCard
                      key={c.id}
                      course={c}
                      busy={actionBusyId === String(c.id)}
                      onAssign={canAssign ? () => assign(c) : null}
                      onUnassign={isMine ? () => unassign(c) : null}
                    />
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </Modal>

      <CourseUpsertModal
        open={creating}
        onClose={() => setCreating(false)}
        onCreated={async () => {
          await load()
        }}
      />
    </>
  )
}
