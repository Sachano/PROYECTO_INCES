import React from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './modules/home/pages/HomePage.jsx'
import Cursos from './modules/courses/pages/CoursesPage.jsx'
import Perfil from './modules/profile/pages/ProfilePage.jsx'
import Alertas from './modules/alerts/pages/AlertsPage.jsx'
import CursoDetail from './modules/courses/pages/CourseDetailPage.jsx'
import Layout from './shared/components/Layout.jsx'
import { AuthProvider } from './modules/auth/context/AuthContext.jsx'
import RequireAuth from './modules/auth/components/RequireAuth.jsx'
import RequireRole from './modules/auth/components/RequireRole.jsx'
import LoginPage from './modules/auth/pages/LoginPage.jsx'
import UsersPage from './modules/users/pages/UsersPage.jsx'
import VirtualClassroomHomePage from './modules/virtualClassroom/pages/VirtualClassroomHomePage.jsx'
import VirtualClassroomCoursePage from './modules/virtualClassroom/pages/VirtualClassroomCoursePage.jsx'

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          <Route element={<RequireAuth />}>
            <Route element={<Layout />}>
              <Route path="/" element={<Home />} />
              <Route path="/cursos" element={<Cursos />} />
              <Route path="/cursos/:id" element={<CursoDetail />} />
              <Route path="/perfil" element={<Perfil />} />
              <Route path="/alertas" element={<Alertas />} />

              <Route
                path="/aula-virtual"
                element={
                  <RequireRole roles={["base", "admin"]}>
                    <VirtualClassroomHomePage />
                  </RequireRole>
                }
              />
              <Route
                path="/aula-virtual/:courseId"
                element={
                  <RequireRole roles={["base", "admin"]}>
                    <VirtualClassroomCoursePage />
                  </RequireRole>
                }
              />

              <Route
                path="/usuarios"
                element={
                  <RequireRole roles={["master"]}>
                    <UsersPage />
                  </RequireRole>
                }
              />
            </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}
