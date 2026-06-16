import React, { useMemo, useState } from 'react'
import Modal from '../../../shared/components/ui/Modal.jsx'
import { api } from '../../../services/api.js'
import { validateField, VALIDATION_RULES } from '../../../shared/utils'

const DEFAULT_IMAGES = [
  '/assets/course1.svg',
  '/assets/course2.svg',
]

export default function CourseUpsertModal({ open, onClose, onCreated }){
  const [form, setForm] = useState({
    title: '',
    description: '',
    longDescription: '',
    hours: '',
    tag: 'Virtual',
    img: DEFAULT_IMAGES[0],
  })
  
  const [titleError, setTitleError] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

   const canSubmit = useMemo(() => {
     const titleValid = !!String(form.title).trim() && String(form.title).length <= VALIDATION_RULES.courseTitle.maxLength
     const descValid = !!String(form.description).trim()
     const hoursValid = Number(form.hours) > 0 && Number(form.hours) <= VALIDATION_RULES.courseHours.maxValue
     return titleValid && descValid && hoursValid
   }, [form])
  
  function sanitizeTitleInput(value) {
    // Solo letras, números, espacios y signos de puntuación básicos
    return value.replace(/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\(\)\[\]\.,;:!?¿]/g, '')
  }

  function handleTitleChange(e) {
    let value = e.target.value
    // Sanitizar: eliminar caracteres no permitidos
    value = sanitizeTitleInput(value)
    
    // Validar longitud
    const validation = validateField('courseTitle', value)
    setTitleError(validation.error)
    
    setForm(f => ({ ...f, title: value }))
  }

  function close(){
    setError('')
    setTitleError('')
    setBusy(false)
    setImageFile(null)
    onClose && onClose()
    setForm({ title: '', description: '', longDescription: '', hours: '', tag: 'Virtual', img: DEFAULT_IMAGES[0] })
  }
  
  async function submit(e){
    e.preventDefault()
    if(!canSubmit) return
    
    // Validación final antes de submit
    const titleValidation = validateField('courseTitle', form.title)
    if (titleValidation.error) {
      setTitleError(titleValidation.error)
      return
    }
    
    // Validar que no tenga símbolos prohibidos
    if (/[^a-zA-Z0-9áéíóúÁÉÍÓÚñÑüÜ\s\-\(\)\[\]\.,;:!?¿]/.test(form.title)) {
      setTitleError('El título no puede contener símbolos o caracteres especiales')
      return
    }

    setBusy(true)
    setError('')
    try{
      let imgUrl = String(form.img || '').trim()
      if(imageFile){
        const uploaded = await api.courses.uploadImage(imageFile)
        imgUrl = uploaded.url
      }

      const created = await api.courses.create({
        title: form.title.trim(),
        description: form.description.trim(),
        longDescription: form.longDescription.trim(),
        hours: Number(form.hours),
        tag: form.tag,
        img: imgUrl,
      })

      setForm({ title: '', description: '', longDescription: '', hours: '', tag: 'Virtual', img: DEFAULT_IMAGES[0] })
      setImageFile(null)
      setTitleError('')
      onCreated && onCreated(created)
      close()
    }catch{
      setError('No se pudo crear el curso. Verifica los campos y la imagen.')
    }finally{
      setBusy(false)
    }
  }

  async function submit(e){
    e.preventDefault()
    if(!canSubmit) return

    setBusy(true)
    setError('')
    try{
      let imgUrl = String(form.img || '').trim()
      if(imageFile){
        const uploaded = await api.courses.uploadImage(imageFile)
        imgUrl = uploaded.url
      }

      const created = await api.courses.create({
        title: form.title,
        description: form.description,
        longDescription: form.longDescription,
        hours: Number(form.hours),
        tag: form.tag,
        img: imgUrl,
      })

      setForm({ title: '', description: '', longDescription: '', hours: '', tag: 'Virtual', img: DEFAULT_IMAGES[0] })
      setImageFile(null)
      onCreated && onCreated(created)
      close()
    }catch{
      setError('No se pudo crear el curso. Verifica los campos y la imagen.')
    }finally{
      setBusy(false)
    }
  }

  return (
    <Modal
      open={open}
      onClose={close}
      title="Crear nuevo curso"
      footer={
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button className="btn" type="button" onClick={close} disabled={busy}>Cancelar</button>
          <button className="btn primary" form="course-upsert-form" type="submit" disabled={busy || !canSubmit}>
            {busy ? 'Guardando…' : 'Crear'}
          </button>
        </div>
      }
    >
        <form id="course-upsert-form" onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Nombre del curso</span>
            <input className="input" value={form.title} onChange={handleTitleChange} />
             <div style={{
               fontSize: '11px',
               textAlign: 'right',
               color: form.title.length > VALIDATION_RULES.courseTitle.maxLength ? '#e94560' : form.title.length > Math.floor(VALIDATION_RULES.courseTitle.maxLength * 0.8) ? '#f39c12' : '#888'
             }}>
               {form.title.length}/{VALIDATION_RULES.courseTitle.maxLength} caracteres
             </div>
            {titleError && <div style={{ color: '#e94560', fontWeight: 800, fontSize: '13px' }}>{titleError}</div>}
          </label>

           <label style={{ display: 'grid', gap: 6 }}>
             <span>Descripción</span>
             <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
             <div style={{
               fontSize: '11px',
               textAlign: 'right',
               color: form.description.length > VALIDATION_RULES.courseDescription.maxLength ? '#e94560' : form.description.length > Math.floor(VALIDATION_RULES.courseDescription.maxLength * 0.9) ? '#f39c12' : '#888'
             }}>
               {form.description.length}/{VALIDATION_RULES.courseDescription.maxLength} caracteres
             </div>
           </label>

           <label style={{ display: 'grid', gap: 6 }}>
             <span>Descripción larga (opcional)</span>
             <textarea className="input" rows={4} value={form.longDescription} onChange={e => setForm(f => ({ ...f, longDescription: e.target.value }))} />
             <div style={{
               fontSize: '11px',
               textAlign: 'right',
               color: form.longDescription.length > VALIDATION_RULES.courseLongDescription.maxLength ? '#e94560' : form.longDescription.length > Math.floor(VALIDATION_RULES.courseLongDescription.maxLength * 0.9) ? '#f39c12' : '#888'
             }}>
               {form.longDescription.length}/{VALIDATION_RULES.courseLongDescription.maxLength} caracteres
             </div>
           </label>

        <div style={{ display: 'grid', gap: 10, gridTemplateColumns: '1fr 1fr' }}>
          <label style={{ display: 'grid', gap: 6 }}>
            <span>Horas</span>
            <input className="input" type="number" min="1" value={form.hours} onChange={e => setForm(f => ({ ...f, hours: e.target.value }))} />
          </label>

          <label style={{ display: 'grid', gap: 6 }}>
            <span>Modalidad</span>
            <select className="input" value={form.tag} onChange={e => setForm(f => ({ ...f, tag: e.target.value }))}>
              <option value="Virtual">Virtual</option>
              <option value="Presencial">Presencial</option>
            </select>
          </label>
        </div>

        <div className="card" style={{ padding: 12 }}>
          <div style={{ fontWeight: 900, marginBottom: 8 }}>Imagen</div>
          <div style={{ display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Seleccionar imagen (png/jpg/svg, opcional)</span>
              <input type="file" accept="image/png,image/jpeg,image/svg+xml" onChange={e => setImageFile((e.target.files || [])[0] || null)} />
              {!!imageFile && <div className="muted">Archivo: {imageFile.name}</div>}
            </label>

            <div className="muted">O usar una imagen predefinida:</div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {DEFAULT_IMAGES.map(u => (
                <button
                  key={u}
                  type="button"
                  className={form.img === u && !imageFile ? 'btn primary' : 'btn'}
                  onClick={() => { setImageFile(null); setForm(f => ({ ...f, img: u })) }}
                >
                  {u.includes('course1') ? 'Imagen 1' : 'Imagen 2'}
                </button>
              ))}
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <img src={imageFile ? URL.createObjectURL(imageFile) : (form.img || DEFAULT_IMAGES[0])} alt="preview" style={{ width: 84, height: 56, objectFit: 'cover', borderRadius: 10, border: '1px solid rgba(16,24,40,0.08)' }} />
              <div className="muted">Vista previa</div>
            </div>
          </div>
        </div>

        {error && <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{error}</div>}
      </form>
    </Modal>
  )
}
