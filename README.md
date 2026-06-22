# INCES - Plataforma de Gestión de Cursos y Aula Virtual

Aplicación web completa para la gestión de cursos, usuarios, aula virtual, notificaciones y panel administrativo del INCES.

## 🌐 Producción

| Servicio | URL | Estado |
|----------|-----|--------|
| **App** | [https://inces-api.onrender.com](https://inces-api.onrender.com) | ✅ Activo |
| **API Health** | [https://inces-api.onrender.com/api/health](https://inces-api.onrender.com/api/health) | ✅ `{"ok":true}` |
| **Base de datos** | Neon PostgreSQL | ✅ Conectado |

### Stack Tecnológico

- **Frontend:** React 18 + Vite, React Router, React Icons
- **Backend:** Express.js (API REST) — desplegado en Render
- **Base de datos:** Neon PostgreSQL (producción) / JSON files (desarrollo)
- **Seguridad:** bcrypt (hashing), express-rate-limit, JWT
- **Email:** Nodemailer (SMTP Gmail)

## Estructura del Proyecto

```
src/
├── modules/
│   ├── auth/        # Login, registro, recuperación de contraseña, 2FA
│   ├── users/       # Gestión de usuarios (admin/master)
│   ├── courses/     # Catálogo de cursos, inscripciones
│   ├── profile/     # Perfil de usuario
│   ├── alerts/      # Notificaciones tipo inbox
│   ├── aulaVirtual/ # Aula virtual, tareas, entregas
│   ├── dashboard/   # Dashboard de estadísticas
│   └── chatbot/     # Chatbot de ayuda
├── services/        # Cliente HTTP, manejo de errores
├── shared/          # Componentes, utilidades, estilos, i18n, logger
└── styles/          # CSS modular por componente

backend/
├── modules/
│   ├── auth/        # Login, registro, reset password, 2FA
│   ├── users/       # CRUD usuarios, validaciones, soft delete
│   ├── courses/     # Gestión de cursos, instructores
│   ├── profile/     # Perfil y cambio de contraseña
│   ├── alerts/      # Notificaciones
│   ├── aulaVirtual/ # Posts, assignments, submissions
│   ├── certificates/# Generación de certificados
│   ├── backups/     # Backups automáticos
│   ├── docs/        # Documentación API
│   └── notifications/# WebSockets notificaciones
├── shared/          # Auth, DB adapter, validaciones, auditoría
├── db/              # Migraciones PostgreSQL, seed
└── scripts/         # Backup automático, validaciones
```

## Ejecutar en Desarrollo

### Requisitos
- Node.js >= 16
- npm

### Instalación
```powershell
npm install
```

### Desarrollo (frontend + backend)
```powershell
npm run dev:all
```

- Frontend: http://localhost:5173
- Backend: http://localhost:3001

### Desarrollo por separado
```powershell
# Terminal 1 - Backend
npm run server

# Terminal 2 - Frontend
npm run dev
```

## Credenciales de Acceso

| Rol | Email | Contraseña |
|-----|-------|------------|
| Master | sachano@gmail.com | Sachano |
| Administrador | admin@inces.gob.ve | Admin123! |
| Administrador 2 | admin2@inces.gob.ve | Admin123! |
| Docente | docente@inces.gob.ve | Docente123! |
| Estudiante | demo@inces.gob.ve | Demo123! |

> **Nota:** Todos los usuarios creados por admin tienen contraseña temporal generada automáticamente y deben cambiarla en el primer login.

## Funcionalidades Implementadas

### Autenticación y Seguridad
- ✅ Login con email o cédula (detección automática)
- ✅ Registro público con validaciones completas
- ✅ Recuperación de contraseña por email
- ✅ Cambio de contraseña desde perfil
- ✅ Rate limiting en autenticación (30 req/min)
- ✅ Contraseñas hasheadas con bcrypt (10 rounds)
- ✅ 2FA/TOTP disponible (backend)
- ✅ Verificación de email (backend)
- ✅ Protección contra duplicados (cédula, email, teléfono)

### Gestión de Usuarios
- ✅ CRUD completo de usuarios (solo master)
- ✅ Asignación de cursos a administradores
- ✅ Activación/desactivación de usuarios
- ✅ Soft delete real + restauración
- ✅ Logs de auditoría básicos
- ✅ Validación centralizada backend+frontend

### Cursos
- ✅ Catálogo de cursos con paginación real
- ✅ Filtros por tipo (Virtual/Presencial)
- ✅ Búsqueda por título
- ✅ Asignación de instructores docentes
- ✅ Subida de imagen de portada
- ✅ Validaciones de título, descripción, horas

### Aula Virtual
- ✅ Inscripción en cursos
- ✅ Posts de contenido, tareas y calificaciones
- ✅ Entregas de assignments por estudiantes
- ✅ Listado de estudiantes por curso
- ✅ Permisos por rol (docente/admin/estudiante)

### Perfil de Usuario
- ✅ Edición de datos personales
- ✅ Cambio de contraseña con validación
- ✅ Contadores de caracteres en tiempo real

### Notificaciones
- ✅ Sistema de notificaciones tipo inbox
- ✅ Marcado como leído
- ✅ Alertas automáticas (nuevo docente, actualizaciones)

### Dashboard
- ✅ Panel de estadísticas para master/admin
- ✅ Conteo de usuarios, cursos, inscripciones, alertas

### Características Técnicas
- ✅ ErrorBoundary global para captura de errores React
- ✅ Manejo centralizado de errores de API
- ✅ Lazy loading de páginas para mejor performance
- ✅ Cache de GET requests (30 segundos)
- ✅ Sidebar responsive (overlay en móvil)
- ✅ Sistema de temas (claro/oscuro)
- ✅ Diseño responsive adaptado para móvil y escritorio
- ✅ ESLint + Prettier configurados
- ✅ Tests automatizados básicos
- ✅ Logger estructurado
- ✅ Compresión de imágenes al subir
- ✅ Backups automáticos de JSON
- ✅ Docker + docker-compose
- ✅ CI/CD GitHub Actions
- ✅ Accesibilidad básica (a11y)
- ✅ Internacionalización base (i18n) - ES/EN
- ✅ Búsqueda full-text básica
- ✅ Documentación API base (OpenAPI)

## API Endpoints Principales

```
Auth:
POST   /api/auth/login
POST   /api/auth/register
POST   /api/auth/forgot
POST   /api/auth/reset
POST   /api/auth/check-duplicate
POST   /api/auth/2fa/enable
POST   /api/auth/2fa/verify

Users:
GET    /api/users
GET    /api/users/:id
POST   /api/users
DELETE /api/users/:id
PATCH  /api/users/:id/status

Courses:
GET    /api/courses
GET    /api/courses/:id
POST   /api/courses
PUT    /api/courses/:id
DELETE /api/courses/:id
POST   /api/courses/upload-image

Profile:
GET    /api/profile
PUT    /api/profile
POST   /api/profile/password

Alerts:
GET    /api/alerts
POST   /api/alerts/:id/read

Aula Virtual:
GET    /api/aula-virtual/courses
POST   /api/aula-virtual/courses/:id/enroll
GET    /api/aula-virtual/courses/:id/students
GET    /api/aula-virtual/courses/:id/posts
POST   /api/aula-virtual/courses/:id/posts
GET    /api/aula-virtual/courses/:id/assignments/:id/submissions/me
POST   /api/aula-virtual/courses/:id/assignments/:id/submissions

Certificados:
GET    /api/certificates
POST   /api/certificates/issue

Backups:
GET    /api/backups

Docs:
GET    /api/docs/openapi.json
```

## Variables de Entorno

```env
# Backend (.env) — Desarrollo local
PORT=3002
USE_PG=false
JWT_SECRET=tu-secreto-jwt
FRONTEND_URL=http://localhost:5173

# Producción (configurar en Render dashboard)
USE_PG=true
DATABASE_URL=postgresql://...
JWT_SECRET=<secure-random-string>
FRONTEND_URL=https://inces-api.onrender.com

# Email SMTP
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=tu-email@gmail.com
SMTP_PASS=tu-contraseña
EMAIL_FROM=INCES <no-reply@inces.gob.ve>
```

## Comandos Disponibles

```powershell
npm run dev          # Frontend only
npm run server       # Backend only
npm run dev:all      # Frontend + Backend
npm run build        # Build producción frontend
npm run lint         # Ejecutar ESLint
npm run lint:fix     # Ejecutar ESLint + auto-fix
npm run format       # Formatear con Prettier
npm run test         # Tests automatizados
npm run migrate:pg   # Migrar datos JSON a PostgreSQL
npm run backup       # Ejecutar backup manual
```

## Docker

```powershell
docker compose up --build
```

Acceso: http://localhost:3002

## Próximas Mejoras

- Migración completa a PostgreSQL como única fuente de verdad
- Generación de certificados PDF descargables
- Dashboard de reportes avanzados con gráficos
- Verificación de email obligatoria en registro
- WebSockets para notificaciones en tiempo real
- Escaneo de archivos subidos (antivirus)
- Búsqueda full-text avanzada (Meilisearch/Elasticsearch)
