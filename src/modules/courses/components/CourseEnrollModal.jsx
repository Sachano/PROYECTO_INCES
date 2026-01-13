import React, { useMemo, useState } from 'react'
import Modal from '../../../shared/components/ui/Modal.jsx'
import { IoMailOutline, IoPersonOutline } from 'react-icons/io5'

export default function CourseEnrollModal({ open, onClose, course }){
  const [form, setForm] = useState({ name: '', email: '' })
  const [status, setStatus] = useState(null)

  const title = useMemo(() => course ? `Inscripción: ${course.title}` : 'Inscripción', [course])

  function update(field, value){
    setForm(f => ({ ...f, [field]: value }))
  }

  function submit(e){
    e.preventDefault()
    if(!form.name.trim() || !form.email.trim()){
      setStatus({ ok:false, message:'Completa nombre y correo.' })
      return
    }

    // Por ahora: simulación local. Luego podemos implementar flujo completo (backend + perfil/enrolled)
    setStatus({ ok:true, message:'Solicitud enviada. Te contactaremos por correo.' })
    setTimeout(() => {
      setForm({ name:'', email:'' })
      setStatus(null)
      onClose()
    }, 900)
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

        <label className="form-row">
          <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <IoPersonOutline /> Nombre
          </span>
          <input value={form.name} onChange={e=>update('name', e.target.value)} placeholder="Tu nombre" />
        </label>

        <label className="form-row">
          <span style={{display:'inline-flex',alignItems:'center',gap:8}}>
            <IoMailOutline /> Correo
          </span>
          <input value={form.email} onChange={e=>update('email', e.target.value)} placeholder="tu@correo.com" />
        </label>

        {status && (
          <div className={status.ok ? 'toast success' : 'toast error'}>{status.message}</div>
        )}
      </form>
    </Modal>
  )
}
