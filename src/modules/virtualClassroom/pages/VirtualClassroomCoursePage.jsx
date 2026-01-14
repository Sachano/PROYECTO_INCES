import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../../services/api.js'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import Header from '../../../shared/components/Header.jsx'
import {
  IoDocumentTextOutline,
  IoClipboardOutline,
  IoGridOutline,
  IoPeopleOutline,
  IoTimeOutline,
  IoCalendarOutline,
  IoAttachOutline,
  IoDownloadOutline,
  IoCloudUploadOutline,
  IoRefreshOutline,
} from 'react-icons/io5'

function TabButton({ active, children, onClick }){
  return (
    <button className={active ? 'btn vc-tab active' : 'btn vc-tab'} type="button" onClick={onClick}>
      {children}
    </button>
  )
}

function formatDateTime(value){
  if(!value) return ''
  const d = new Date(String(value))
  if(Number.isNaN(d.getTime())) return String(value)
  return d.toLocaleString()
}

function isDeadlinePassed(dueAt){
  if(!dueAt) return false
  const d = new Date(String(dueAt))
  if(Number.isNaN(d.getTime())) return false
  return Date.now() > d.getTime()
}

function PostCard({ post, children }){
  return (
    <div className="card vc-post">
      <div className="vc-post-head">
        <div>
          <h3 className="vc-post-title">{post.title}</h3>
          <div className="vc-badges">
            <span className="vc-badge"><IoTimeOutline /> {post.createdAt}</span>
            {post.dueAt && (
              <span className={isDeadlinePassed(post.dueAt) ? 'vc-badge due closed' : 'vc-badge due'}>
                <IoCalendarOutline /> Fecha límite: {formatDateTime(post.dueAt)}
                {isDeadlinePassed(post.dueAt) ? ' (cerrada)' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="vc-post-time" />
      </div>

      {post.description && <div className="vc-post-desc">{post.description}</div>}

      {!!(post.files || []).length && (
        <div className="vc-files">
          {(post.files || []).map(f => (
            <a key={f.id} className="btn vc-file" href={f.url} target="_blank" rel="noreferrer">
              <span className="btn-ico"><IoDownloadOutline /></span>
              {f.originalName}
            </a>
          ))}
        </div>
      )}

      {children}
    </div>
  )
}

export default function VirtualClassroomCoursePage(){
  const { courseId } = useParams()
  const { user } = useAuth()

  const [active, setActive] = useState('content')
  const [posts, setPosts] = useState([])
  const [students, setStudents] = useState([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')

  const canTeach = user?.role === 'admin'
  const canSeeStudents = user?.role === 'admin' || user?.role === 'master'

  const title = useMemo(() => {
    if(active === 'content') return 'Contenido'
    if(active === 'assignment') return 'Tareas'
    if(active === 'grades') return 'Notas (Excel)'
    if(active === 'students') return 'Inscritos'
    return ''
  }, [active])

  async function load(){
    setBusy(true)
    setError('')
    try{
      if(active === 'students'){
        const res = await api.virtualClassroom.listStudents(courseId)
        setStudents(res)
      }else{
        const res = await api.virtualClassroom.listPosts(courseId, { type: active })
        setPosts(res)
      }
    }catch{
      setError('No se pudo cargar la información del aula virtual.')
    }finally{
      setBusy(false)
    }
  }

  useEffect(() => { load() }, [active, courseId])

  const [form, setForm] = useState({ title: '', description: '', dueAt: '' })
  const [files, setFiles] = useState([])
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const isStudent = user?.role === 'base'
  const [submitFileById, setSubmitFileById] = useState({})
  const [submitBusyId, setSubmitBusyId] = useState(null)
  const [submitMsgById, setSubmitMsgById] = useState({})
  const [mySubmissionById, setMySubmissionById] = useState({})

  const [submissionsByAssignmentId, setSubmissionsByAssignmentId] = useState({})
  const [submissionsOpenId, setSubmissionsOpenId] = useState(null)
  const [submissionsLoadingId, setSubmissionsLoadingId] = useState(null)

  async function submit(e){
    e.preventDefault()
    setSendError('')
    setSending(true)
    try{
      await api.virtualClassroom.createPost(courseId, {
        type: active,
        title: form.title,
        description: form.description,
        dueAt: active === 'assignment' ? form.dueAt : undefined,
        files
      })
      setForm({ title: '', description: '', dueAt: '' })
      setFiles([])
      await load()
    }catch{
      setSendError('No se pudo publicar. Verifica los archivos (pdf/png/jpg/xlsx) y el título.')
    }finally{
      setSending(false)
    }
  }

  async function submitAssignment(assignmentId){
    const file = submitFileById[String(assignmentId)]
    if(!file){
      setSubmitMsgById(m => ({ ...m, [String(assignmentId)]: 'Selecciona un PDF para entregar.' }))
      return
    }

    setSubmitBusyId(String(assignmentId))
    setSubmitMsgById(m => ({ ...m, [String(assignmentId)]: '' }))
    try{
      const res = await api.virtualClassroom.submitAssignment(courseId, assignmentId, file)
      setMySubmissionById(s => ({ ...s, [String(assignmentId)]: res }))
      setSubmitFileById(m => {
        const copy = { ...m }
        delete copy[String(assignmentId)]
        return copy
      })
      setSubmitMsgById(m => ({ ...m, [String(assignmentId)]: 'Entrega enviada.' }))
    }catch{
      setSubmitMsgById(m => ({ ...m, [String(assignmentId)]: 'No se pudo enviar. Verifica que sea PDF y que la fecha límite no haya pasado.' }))
    }finally{
      setSubmitBusyId(null)
    }
  }

  async function loadMySubmission(assignmentId){
    const key = String(assignmentId)
    setSubmitMsgById(m => ({ ...m, [key]: '' }))
    setSubmitBusyId(key)
    try{
      const res = await api.virtualClassroom.getMySubmission(courseId, assignmentId)
      setMySubmissionById(s => ({ ...s, [key]: res }))
      if(!res) setSubmitMsgById(m => ({ ...m, [key]: 'Aún no has entregado esta tarea.' }))
    }catch{
      setSubmitMsgById(m => ({ ...m, [key]: 'No se pudo consultar tu entrega.' }))
    }finally{
      setSubmitBusyId(null)
    }
  }

  async function toggleSubmissions(assignmentId){
    const key = String(assignmentId)
    if(submissionsOpenId === key){
      setSubmissionsOpenId(null)
      return
    }

    setSubmissionsOpenId(key)
    if(submissionsByAssignmentId[key]) return

    setSubmissionsLoadingId(key)
    try{
      const res = await api.virtualClassroom.listAssignmentSubmissions(courseId, assignmentId)
      setSubmissionsByAssignmentId(m => ({ ...m, [key]: res }))
    }catch{
      setSubmissionsByAssignmentId(m => ({ ...m, [key]: [] }))
    }finally{
      setSubmissionsLoadingId(null)
    }
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <div className="vc-header">
          <div>
            <h1 className="vc-title"><IoGridOutline /> Aula Virtual · {title}</h1>
            <p className="vc-sub">Gestiona contenido, tareas y notas en un solo lugar.</p>
          </div>
          <button className="btn" type="button" onClick={load} disabled={busy}>
            <span className="btn-ico"><IoRefreshOutline /></span>
            Recargar
          </button>
        </div>

        <div className="vc-tabs">
          <TabButton active={active === 'content'} onClick={() => setActive('content')}>
            <span className="btn-ico"><IoDocumentTextOutline /></span>
            Contenido
          </TabButton>
          <TabButton active={active === 'assignment'} onClick={() => setActive('assignment')}>
            <span className="btn-ico"><IoClipboardOutline /></span>
            Tareas
          </TabButton>
          <TabButton active={active === 'grades'} onClick={() => setActive('grades')}>
            <span className="btn-ico"><IoGridOutline /></span>
            Notas
          </TabButton>
          {canSeeStudents && (
            <TabButton active={active === 'students'} onClick={() => setActive('students')}>
              <span className="btn-ico"><IoPeopleOutline /></span>
              Inscritos
            </TabButton>
          )}
        </div>

        {active !== 'students' && canTeach && (
          <div className="card" style={{ padding: 14, marginTop: 12 }}>
            <div style={{ fontWeight: 1000, marginBottom: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              <IoCloudUploadOutline /> Publicar
            </div>
            <form onSubmit={submit} style={{ display: 'grid', gap: 10 }}>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Título</span>
              <input className="input" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} />
            </label>
            <label style={{ display: 'grid', gap: 6 }}>
              <span>Descripción</span>
              <textarea className="input" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
            </label>

            {active === 'assignment' && (
              <label style={{ display: 'grid', gap: 6 }}>
                <span>Fecha límite</span>
                <input
                  className="input"
                  type="datetime-local"
                  value={form.dueAt || ''}
                  onChange={e => setForm(f => ({ ...f, dueAt: e.target.value }))}
                />
                <div className="muted">Obligatorio para tareas.</div>
              </label>
            )}
            <label style={{ display: 'grid', gap: 6 }}>
              <span style={{ display: 'inline-flex', gap: 8, alignItems: 'center' }}><IoAttachOutline /> Archivos (pdf/png/jpg/xlsx)</span>
              <input type="file" multiple onChange={e => setFiles(Array.from(e.target.files || []))} />
              {!!files.length && <div className="muted">{files.length} archivo(s) seleccionado(s)</div>}
            </label>

            {sendError && <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{sendError}</div>}

            <button
              className="btn primary"
              disabled={
                sending ||
                !form.title.trim() ||
                (active === 'assignment' && !String(form.dueAt || '').trim())
              }
            >
              {sending ? 'Publicando…' : 'Publicar'}
            </button>
            </form>
          </div>
        )}

      {error && <div style={{ color: 'var(--accent)', fontWeight: 800, marginTop: 12 }}>{error}</div>}

        <div className="vc-panel" style={{ display: 'grid', gap: 12 }}>
        {busy && <div className="muted">Cargando…</div>}

        {active === 'students' ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="vc-students-table">
              <thead>
                <tr style={{ background: 'rgba(16,24,40,0.03)' }}>
                  <th style={{ textAlign: 'left', padding: 12 }}>Nombre</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Cédula</th>
                  <th style={{ textAlign: 'left', padding: 12 }}>Correo</th>
                </tr>
              </thead>
              <tbody>
                {students.map(s => (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 900 }}>{s.firstName} {s.lastName}</td>
                    <td>{s.cedula}</td>
                    <td>{s.email}</td>
                  </tr>
                ))}
                {!students.length && !busy && (
                  <tr>
                    <td colSpan={3} style={{ padding: 16, color: 'var(--muted)' }}>No hay inscritos aún.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        ) : (
          <>
            {!posts.length && !busy && <div className="muted">No hay publicaciones.</div>}
            {posts.map(p => (
              <PostCard key={p.id} post={p}>
                {active === 'assignment' && (
                  <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
                    {canTeach && (
                      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
                        <button className="btn" type="button" onClick={() => toggleSubmissions(p.id)}>
                          {submissionsOpenId === String(p.id) ? 'Ocultar entregas' : 'Ver entregas'}
                        </button>
                        {submissionsLoadingId === String(p.id) && <span className="muted">Cargando entregas…</span>}
                      </div>
                    )}

                    {canTeach && submissionsOpenId === String(p.id) && (
                      <div className="vc-subpanel">
                        {Array.isArray(submissionsByAssignmentId[String(p.id)]) && submissionsByAssignmentId[String(p.id)].length === 0 && (
                          <div className="muted">Aún no hay entregas.</div>
                        )}
                        {Array.isArray(submissionsByAssignmentId[String(p.id)]) && submissionsByAssignmentId[String(p.id)].length > 0 && (
                          <div style={{ display: 'grid', gap: 8 }}>
                            {submissionsByAssignmentId[String(p.id)].map(s => (
                              <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                <div style={{ fontWeight: 900 }}>
                                  {s.student ? `${s.student.firstName} ${s.student.lastName} (${s.student.cedula})` : `Usuario ${s.userId}`}
                                  <div className="muted" style={{ fontWeight: 700 }}>{s.submittedAt}</div>
                                </div>
                                {s.file?.url && (
                                  <a className="btn" href={s.file.url} target="_blank" rel="noreferrer">
                                    <span className="btn-ico"><IoDownloadOutline /></span>
                                    Descargar PDF
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {isStudent && (
                      <div className="vc-subpanel">
                        <h4>Entregar tarea (solo PDF)</h4>
                        {isDeadlinePassed(p.dueAt) ? (
                          <div className="muted" style={{ marginTop: 6 }}>La fecha límite ya pasó.</div>
                        ) : (
                          <div style={{ marginTop: 10, display: 'grid', gap: 10 }}>
                            <button
                              className="btn"
                              type="button"
                              disabled={submitBusyId === String(p.id)}
                              onClick={() => loadMySubmission(p.id)}
                            >
                              Ver mi entrega
                            </button>
                            <input
                              type="file"
                              accept="application/pdf,.pdf"
                              onChange={e => setSubmitFileById(m => ({ ...m, [String(p.id)]: (e.target.files || [])[0] }))}
                            />
                            <button
                              className="btn primary"
                              type="button"
                              disabled={submitBusyId === String(p.id)}
                              onClick={() => submitAssignment(p.id)}
                            >
                              {submitBusyId === String(p.id) ? 'Enviando…' : 'Entregar'}
                            </button>

                            {!!mySubmissionById[String(p.id)] && (
                              <div className="muted">
                                Entregado: {mySubmissionById[String(p.id)].submittedAt}
                                {mySubmissionById[String(p.id)].file?.url && (
                                  <div style={{ marginTop: 6 }}>
                                    <a className="btn" href={mySubmissionById[String(p.id)].file.url} target="_blank" rel="noreferrer">
                                      <span className="btn-ico"><IoDownloadOutline /></span>
                                      Ver mi PDF
                                    </a>
                                  </div>
                                )}
                              </div>
                            )}

                            {!!submitMsgById[String(p.id)] && (
                              <div style={{ color: 'var(--accent)', fontWeight: 800 }}>{submitMsgById[String(p.id)]}</div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </PostCard>
            ))}
          </>
        )}
        </div>
      </main>
    </>
  )
}
