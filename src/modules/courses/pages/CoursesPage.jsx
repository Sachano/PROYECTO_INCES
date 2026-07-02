import React, {useMemo, useState} from 'react'
import Header from '../../../shared/components/Header.jsx'
import CourseCardGrid from '../components/CourseCardGrid.jsx'
import CourseModal from '../components/CourseModal.jsx'
import { Tabs } from '../../../shared/components/ui/Tabs.jsx'
import CourseEnrollModal from '../components/CourseEnrollModal.jsx'
import { useCourses } from '../hooks/useCourses.js'
import { filterCourses, paginate } from '../utils/coursesUtils.js'
import { useAuth } from '../../auth/context/AuthContext.jsx'
import CourseUpsertModal from '../components/CourseUpsertModal.jsx'
import BulkCourseModal from '../components/BulkCourseModal.jsx'
import { IoSearchOutline, IoLibraryOutline } from 'react-icons/io5'

export default function Cursos(){
  const { courses, loading, reload } = useCourses()
  const { user } = useAuth()
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const [detailsCourse, setDetailsCourse] = useState(null)
  const [enrollCourse, setEnrollCourse] = useState(null)
  const [createOpen, setCreateOpen] = useState(false)
  const [bulkOpen, setBulkOpen] = useState(false)
  const PAGE_SIZE = 6

  const filtered = useMemo(() => {
    const query = (q || '').trim().toLowerCase()

    function matchesType(c){
      return type === 'all' || c.tag === type
    }

    function matchesQuery(c){
      if(!query) return true
      return String(c.title || '').toLowerCase().includes(query)
    }

    // All users see all matching courses — no more hiding incomplete ones
    return courses.filter(c => matchesType(c) && matchesQuery(c))
  }, [courses, q, type, user])

  const { totalPages, current, items: paginated } = useMemo(() => {
    return paginate(filtered, page, PAGE_SIZE)
  }, [filtered, page])

  function go(p) {
    const next = Math.max(1, Math.min(totalPages, p))
    setPage(next)
  }

  function clearFilters(){
    setQ('')
    setType('all')
    setPage(1)
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <section className="courses-panel">
          <div className="courses-hero">
            <div>
              <p className="courses-label">Inicia tu aprendizaje</p>
              <h2 className="courses-title">Cursos</h2>
              <p className="courses-subtitle">Explora, filtra y revisa detalles en un clic.</p>
            </div>
            <div className="courses-count">
              {loading ? 'Cargando…' : `${filtered.length} de ${courses.length}`}
            </div>
          </div>

          {(user?.role === 'master' || user?.role === 'administrador') && (
            <div className="courses-panel-actions">
              <button className="btn primary" type="button" onClick={() => setCreateOpen(true)}>
                Crear curso
              </button>
              {user?.role === 'master' && (
                <button className="btn" type="button" onClick={() => setBulkOpen(true)} style={{marginLeft:8}}>
                  Carga masiva
                </button>
              )}
            </div>
          )}
        </section>

        <div className="courses-toolbar">
          <div className="search-wrap">
            <span className="search-ico" aria-hidden><IoSearchOutline /></span>
            <input
              value={q}
              onChange={e=>{ setQ(e.target.value); setPage(1) }}
              placeholder="Buscar por título…"
              className="search"
            />
          </div>

          <Tabs
            value={type}
            onChange={(v)=>{ setType(v); setPage(1) }}
            options={[
              { label:'Todos', value:'all' },
              { label:'Virtuales', value:'Virtual' },
              { label:'Presenciales', value:'Presencial' }
            ]}
          />

          {(q || type !== 'all') && (
            <button className="btn small" type="button" onClick={clearFilters}>Limpiar</button>
          )}
        </div>

        <div className="grid-list">
          {loading && <p>Cargando cursos...</p>}
          {!loading && paginated.map(c => (
            <CourseCardGrid
              key={c.id}
              course={c}
              onDetails={() => setDetailsCourse(c)}
              onEnroll={() => setEnrollCourse(c)}
            />
          ))}
          {!loading && filtered.length===0 && (
            <div className="empty-state">
              <div className="empty-ico" aria-hidden><IoLibraryOutline /></div>
              <div>
                <div className="empty-title">No encontramos cursos con esos filtros</div>
                <div className="empty-text">Prueba con otro término o limpia los filtros.</div>
              </div>
              <button className="btn small" type="button" onClick={clearFilters}>Limpiar filtros</button>
            </div>
          )}
        </div>

        <div className="pagination courses-pagination">
          <button className="btn" onClick={()=>go(current-1)} disabled={current<=1}>Anterior</button>
          <div className="page-numbers">
            {Array.from({length: totalPages}).map((_,i) => {
              const p = i+1
              return (
                <button key={p} className={p===current ? 'btn primary small' : 'btn small'} onClick={()=>go(p)}>{p}</button>
              )
            })}
          </div>
          <button className="btn" onClick={()=>go(current+1)} disabled={current>=totalPages}>Siguiente</button>
        </div>
      </main>
      <CourseModal open={!!detailsCourse} onClose={()=>setDetailsCourse(null)} course={detailsCourse} />
      <CourseEnrollModal open={!!enrollCourse} onClose={()=>setEnrollCourse(null)} course={enrollCourse} />

      <CourseUpsertModal
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        onCreated={async () => {
          await reload()
        }}
      />
      {bulkOpen && <BulkCourseModal
        onClose={() => setBulkOpen(false)}
        onCreated={async () => {
          await reload()
        }}
      />}
    </>
  )
}
