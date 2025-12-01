import React, {useState, useEffect} from 'react'
import Header from '../components/Header.jsx'

export default function Ajustes(){
  const [dark, setDark] = useState(()=>localStorage.getItem('dark')==='1')

  useEffect(()=>{
    document.documentElement.classList.toggle('dark', dark)
    localStorage.setItem('dark', dark ? '1' : '0')
  },[dark])

  return (
    <div className="page-root">
      <Header />
      <main className="page-content">
        <h2>Ajustes</h2>
        <div style={{display:'grid',gap:12,maxWidth:640}}>
          <label style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
            Tema oscuro
            <input type="checkbox" checked={dark} onChange={e=>setDark(e.target.checked)} />
          </label>
          <label>Idioma
            <select>
              <option>Español</option>
              <option>Inglés</option>
            </select>
          </label>
        </div>
      </main>
    </div>
  )
}
