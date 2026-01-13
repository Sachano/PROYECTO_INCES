import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './modules/home/pages/HomePage.jsx'
import Cursos from './modules/courses/pages/CoursesPage.jsx'
import Perfil from './modules/profile/pages/ProfilePage.jsx'
import Alertas from './modules/alerts/pages/AlertsPage.jsx'
import CursoDetail from './modules/courses/pages/CourseDetailPage.jsx'
import Layout from './shared/components/Layout.jsx'

export default function App(){
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/cursos" element={<Cursos />} />
          <Route path="/cursos/:id" element={<CursoDetail />} />
          <Route path="/perfil" element={<Perfil />} />
          <Route path="/alertas" element={<Alertas />} />
          { /* Ajustes removido según requerimiento */ }
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
