import React, { useEffect, useMemo, useState } from 'react'
import Header from '../../../shared/components/Header.jsx'
import CourseHorizontal from '../../courses/components/CourseHorizontal.jsx'
import NewsCard from '../components/NewsCard.jsx'
import { api } from '../../../services/api.js'

export default function Home(){
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.courses.list().then(setCourses).finally(()=>setLoading(false))
  }, [])

  const popular = useMemo(() => courses.slice(0, 6), [courses])
  const news = useMemo(() => (
    courses.slice(0,3).map(c => ({ id:c.id, title:`Nuevo: ${c.title}`, meta:`${c.hours}h | ${c.tag}` }))
  ), [courses])
  return (
    <div className="home-root">
        <div className="top-area">
          <Header />

          <section className="hero">
            <div className="hero-overlay" />
            <div className="hero-content">
              <h2>¡Tu Futuro Comienza Aquí!</h2>
              <p>Explora cursos, inscríbete y crece profesionalmente.</p>

              <div className="hero-actions">
                <a href="/cursos" className="btn primary">Explorar Cursos</a>
                <a href="/perfil" className="btn ghost">Regístrate</a>
              </div>
              <div className="hero-dots" aria-hidden>
                <span className="dot active"></span>
                <span className="dot"></span>
                <span className="dot"></span>
              </div>
            </div>
          </section>
        </div>

        <main className="page-content">
          <section className="section">
            <h3 className="section-title">Cursos Populares</h3>
            <div className="h-scroll">
                {loading && <div>Cargando...</div>}
                {!loading && popular.map(c => (
                  <CourseHorizontal key={c.id} title={c.title} info={`${c.hours}h | ${c.tag}`} tag={c.tag} img={c.img} />
                ))}
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">Noticias y Novedades</h3>
            <div className="news-list">
              {news.map(n => (
                <NewsCard key={n.id} title={n.title} meta={n.meta} />
              ))}
            </div>
          </section>
        </main>
      </div>
  )
}
