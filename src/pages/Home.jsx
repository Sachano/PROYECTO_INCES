import React from 'react'
import Header from '../components/Header.jsx'
import CourseHorizontal from '../components/CourseHorizontal.jsx'
import NewsCard from '../components/NewsCard.jsx'
import BottomNav from '../components/BottomNav.jsx'

const sampleCourses = [
  { id:1, title: 'Soldadur Básica', info: '40h | Virtual', tag: 'Virtual', img:'/course1.svg' },
  { id:2, title: 'Programación Web', info: '40h | Virtual', tag: 'Virtual', img:'/course2.svg' },
  { id:3, title: 'Carpintería', info: '60h | Presencial', tag: 'Presencial', img:'/course1.svg' }
]

const sampleNews = [
  { id:1, title: 'Inscripciones Abiertas', meta: '40h | Virtual' },
  { id:2, title: 'Cursos proximos', meta: '1 toc 20:46' }
]

export default function Home(){
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
              {sampleCourses.map(c => (
                <CourseHorizontal key={c.id} title={c.title} info={c.info} tag={c.tag} img={c.img} />
              ))}
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Noticias y Novedades</h3>
          <div className="news-list">
            {sampleNews.map(n => (
              <NewsCard key={n.id} title={n.title} meta={n.meta} />
            ))}
          </div>
        </section>
      </main>

      <BottomNav />
    </div>
  )
}
