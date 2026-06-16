import React, { useEffect, useMemo, useState } from 'react'
import Modal from '../../../shared/components/ui/Modal.jsx'
import { api, getApiErrorMessage, logApiError } from '../../../services/api.js'
import CoursePickerModal from '../components/CoursePickerModal.jsx'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import Header from '../../../shared/components/Header.jsx'
import { IoEyeOutline, IoBanOutline, IoRefreshOutline } from 'react-icons/io5'
import { validateField, VALIDATION_RULES, getCharCountDisplay } from '../../../shared/utils.js'

function roleLabel(role){
  if(role === 'estudiante') return 'Estudiante'
  if(role === 'docente') return 'Docente'
  if(role === 'administrador') return 'Administrador'
  if(role === 'master') return 'Master'
  return role
}

export default function UsersPage(){
  const { user: me } = useAuth()
  const [role, setRole] = useState('all')
  const [status, setStatus] = useState('all')
  const [q, setQ] = useState('')

  const [items, setItems] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const [open, setOpen] = useState(false)
  const [selected, setSelected] = useState(null)
  const [detail, setDetail] = useState(null)

  const [openCourses, setOpenCourses] = useState(false)
  const [openCreate, setOpenCreate] = useState(false)
  const [createForm, setCreateForm] = useState({
    firstName: '', lastName: '', cedulaType: 'V', cedula: '', email: '', phone: '', role: 'estudiante', location: '', area: ''
  })
  const [createErrors, setCreateErrors] = useState({})
  const [createDuplicateErrors, setCreateDuplicateErrors] = useState({ cedula: '', email: '', phone: '' })

  async function load(){
    setBusy(true)
    setError('')
    try{
      const params = {}
      if(role !== 'all') params.role = role
      const res = await api.users.list(params)
      setItems(res)
    }catch(err){
      logApiError(err, 'UsersPage-load')
      setError(getApiErrorMessage(err, 'No se pudo cargar la lista de usuarios.'))
    }finally{
      setBusy(false)
    }
  }

  useEffect(() => {
    load()
  }, [role])

  const title = useMemo(() => {
    if(role === 'all') return 'Usuarios'
    return `Usuarios (${roleLabel(role)})`
  }, [role])

  const filtered = useMemo(() => {
    const query = String(q || '').trim().toLowerCase()
    return items.filter(u => {
      if(status !== 'all' && String(u.status || '').toLowerCase() !== status) return false
      if(!query) return true
      const hay = `${u.firstName || ''} ${u.lastName || ''} ${u.email || ''} ${u.cedula || ''}`.toLowerCase()
      return hay.includes(query)
    })
  }, [items, q, status])

  async function openDetail(user){
    setSelected(user)
    setDetail(null)
    setOpen(true)
    setOpenCourses(false)
    try{
      const res = await api.users.get(user.id)
      setDetail(res)
    }catch(err){
      logApiError(err, 'UsersPage-openDetail')
      setDetail({ error: true })
    }
  }

  async function onDelete(user){
    if(String(me?.id) === String(user.id)){
      alert('No puedes deshabilitar tu propia cuenta.')
      return
    }

    const ok = confirm(`¿Deshabilitar usuario ${user.firstName} ${user.lastName}?`)
    if(!ok) return
    try{
      await api.users.setStatus(user.id, 'disabled')

      setItems(list => list.map(x => String(x.id) === String(user.id) ? { ...x, status: 'disabled' } : x))
      if(selected?.id === user.id){
        setDetail(d => d ? ({ ...d, status: 'disabled' }) : d)
      }
    }catch(err){
      logApiError(err, 'UsersPage-onDelete')
      alert(getApiErrorMessage(err, 'No se pudo deshabilitar el usuario.'))
    }
  }

  async function onEnable(user){
    if(String(me?.id) === String(user.id)) return
    const ok = confirm(`¿Reactivar usuario ${user.firstName} ${user.lastName}?`)
    if(!ok) return

    try{
      const updated = await api.users.setStatus(user.id, 'active')
      setItems(list => list.map(x => String(x.id) === String(updated.id) ? updated : x))
      if(selected?.id === user.id){
        setDetail(updated)
      }
    }catch(err){
      logApiError(err, 'UsersPage-onEnable')
      alert(getApiErrorMessage(err, 'No se pudo reactivar el usuario.'))
    }
  }

  function clearFilters(){
    setQ('')
    setStatus('all')
    setRole('all')
  }

  async function handleCreateSubmit(e){
    e.preventDefault()
    const fields = ['firstName','lastName','cedula','email','phone']
    const errs = {}
    fields.forEach(f => {
      const v = validateField(f, createForm[f])
      if (v.error) errs[f] = v.error
    })
    setCreateErrors(errs)
    if (Object.keys(errs).length) return

    try {
      const dupErrors = { cedula: '', email: '', phone: '' }
      let hasDup = false
      try {
        if (createForm.cedula) {
          const res = await api.post('/auth/check-duplicate', { field: 'cedula', value: createForm.cedulaType + createForm.cedula })
          if (res.exists) { dupErrors.cedula = 'Esta cédula ya está registrada'; hasDup = true }
        }
        if (createForm.email) {
          const res = await api.post('/auth/check-duplicate', { field: 'email', value: createForm.email.trim().toLowerCase() })
          if (res.exists) { dupErrors.email = 'Este correo ya está registrado'; hasDup = true }
        }
        if (createForm.phone) {
          const res = await api.post('/auth/check-duplicate', { field: 'phone', value: createForm.phone.trim() })
          if (res.exists) { dupErrors.phone = 'Este teléfono ya está registrado'; hasDup = true }
        }
      } catch (e) {
        logApiError(e, 'UsersPage-checkDuplicates')
      }
      if (hasDup) {
        setCreateDuplicateErrors(dupErrors)
        setCreateErrors(prev => ({ ...prev, ...dupErrors }))
        return
      }

      const created = await api.users.create(createForm)
      setOpenCreate(false)
      setCreateForm({ firstName: '', lastName: '', cedulaType: 'V', cedula: '', email: '', phone: '', role: 'estudiante' })
      setCreateErrors({})
      setCreateDuplicateErrors({ cedula: '', email: '', phone: '' })
      load()

      if (created.tempPassword) {
        alert(`Usuario creado.\n\nContraseña temporal: ${created.tempPassword}\n\nRecomienda al usuario cambiarla en el primer inicio de sesión.`)
      }
    } catch (err) {
      logApiError(err, 'UsersPage-create')
      alert(getApiErrorMessage(err, 'Error creando usuario'))
    }
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <div className="courses-header">
          <div>
            <h2 className="courses-title">{title}</h2>
            <p className="courses-subtitle">Control total: activar/desactivar, revisar y asignar cursos a docentes.</p>
          </div>
          <div className="courses-count">{busy ? 'Cargando…' : `${filtered.length} de ${items.length}`}</div>
        </div>

        {me?.role === 'master' && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
            <button className="btn primary" type="button" onClick={() => setOpenCreate(true)}>
              Crear usuario
            </button>
          </div>
        )}

        <div className="users-toolbar">
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 800 }}>Tipo</span>
              <select className="input" value={role} onChange={e => setRole(e.target.value)}>
                <option value="all">Todos</option>
                <option value="estudiante">Estudiante</option>
                <option value="docente">Docente</option>
                <option value="administrador">Administrador</option>
                <option value="master">Master</option>
              </select>
            </label>

            <label style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ color: 'var(--muted)', fontWeight: 800 }}>Estado</span>
              <select className="input" value={status} onChange={e => setStatus(e.target.value)}>
                <option value="all">Todos</option>
                <option value="active">Activos</option>
                <option value="disabled">Deshabilitados</option>
              </select>
            </label>
          </div>

          <div className="spacer" />

          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
            <input
              className="input"
              style={{ minWidth: 260 }}
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Buscar por nombre, correo o cédula…"
            />
            {(q || role !== 'all' || status !== 'all') && (
              <button className="btn" type="button" onClick={clearFilters}>Limpiar</button>
            )}
            <button className="btn" onClick={load} disabled={busy} type="button">
              <span className="btn-ico"><IoRefreshOutline /></span>
              Recargar
            </button>
          </div>
        </div>

        {error && <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{error}</div>}

        <div className="card" style={{ padding: 0, overflow: 'hidden', marginTop: 12 }}>
          <div className="users-table-wrap">
            <table className="users-table">
              <thead>
                <tr style={{ background: 'rgba(16,24,40,0.03)' }}>
                  <th style={{ textAlign: 'left', padding: 12 }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Cédula</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Correo</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Tipo</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Estado</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Notificaciones</th>
                  <th style={{ textAlign: 'right', padding: 12 }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id} className={String(u.status).toLowerCase() === 'disabled' ? 'row-disabled' : ''}>
                    <td style={{ padding: 12 }}>
                      <div className="user-name">{u.firstName} {u.lastName}</div>
                      {String(me?.id) === String(u.id) && <div className="users-hint">Tu cuenta</div>}
                    </td>
                    <td style={{ padding: 12 }}>{u.cedula}</td>
                    <td style={{ padding: 12 }}>{u.email}</td>
                    <td style={{ padding: 12 }}>{roleLabel(u.role)}</td>
                    <td style={{ padding: 12 }}>
                      <span className={`status-pill ${String(u.status || '').toLowerCase() === 'active' ? 'active' : 'disabled'}`}>
                        {String(u.status || '').toLowerCase() === 'active' ? 'Activo' : 'Deshabilitado'}
                      </span>
                    </td>
                    <td style={{ padding: 12 }}>{u.notificationsCount ?? (u.notifications?.length || 0)}</td>
                    <td style={{ padding: 12, textAlign: 'right' }}>
                      <div className="actions">
                        <button className="btn" onClick={() => openDetail(u)} type="button">
                          <span className="btn-ico"><IoEyeOutline /></span>
                          Revisar
                        </button>
                        {String(u.status || '').toLowerCase() === 'active' ? (
                          <button className="btn" onClick={() => onDelete(u)} disabled={String(me?.id) === String(u.id)}>
                            <span className="btn-ico"><IoBanOutline /></span>
                            Deshabilitar
                          </button>
                        ) : (
                          <button className="btn primary" onClick={() => onEnable(u)} disabled={String(me?.id) === String(u.id)}>
                            <span className="btn-ico"><IoRefreshOutline /></span>
                            Reactivar
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
                {!filtered.length && !busy && (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, color: 'var(--muted)' }}>No hay usuarios para mostrar.</td>
                  </tr>
                )}
                {busy && (
                  <tr>
                    <td colSpan={7} style={{ padding: 16, color: 'var(--muted)' }}>Cargando…</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        <Modal
          open={open}
          onClose={() => { setOpen(false); setOpenCourses(false) }}
          title={selected ? `Usuario: ${selected.firstName} ${selected.lastName}` : 'Usuario'}
          footer={
            <div style={{ display: 'flex', gap: 8, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
              <div>
                {detail?.role === 'administrador' && (
                  <button className="btn" type="button" onClick={() => setOpenCourses(true)}>
                    Asignar cursos
                  </button>
                )}

                {detail?.id && String(detail.id) !== String(me?.id) && (
                  String(detail.status || '').toLowerCase() === 'active' ? (
                    <button className="btn" type="button" onClick={() => onDelete(detail)} style={{ marginLeft: 8 }}>
                      Deshabilitar
                    </button>
                  ) : (
                    <button className="btn primary" type="button" onClick={() => onEnable(detail)} style={{ marginLeft: 8 }}>
                      Reactivar
                    </button>
                  )
                )}
              </div>
              <button className="btn" type="button" onClick={() => { setOpen(false); setOpenCourses(false) }}>Cerrar</button>
            </div>
          }
        >
          {!detail && <div style={{ color: 'var(--muted)' }}>Cargando detalle…</div>}
          {detail?.error && <div style={{ color: 'var(--accent)', fontWeight: 800 }}>No se pudo cargar el detalle.</div>}
          {detail && !detail.error && (
            <div style={{ display: 'grid', gap: 12 }}>
              <div className="card" style={{ padding: 12 }}>
                <div><b>Nombre:</b> {detail.firstName} {detail.lastName}</div>
                <div><b>Cédula:</b> {detail.cedula}</div>
                <div><b>Correo:</b> {detail.email}</div>
                <div><b>Tipo:</b> {roleLabel(detail.role)}</div>
                <div><b>Teléfono:</b> {detail.phone || '—'}</div>
                <div>
                  <b>Estado:</b>{' '}
                  <span className={`status-pill ${String(detail.status || '').toLowerCase() === 'active' ? 'active' : 'disabled'}`}>
                    {String(detail.status || '').toLowerCase() === 'active' ? 'Activo' : 'Deshabilitado'}
                  </span>
                </div>
              </div>

              <div className="card" style={{ padding: 12 }}>
                <div style={{ fontWeight: 950, marginBottom: 8 }}>Notificaciones</div>
                {(detail.notifications || []).length ? (
                  <div style={{ display: 'grid', gap: 8 }}>
                    {detail.notifications.map(n => (
                      <div key={n.id} style={{ padding: 10, border: '1px solid rgba(16,24,40,0.06)', borderRadius: 12 }}>
                        <div style={{ fontWeight: 900 }}>{n.title}</div>
                        <div style={{ color: 'var(--muted)' }}>{n.message}</div>
                        <div style={{ color: 'var(--muted)', fontSize: 12, marginTop: 6 }}>
                          {n.read ? 'Leída' : 'No leída'} · {n.createdAt}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ color: 'var(--muted)' }}>Sin notificaciones.</div>
                )}
              </div>
            </div>
          )}
        </Modal>

        <Modal open={openCreate} onClose={() => setOpenCreate(false)} title="Crear Usuario">
          <form onSubmit={handleCreateSubmit}>
            <div style={{ display: 'grid', gap: 12 }}>
              <div>
                <input className="input" placeholder="Nombre" value={createForm.firstName} onChange={e => { const v=e.target.value; setCreateForm(f => ({ ...f, firstName: v })); setCreateErrors(p=>({...p,firstName:validateField('firstName',v).error})) }} required />
                {createErrors.firstName && <div style={{color:'#e94560',fontSize:12}}>{createErrors.firstName}</div>}
                <div style={{fontSize:11,color:'#888'}}>{getCharCountDisplay(createForm.firstName,VALIDATION_RULES.firstName.maxLength).text}</div>
              </div>
              <div>
                <input className="input" placeholder="Apellido" value={createForm.lastName} onChange={e => { const v=e.target.value; setCreateForm(f => ({ ...f, lastName: v })); setCreateErrors(p=>({...p,lastName:validateField('lastName',v).error})) }} required />
                {createErrors.lastName && <div style={{color:'#e94560',fontSize:12}}>{createErrors.lastName}</div>}
                <div style={{fontSize:11,color:'#888'}}>{getCharCountDisplay(createForm.lastName,VALIDATION_RULES.lastName.maxLength).text}</div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <select
                  className="input"
                  style={{ width: 70 }}
                  value={createForm.cedulaType}
                  onChange={e => setCreateForm(f => ({ ...f, cedulaType: e.target.value }))}
                >
                  <option value="V">V</option>
                  <option value="E">E</option>
                  <option value="J">J</option>
                  <option value="C">C</option>
                  <option value="G">G</option>
                  <option value="FP">FP</option>
                </select>
                <div style={{ flex: 1 }}>
                  <input
                    className="input"
                    placeholder="Cédula"
                    value={createForm.cedula}
                    onChange={e => {
                      const v = e.target.value.replace(/[^0-9]/g, '')
                      setCreateForm(f => ({ ...f, cedula: v }))
                      setCreateErrors(p => ({...p, cedula: validateField('cedula', v).error}))
                    }}
                    required
                  />
                  {createErrors.cedula && <div style={{color:'#e94560',fontSize:12}}>{createErrors.cedula}</div>}
                  <div style={{fontSize:11,color:'#888'}}>{getCharCountDisplay(createForm.cedula,VALIDATION_RULES.cedula.maxLength).text}</div>
                </div>
              </div>
              {createDuplicateErrors.cedula && (
                <div style={{color:'#e94560',fontSize:12}}>{createDuplicateErrors.cedula}</div>
              )}
              <div>
                <input className="input" type="email" placeholder="Email" value={createForm.email} onChange={e => { const v=e.target.value; setCreateForm(f => ({ ...f, email: v })); setCreateErrors(p=>({...p,email:validateField('email',v).error})) }} required />
                {createErrors.email && <div style={{color:'#e94560',fontSize:12}}>{createErrors.email}</div>}
                <div style={{fontSize:11,color:'#888'}}>{getCharCountDisplay(createForm.email,VALIDATION_RULES.email.maxLength).text}</div>
              </div>
              {createDuplicateErrors.email && (
                <div style={{color:'#e94560',fontSize:12}}>{createDuplicateErrors.email}</div>
              )}
              <div>
                <input className="input" placeholder="Teléfono" value={createForm.phone} onChange={e => { const v=e.target.value; setCreateForm(f => ({ ...f, phone: v })); setCreateErrors(p=>({...p,phone:validateField('phone',v).error})) }} required />
                {createErrors.phone && <div style={{color:'#e94560',fontSize:12}}>{createErrors.phone}</div>}
                <div style={{fontSize:11,color:'#888'}}>{getCharCountDisplay(createForm.phone,VALIDATION_RULES.phone.maxLength).text}</div>
              </div>
              {createDuplicateErrors.phone && (
                <div style={{color:'#e94560',fontSize:12}}>{createDuplicateErrors.phone}</div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                <select className="input" value={createForm.role} onChange={e => setCreateForm(f => ({ ...f, role: e.target.value }))}>
                  <option value="estudiante">Estudiante</option>
                  <option value="docente">Docente</option>
                  <option value="administrador">Administrador</option>
                </select>

                <select className="input" value={createForm.location} onChange={e => setCreateForm(f => ({ ...f, location: e.target.value }))}>
                  <option value="">Sede (opcional)</option>
                  <option value="CCS">Caracas</option>
                  <option value="SC">San Cristóbal</option>
                  <option value="MC">Maracaibo</option>
                  <option value="VAL">Valencia</option>
                </select>

                <select className="input" value={createForm.area} onChange={e => setCreateForm(f => ({ ...f, area: e.target.value }))}>
                  <option value="">Área (opcional)</option>
                  <option value="INF">Informática</option>
                  <option value="PROG">Programación</option>
                  <option value="ADMIN">Administración</option>
                  <option value="ELEC">Electricidad</option>
                </select>
              </div>
              <button className="btn primary full" type="submit">Crear Usuario</button>
            </div>
          </form>
        </Modal>

        <CoursePickerModal
          open={openCourses}
          onClose={() => setOpenCourses(false)}
          adminUser={detail?.role === 'administrador' ? detail : null}
        />
      </main>
    </>
  )
}