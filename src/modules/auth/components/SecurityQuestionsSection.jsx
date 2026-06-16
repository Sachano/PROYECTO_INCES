import React from 'react'

const SECURITY_QUESTIONS = [
  { id: 'mascota', question: '¿Cómo se llama tu mascota?' },
  { id: 'abuela_materna', question: '¿Cómo se llama tu abuela materna?' },
  { id: 'abuela_paterna', question: '¿Cómo se llama tu abuela paterna?' },
  { id: 'lugar_nacimiento', question: '¿En qué hospital o lugar naciste?' },
  { id: 'colegio_bachiller', question: '¿En qué colegio te graduaste de bachiller?' },
  { id: 'primaria', question: '¿En qué escuela te graduaste de primaria?' },
  { id: 'ciudad_favorita', question: '¿Cuál es tu ciudad favorita?' },
  { id: 'comida_favorita', question: '¿Cuál es tu comida favorita?' },
  { id: 'pelicula_favorita', question: '¿Cuál es tu película favorita?' },
  { id: 'musica_favorita', question: '¿Cuál es tu género musical favorito?' },
]

export default function SecurityQuestionsSection({ questions, onChange, validationError }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <h3 style={{ fontSize: '14px', color: '#1a1a2e', marginBottom: '10px', borderBottom: '1px solid #eee', paddingBottom: '5px' }}>
        Preguntas de Seguridad (Mínimo 2) *
      </h3>

      {validationError && (
        <div style={{ color: '#e94560', fontSize: '12px', marginBottom: '10px' }}>
          {validationError}
        </div>
      )}

      {questions.map((sq, index) => (
        <div key={index} style={{ marginBottom: '15px' }}>
          <select
            className="input"
            value={sq.question}
            onChange={(e) => onChange(index, 'question', e.target.value)}
            style={{ appearance: 'auto', marginBottom: '8px' }}
          >
            <option value="">Pregunta {index + 1} *</option>
            {SECURITY_QUESTIONS.map(q => (
              <option key={q.id} value={q.question}>
                {q.question}
              </option>
            ))}
          </select>
          <input
            className="input"
            value={sq.answer}
            onChange={(e) => onChange(index, 'answer', e.target.value)}
            placeholder={`Respuesta a pregunta ${index + 1} *`}
            disabled={!sq.question}
          />
        </div>
      ))}
    </div>
  )
}