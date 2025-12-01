import React, {useState, useMemo} from 'react'
import Header from '../components/Header.jsx'
import CourseCardGrid from '../components/CourseCardGrid.jsx'

const MOCK = [
  { id:1, title:'Soldadur Básica', author:'Luis Martínez', hours:40, img:'/course1.svg', tag:'Virtual' },
  { id:2, title:'Programación Web', author:'Ana López', hours:40, img:'/course2.svg', tag:'Virtual' },
  { id:3, title:'Carpintería', author:'Carlos R.', hours:60, img:'/course1.svg', tag:'Presencial' },
  { id:4, title:'Electricidad residencial', author:'María P.', hours:48, img:'/course2.svg', tag:'Presencial' },
  { id:5, title:'Introducción a UX', author:'Andrea G.', hours:24, img:'/course1.svg', tag:'Virtual' },
  { id:6, title:'Python básico', author:'J. Torres', hours:30, img:'/course2.svg', tag:'Virtual' },
  { id:7, title:'Gestión de proyectos', author:'S. Castro', hours:20, img:'/course1.svg', tag:'Virtual' },
  { id:8, title:'Soldadura avanzada', author:'Luis Martínez', hours:80, img:'/course2.svg', tag:'Presencial' },
  { id:9, title:'Mecánica ligera', author:'R. Díaz', hours:50, img:'/course1.svg', tag:'Presencial' },
  { id:10, title:'Marketing digital', author:'C. Vega', hours:18, img:'/course2.svg', tag:'Virtual' },
  { id:11, title:'Habilidades blandas', author:'P. Ruiz', hours:12, img:'/course1.svg', tag:'Virtual' },
  { id:12, title:'Reparación de electrodomésticos', author:'M. Gómez', hours:36, img:'/course2.svg', tag:'Presencial' }
]

export default function Cursos(){
  const [q, setQ] = useState('')
  const [type, setType] = useState('all')
  const [page, setPage] = useState(1)
  const PAGE_SIZE = 6

  const filtered = useMemo(() => {
    return MOCK.filter(c => (type==='all' || c.tag===type) && c.title.toLowerCase().includes(q.toLowerCase()))
  }, [q,type])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const current = Math.min(page, totalPages)
  const start = (current - 1) * PAGE_SIZE
  const paginated = filtered.slice(start, start + PAGE_SIZE)

  function go(p) {
    const next = Math.max(1, Math.min(totalPages, p))
    setPage(next)
  }

  return (
    <div className="page-root">
      <Header />
      <main className="page-content">
        <div style={{display:'flex',gap:12,alignItems:'center',marginBottom:12}}>
          <input value={q} onChange={e=>{ setQ(e.target.value); setPage(1) }} placeholder="Buscar cursos..." className="search" />
          <select value={type} onChange={e=>{ setType(e.target.value); setPage(1) }} className="chip">
            <option value="all">Todos</option>
            <option value="Virtual">Virtual</option>
            <option value="Presencial">Presencial</option>
          </select>
        </div>

        <div className="grid-list">
          {paginated.map(c => (
            <CourseCardGrid key={c.id} course={c} />
          ))}
          {filtered.length===0 && <p>No se encontraron cursos.</p>}
        </div>

        <div className="pagination" style={{display:'flex',gap:8,alignItems:'center',marginTop:18}}>
          <button className="btn" onClick={()=>go(page-1)} disabled={page<=1}>Anterior</button>
          <div style={{display:'flex',gap:6}}>
            {Array.from({length: totalPages}).map((_,i) => {
              const p = i+1
              return (
                <button key={p} className={p===page ? 'btn primary small' : 'btn small'} onClick={()=>go(p)}>{p}</button>
              )
            })}
          </div>
          <button className="btn" onClick={()=>go(page+1)} disabled={page>=totalPages}>Siguiente</button>
        </div>
      </main>
    </div>
  )
}
