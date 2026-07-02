import React, { Suspense, lazy, useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Layout from './shared/components/Layout.jsx'
import { AuthProvider } from './modules/auth/context/AuthContext.jsx'
import RequireAuth from './modules/auth/components/RequireAuth.jsx'
import RequireRole from './modules/auth/components/RequireRole.jsx'
import LoginPage from './modules/auth/pages/LoginPage.jsx'
import ErrorBoundary from './shared/components/ErrorBoundary.jsx'

// Keep-alive: pings the backend every 5 min to prevent cold starts on Render free tier
const KEEPALIVE_INTERVAL = 5 * 60 * 1000
function useKeepAlive(){
  useEffect(() => {
    let mounted = true
    async function ping(){
      try{ await fetch('/api/health', { method: 'GET' }) }catch{ /* ignore */ }
    }
    ping()
    const id = setInterval(() => { if(mounted) ping() }, KEEPALIVE_INTERVAL)
    return () => { mounted = false; clearInterval(id) }
  }, [])
}

const RegisterPage = lazy(() => import('./modules/auth/pages/RegisterPage.jsx'))
const ForgotPasswordPage = lazy(() => import('./modules/auth/pages/ForgotPasswordPage.jsx'))
const ResetPasswordPage = lazy(() => import('./modules/auth/pages/ResetPasswordPage.jsx'))
const VerifyEmailPage = lazy(() => import('./modules/auth/pages/VerifyEmailPage.jsx'))
const Home = lazy(() => import('./modules/home/pages/HomePage.jsx'))
const Cursos = lazy(() => import('./modules/courses/pages/CoursesPage.jsx'))
const Perfil = lazy(() => import('./modules/profile/pages/ProfilePage.jsx'))
const Alertas = lazy(() => import('./modules/alerts/pages/AlertsPage.jsx'))
const CursoDetail = lazy(() => import('./modules/courses/pages/CourseDetailPage.jsx'))
const UsersPage = lazy(() => import('./modules/users/pages/UsersPage.jsx'))
const AulaVirtualPage = lazy(() => import('./modules/aulaVirtual/pages/AulaVirtualPage.jsx'))

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
        borderTop: '4px solid #c1121f',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite'
      }} />
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function App(){
  useKeepAlive()
  return (
    <BrowserRouter>
      <AuthProvider>
        <ErrorBoundary>
          <Suspense fallback={<LoadingFallback />}>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/auth/register" element={<RegisterPage />} />
              <Route path="/auth/forgot" element={<ForgotPasswordPage />} />
              <Route path="/auth/reset/:token" element={<ResetPasswordPage />} />
              <Route path="/auth/verify-email/:token" element={<VerifyEmailPage />} />

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
                      <RequireRole roles={["estudiante", "docente", "administrador", "master"]}>
                        <AulaVirtualPage />
                      </RequireRole>
                    }
                  />
                  <Route
                    path="/aula-virtual/:courseId"
                    element={
                      <RequireRole roles={["estudiante", "docente", "administrador", "master"]}>
                        <AulaVirtualPage />
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
        </ErrorBoundary>
      </AuthProvider>
    </BrowserRouter>
  )
}