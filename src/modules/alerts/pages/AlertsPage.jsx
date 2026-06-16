import React, {useEffect, useState} from 'react'
import Header from '../../../shared/components/Header.jsx'
import { api } from '../../../services/api.js'

export default function Alertas(){
  const [alerts, setAlerts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.alerts.list().then(setAlerts).finally(()=>setLoading(false))
  }, [])

  async function clear(id){
    await api.alerts.markRead(id)
    setAlerts(prev => prev.map(a => a.id===id ? { ...a, read: true } : a))
  }

  return (
    <>
      <Header />
      <main className="page-content">
        <h2>Alertas</h2>
        {loading && <p>Cargando...</p>}
        <div className="inbox-list">
          {alerts.map(a => (
            <div className={a.read ? 'inbox-item read' : 'inbox-item'} key={a.id}>
              <div className="inbox-left">
                <div className="inbox-subject">{a.subject}</div>
                <div className="inbox-text muted">{a.text}</div>
              </div>
              <div className="inbox-right">
                <div className="inbox-time">{a.time}</div>
                {!a.read && <button className="btn small" onClick={()=>clear(a.id)}>Marcar leída</button>}
              </div>
            </div>
          ))}
          {!loading && alerts.length===0 && <p>No hay alertas.</p>}
        </div>
      </main>
    </>
  )
}
