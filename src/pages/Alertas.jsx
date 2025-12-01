import React, {useState} from 'react'
import Header from '../components/Header.jsx'

const MOCK = [
  {id:1, text:'Nuevo curso: Programación Web disponible', time:'1h'},
  {id:2, text:'Tienes un mensaje del instructor', time:'2d'}
]

export default function Alertas(){
  const [alerts, setAlerts] = useState(MOCK)

  function clear(id){
    setAlerts(a => a.filter(x => x.id !== id))
  }

  return (
    <div className="page-root">
      <Header />
      <main className="page-content">
        <h2>Alertas</h2>
        <div style={{display:'flex',flexDirection:'column',gap:12}}>
          {alerts.map(a => (
            <div className="news-card" key={a.id}>
              <div style={{flex:1}}>
                <div style={{fontWeight:700}}>{a.text}</div>
                <div className="news-meta">{a.time}</div>
              </div>
              <div>
                <button className="btn ghost" onClick={()=>clear(a.id)}>Marcar leída</button>
              </div>
            </div>
          ))}
          {alerts.length===0 && <p>No hay alertas.</p>}
        </div>
      </main>
    </div>
  )
}
