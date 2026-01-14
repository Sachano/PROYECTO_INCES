import React, { useMemo, useState } from 'react'
import Modal from '../../../shared/components/ui/Modal.jsx'
import { IoMailOutline, IoPersonOutline } from 'react-icons/io5'
import { api } from '../../../services/api.js'
import { useAuth } from '../../auth/context/AuthContext.jsx'

export default function CourseEnrollModal({ open, onClose, course }){
  const { user } = useAuth()
  const [status, setStatus] = useState(null)

  const title = useMemo(() => course ? `Inscripción: ${course.title}` : 'Inscripción', [course])

  async function submit(e){
    e.preventDefault()
    if(!user){
      setStatus({ ok:false, message:'Debes iniciar sesión para inscribirte.' })
      return
    }
    if(String(user.role) !== 'base'){
      setStatus({ ok:false, message:'Solo los usuarios base (estudiantes) pueden inscribirse.' })
      return
    }

    try{
      await api.virtualClassroom.enroll(course.id)
      setStatus({ ok:true, message:'Inscripción realizada. Ya tienes acceso al aula virtual.' })
      setTimeout(() => {
        setStatus(null)
        onClose()
      }, 900)
    }catch{
      setStatus({ ok:false, message:'No se pudo inscribir. Intenta nuevamente.' })
    }
  }

  if(!course) return null

  return (
    <Modal
      open={open}
      onClose={() => { setStatus(null); onClose() }}
      title={title}
      footer={
        <div style={{display:'flex',gap:8,justifyContent:'flex-end'}}>
          <button className="btn" onClick={onClose} type="button">Cancelar</button>
          <button className="btn primary" form="enroll-form" type="submit">Enviar</button>
        </div>
      }
    >
      <form id="enroll-form" onSubmit={submit} style={{display:'grid',gap:10}}>
        <div className="muted">{course.author} • {course.hours} hrs • {course.tag}</div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{display:'grid',gap:6}}>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,fontWeight:900}}>
              <IoPersonOutline /> Estudiante
            </div>
            <div className="muted">{user ? `${user.firstName} ${user.lastName}` : '—'}</div>
            <div style={{display:'inline-flex',alignItems:'center',gap:8,fontWeight:900,marginTop:8}}>
              <IoMailOutline /> Correo
            </div>
            <div className="muted">{user?.email || '—'}</div>
          </div>
        </div>

        {status && (
          <div className={status.ok ? 'toast success' : 'toast error'}>{status.message}</div>
        )}
      </form>
    </Modal>
  )
}
