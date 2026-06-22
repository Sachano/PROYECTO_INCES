import { useState } from 'react'
import { api } from '../../../services/api.js'

const TEMPLATE = `Marketing digital,Curso completo de marketing,Virtual,24
Python avanzado,Funciones y módulos avanzados,Virtual,30
Soldadura industrial,Técnicas industriales de soldadura,Presencial,60`

export default function BulkCourseModal({ onClose, onCreated }){
  const [raw, setRaw] = useState('')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState(null)
  const [error, setError] = useState('')

  function parseLines(text){
    return text.split('\n')
      .map(l => l.trim())
      .filter(Boolean)
      .map(l => {
        const parts = l.split(',').map(s => s.trim())
        if(parts.length < 2) return null
        return {
          title: parts[0],
          description: parts[1],
          tag: parts[2] && ['Virtual','Presencial'].includes(parts[2]) ? parts[2] : 'Virtual',
          hours: parseInt(parts[3], 10) || 10,
        }
      })
      .filter(Boolean)
  }

  async function handleSubmit(e){
    e.preventDefault()
    setError('')
    setResult(null)

    const courses = parseLines(raw)
    if(courses.length === 0){
      setError('Ingresa al menos un curso válido (título, descripción)')
      return
    }
    if(courses.length > 50){
      setError('Máximo 50 cursos por lote')
      return
    }

    setLoading(true)
    try{
      const res = await api.courses.bulkCreate(courses)
      setResult(res)
      setRaw('')
    }catch(err){
      setError(err?.body?.message || err?.body?.error || 'Error al crear cursos')
    }finally{
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-card" style={{maxWidth:640}} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Carga masiva de cursos</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="modal-body">
          <p style={{color:'var(--muted)',marginBottom:12,fontSize:13}}>
            Ingresa un curso por línea con el formato: <strong>título, descripción, tipo, horas</strong>
          </p>

          <div style={{marginBottom:12}}>
            <label style={{fontSize:12,color:'var(--muted)',display:'block',marginBottom:4}}>Formato (título, descripción, Virtual/Presencial, horas):</label>
            <textarea
              className="form-input"
              value={raw}
              onChange={e => setRaw(e.target.value)}
              rows={8}
              placeholder={TEMPLATE}
              style={{width:'100%',resize:'vertical',fontFamily:'monospace',fontSize:13}}
            />
          </div>

          <div style={{fontSize:12,color:'var(--muted)',marginBottom:16}}>
            Cursos detectados: <strong>{parseLines(raw).length}</strong>
          </div>

          {error && <div className="form-error" style={{marginBottom:12}}>{error}</div>}

          {result && (
            <div className="form-success" style={{marginBottom:12}}>
              {result.count} cursos creados exitosamente
            </div>
          )}

          <div style={{display:'flex',gap:12,justifyContent:'flex-end'}}>
            <button type="button" className="btn" onClick={onClose}>Cerrar</button>
            <button type="button" className="btn btn-sm" onClick={() => setRaw(TEMPLATE)} style={{fontSize:12}}>
              Usar ejemplo
            </button>
            <button type="submit" className="btn full" disabled={loading}>
              {loading ? 'Creando...' : `Crear ${parseLines(raw).length} cursos`}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
