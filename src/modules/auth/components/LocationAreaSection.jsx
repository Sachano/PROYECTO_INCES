import React from 'react'

const LOCATIONS = [
  { code: 'SC', name: 'San Cristóbal' },
  { code: 'CCS', name: 'Caracas' },
  { code: 'MC', name: 'Maracaibo' },
  { code: 'VAL', name: 'Valencia' },
  { code: 'BARQ', name: 'Barquisimeto' },
  { code: 'MCBO', name: 'Maturín' },
  { code: 'CCC', name: 'Ciudad Bolívar' },
  { code: 'CUM', name: 'Cumaná' },
  { code: 'PTO', name: 'Puerto La Cruz' },
  { code: 'GUAY', name: 'Guayana' },
  { code: 'BARIN', name: 'Barinas' },
  { code: 'MERIDA', name: 'Mérida' },
  { code: 'TRUJ', name: 'Trujillo' },
  { code: 'LARA', name: 'Lara' },
  { code: 'CARABOBO', name: 'Carabobo' },
  { code: 'ARAGUA', name: 'Aragua' },
  { code: 'ANZOATEGUI', name: 'Anzoátegui' },
  { code: 'SUCRE', name: 'Sucre' },
  { code: 'MONAGAS', name: 'Monagas' },
  { code: 'BOLIVAR', name: 'Bolívar' },
]

const AREAS = [
  { code: 'INF', name: 'Informática' },
  { code: 'TXT', name: 'Textil' },
  { code: 'ELEC', name: 'Electricidad' },
  { code: 'CARP', name: 'Carpintería' },
  { code: 'SOLD', name: 'Soldadura' },
  { code: 'MECL', name: 'Mecánica Ligera (Autos)' },
  { code: 'ADMIN', name: 'Administración' },
  { code: 'CONT', name: 'Contabilidad' },
  { code: 'MARK', name: 'Marketing Digital' },
  { code: 'DIS', name: 'Diseño' },
  { code: 'UX', name: 'Experiencia de Usuario (UX)' },
  { code: 'PROG', name: 'Programación' },
  { code: 'PYTHON', name: 'Python Básico' },
  { code: 'GER', name: 'Gestión de Proyectos' },
  { code: 'ASIST', name: 'Asistente Administrativo' },
  { code: 'RELE', name: 'Reparación de Electrodomésticos' },
]

export default function LocationAreaSection({ location, area, onChange, errors }) {
  return (
    <div className="form-section" style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Centro de Estudios
      </h3>

      <div className="input-group">
        <label className="sr-only">Sede / Ubicación</label>
        <select
          className="input"
          name="location"
          value={location}
          onChange={onChange}
          required
          style={{ appearance: 'auto' }}
        >
          <option value="">Selecciona la Sede *</option>
          {LOCATIONS.map(loc => (
            <option key={loc.code} value={loc.code}>
              {loc.name} ({loc.code})
            </option>
          ))}
        </select>
      </div>
      {errors?.location && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          {errors.location}
        </div>
      )}

      <div className="input-group">
        <label className="sr-only">Área / Curso</label>
        <select
          className="input"
          name="area"
          value={area}
          onChange={onChange}
          required
          style={{ appearance: 'auto' }}
        >
          <option value="">Selecciona el Área/Curso *</option>
          {AREAS.map(a => (
            <option key={a.code} value={a.code}>
              {a.name} ({a.code})
            </option>
          ))}
        </select>
      </div>
      {errors?.area && (
        <div style={{ color: '#e94560', fontSize: '12px', marginTop: '4px' }}>
          {errors.area}
        </div>
      )}
    </div>
  )
}