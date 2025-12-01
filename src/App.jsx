import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Cursos from './pages/Cursos.jsx'
import Perfil from './pages/Perfil.jsx'
import Alertas from './pages/Alertas.jsx'
import Ajustes from './pages/Ajustes.jsx'
import CursoDetail from './pages/CursoDetail.jsx'

export default function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
  <Route path="/cursos" element={<Cursos />} />
  <Route path="/cursos/:id" element={<CursoDetail />} />
        <Route path="/perfil" element={<Perfil />} />
        <Route path="/alertas" element={<Alertas />} />
        <Route path="/ajustes" element={<Ajustes />} />
      </Routes>
    </BrowserRouter>
  )
}
