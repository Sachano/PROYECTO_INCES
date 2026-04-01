import React, { Suspense, lazy } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './shared/components/Layout.jsx'
import { AuthProvider } from './modules/auth/context/AuthContext.jsx'
import RequireAuth from './modules/auth/components/RequireAuth.jsx'
import RequireRole from './modules/auth/components/RequireRole.jsx'
import LoginPage from './modules/auth/pages/LoginPage.jsx'

// Lazy load pages for better performance
const RegisterPage = lazy(() => import('./modules/auth/pages/RegisterPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('./modules/auth/pages/ResetPasswordPage.jsx'))
const Home = lazy(() => import('./modules/home/pages/HomePage.jsx'))
const Cursos = lazy(() => import('./modules/courses/pages/CoursesPage.jsx'))
const Perfil = lazy(() => import('./modules/profile/pages/ProfilePage.jsx'))
const Alertas = lazy(() => import('./modules/alerts/pages/AlertsPage.jsx'))
const CursoDetail = lazy(() => import('./modules/courses/pages/CourseDetailPage.jsx'))
const UsersPage = lazy(() => import('./modules/users/pages/UsersPage.jsx'))
const VirtualClassroomHomePage = lazy(() => import('./modules/virtualClassroom/pages/VirtualClassroomHomePage.jsx'))
const VirtualClassroomCoursePage = lazy(() => import('./modules/virtualClassroom/pages/VirtualClassroomCoursePage.jsx'))

// Loading fallback component
function LoadingFallback(){
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: '#f5f5f5'
    }}>
      <div style={{
        width: '40px',
        height: '40px',
        border: '4px solid #e0e0e0',
        borderTop: '4px solid #1976d2',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App(){
  return (
    <BrowserRouter>
      <AuthProvider>
        <Suspense fallback={<LoadingFallback />}>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/auth/register" element={<RegisterPage />} />
            <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
            <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />

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
        </Suspense>
      </AuthProvider>
    </BrowserRouter>
  )
}
