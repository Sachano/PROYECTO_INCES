# SPEC.md - Sistema de Gestión de Cursos INCES

> **Fecha de creación:** 2026-03-14  
> **Versión:** 1.0.0  
> **Autor:** Kilo Code - Análisis y Documentación

---

## 1. Descripción General del Proyecto

### 1.1 ¿Qué es el Proyecto?

El **Sistema de Gestión de Cursos INCES** es una plataforma educativa web desarrollada para el Instituto Nacional de Capacitación y Educación Socialista (INCES) de Venezuela. La aplicación permite la gestión integral de cursos de capacitación profesional, tanto virtuales como presenciales, junto con un aula virtual para la entrega de tareas y contenido educativo.

### 1.2 Tecnología Utilizada

| Capa | Tecnología |
|------|------------|
| **Frontend** | React 18 + Vite |
| **Backend** | Express.js (Node.js) |
| **Base de datos** | JSON (desarrollo) / PostgreSQL (producción - en migración) |
| **Autenticación** | JWT + bcrypt |
| **Estilos** | CSS Modules |
| **UI Components** | CoreUI React |

### 1.3 Estructura del Proyecto

```
PROYECTO_INCES/
├── src/                          # Frontend React
│   ├── modules/
│   │   ├── auth/                 # Autenticación y Login
│   │   ├── courses/              # Gestión de Cursos
│   │   ├── users/                # Administración de Usuarios
│   │   ├── profile/              # Perfil de Usuario
│   │   ├── alerts/               # Sistema de Alertas/Notificaciones
│   │   ├── home/                 # Página Principal
│   │   └── virtualClassroom/     # Aula Virtual
│   ├── services/                 # API Client
│   ├── shared/                   # Componentes Compartidos
│   └── styles/                  # Estilos CSS
├── backend/                      # API Express
│   ├── modules/                  # Módulos de negocio
│   │   ├── auth/
│   │   ├── courses/
│   │   ├── users/
│   │   ├── profile/
│   │   ├── alerts/
│   │   └── virtualClassroom/
│   ├── shared/                   # Utilidades compartidas
│   └── db/                       # Archivos JSON (BD)
├── public/                       # Assets estáticos
├── uploads/                      # Archivos subidos
└── tools/                        # Utilidades CLI
```

---

## 2. Público Objetivo

### 2.1 Tipos de Usuarios

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Master** | Administrador supreme del sistema | Acceso completo: gestión de usuarios, cursos, configuración |
| **Admin** | Instructor/Coordinador | Gestiona cursos asignados, contenido del aula virtual |
| **Base** | Estudiante | Visualiza cursos, se inscribe, accede al aula virtual |

### 2.2 Usuarios de Prueba

| Rol | Email | Cédula | Contraseña |
|-----|-------|--------|------------|
| Estudiante | ana.perez@inces.gob.ve | V-12345678 | inces1 |
| Admin | carlos.gomez@inces.gob.ve | V-23456789 | inces1 |
| Master | maria.rodriguez@inces.gob.ve | V-34567890 | inces1 |

### 2.3 Flujo de Usuarios

```
┌─────────────────────────────────────────────────────────────────┐
│                        VISITANTE                                │
│                   (Sin autenticación)                           │
└─────────────────────┬───────────────────────────────────────────┘
                      │ Login
                      ▼
┌─────────────────────────────────────────────────────────────────┐
│                      LOGIN PAGE                                 │
│     ├─ Email (dominio @inces.gob.ve)                           │
│     ├─ Cédula (V/E/P-XXXXXXXX)                                  │
│     └─ Contraseña                                               │
└─────────────────────┬───────────────────────────────────────────┘
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
    ┌──────────┐ ┌──────────┐ ┌──────────┐
    │  BASE    │ │  ADMIN   │ │  MASTER  │
    │ (Student)│ │ (Teacher)│ │ (Admin)  │
    └────┬─────┘ └────┬─────┘ └────┬─────┘
         │           │            │
         ▼           ▼            ▼
    ┌──────────────────────────────────────────┐
    │         PÁGINAS COMUNES                  │
    │  ├─ Home                                 │
    │  ├─ Cursos (ver/buscar/inscribirse)      │
    │  ├─ Perfil                                │
    │  ├─ Alertas                               │
    │  └─ Aula Virtual                          │
    └──────────────────────────────────────────┘
                      │
                      ▼ (solo Admin/Master)
    ┌──────────────────────────────────────────┐
    │       PÁGINAS DE GESTIÓN                 │
    │  └─ Gestión de Usuarios (solo Master)    │
    └──────────────────────────────────────────┘
```

---

## 3. Funcionalidades Actuales

### 3.1 Sistema de Autenticación

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Login por Email | Autenticación con correo institucional | ✅ Implementado |
| Login por Cédula | Autenticación con número de cédula | ✅ Implementado |
| Validación de formato | Validación de email y cédula en cliente | ✅ Implementado |
| JWT Tokens | Generación y validación de tokens | ✅ Implementado |
| Hash de contraseñas | bcrypt con salt | ✅ Implementado |
| Recuperación de contraseña | Token por email (Nodemailer) | ✅ Implementado |
| Restablecer contraseña | Con token seguro + validación de fuerza | ✅ Implementado |
| Sesión persistente | Token en localStorage | ✅ Implementado |
| Roles de usuario | three (base, admin, master) | ✅ Implementado |
| Protección de rutas | RequireAuth, RequireRole | ✅ Implementado |

### 3.2 Gestión de Cursos

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Listado de cursos | Ver todos los cursos con filtros | ✅ Implementado |
| Tipos de curso | Virtual / Presencial / Todos | ✅ Implementado |
| Búsqueda | Por título de curso | ✅ Implementado |
| Detalle de curso | Información completa del curso | ✅ Implementado |
| Inscripción | Matricularse en un curso | ✅ Implementado |
| Crear curso | Solo Master | ✅ Implementado |
| Editar curso | Master y Admin | ✅ Implementado |
| Eliminar curso | Solo Master | ✅ Implementado |
| Asignar instructor | Master asigna docente | ✅ Implementado |
| Subir imagen | Portada del curso | ✅ Implementado |
| Pagination | 6 cursos por página | ✅ Implementado |

### 3.3 Aula Virtual

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Ver cursos inscritos | Lista de cursos del aula | ✅ Implementado |
| Publicar contenido | Archivos (imágenes, documentos) | ✅ Implementado |
| Publicar tareas | Asignaciones con fecha límite | ✅ Implementado |
| Publicar notas | Calificaciones/resultados | ✅ Implementado |
| Entregar tareas | Subir archivos PDF | ✅ Implementado |
| Ver entregas | Admin/Estudiante ven entregas | ✅ Implementado |
| Tipos de posts | content, grades, assignment | ✅ Implementado |

### 3.4 Gestión de Usuarios (Solo Master)

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Listar usuarios | Todos los usuarios del sistema | ✅ Implementado |
| Filtrar por rol | Base, Admin, Master | ✅ Implementado |
| Filtrar por estado | Activo, Deshabilitado | ✅ Implementado |
| Buscar usuarios | Por nombre, email, cédula | ✅ Implementado |
| Ver detalle | Información completa del usuario | ✅ Implementado |
| Deshabilitar cuenta | Eliminación lógica | ✅ Implementado |
| Reactivar cuenta | Restaurar usuario | ✅ Implementado |
| Asignar cursos a Admin | Assign courses to teachers | ✅ Implementado |

### 3.5 Perfil de Usuario

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Ver perfil | Datos del usuario actual | ✅ Implementado |
| Editar perfil | Actualizar información | ✅ Implementado |
| Avatar | Iniciales automáticas | ✅ Implementado |
| Estadísticas | Cursos inscritos, etc. | ✅ Implementado |

### 3.6 Sistema de Alertas/Notificaciones

| Funcionalidad | Descripción | Estado |
|---------------|-------------|--------|
| Bandeja de entrada | Ver todas las alertas | ✅ Implementado |
| Notificaciones no leídas | Contador de alertas nuevas | ✅ Implementado |
| Marcar como leída | individual y global | ✅ Implementado |
| Notificaciones del sistema | Bienvenida, alertas varias | ✅ Implementado |

---

## 4. Modelo de Datos

### 4.1 Entidades Principales

#### Usuario (users.json)
```json
{
  "id": 1,
  "uuid": "usr_xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
  "firstName": "Ana",
  "lastName": "Pérez",
  "cedula": "V-12345678",
  "email": "ana.perez@inces.gob.ve",
  "phone": "+58 412-0000001",
  "role": "base",
  "status": "active",
  "passwordHash": "$2b$10$...",
  "avatarUrl": "",
  "createdAt": "2026-01-13T00:00:00.000Z",
  "updatedAt": "2026-03-14T02:10:21.568Z",
  "lastLoginAt": "2026-03-14T02:10:21.568Z",
  "notifications": [
    {
      "id": "n1",
      "title": "Bienvenida",
      "message": "Tu cuenta de estudiante fue creada.",
      "read": false,
      "createdAt": "2026-01-13T00:00:00.000Z"
    }
  ]
}
```

#### Curso (courses.json)
```json
{
  "id": 1,
  "title": "Soldadura Básica",
  "author": "INCES",
  "hours": 40,
  "img": "/assets/course1.svg",
  "tag": "Virtual",
  "description": "Fundamentos de soldadura...",
  "longDescription": "Aprende desde cero...",
  "instructorUserId": 2,
  "syllabusUrl": "",
  "coverImg": "/uploads/courses/xxx.jpg",
  "updatedAt": "2026-02-10T23:56:33.929Z"
}
```

#### Inscripción (enrollments.json)
```json
{
  "items": [
    {
      "id": 1,
      "courseId": 3,
      "userId": 1,
      "status": "enrolled",
      "createdAt": "2026-01-14T00:00:00.000Z"
    }
  ]
}
```

#### Aula Virtual (aulaVirtual.json)
```json
{
  "courses": [
    {
      "courseId": 3,
      "posts": [
        {
          "id": 1,
          "courseId": 3,
          "type": "content|grades|assignment",
          "title": "Título del post",
          "description": "Descripción",
          "createdByUserId": 2,
          "createdAt": "2026-01-14T05:02:01.640Z",
          "dueAt": "2026-01-15T09:30:00.000Z",
          "files": [...]
        }
      ]
    }
  ]
}
```

---

## 5. Arquitectura del Sistema

### 5.1 Diagrama de Arquitectura General

```
┌─────────────────────────────────────────────────────────────────────┐
│                          CLIENTE (Browser)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                    REACT APPLICATION                         │   │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐         │   │
│  │  │  Home   │ │ Courses │ │ Profile │ │  Alerts │  ...    │   │
│  │  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘         │   │
│  │       │           │           │           │                │   │
│  │  ┌────┴───────────┴───────────┴───────────┴────┐        │   │
│  │  │              AUTH CONTEXT                       │        │   │
│  │  │     (JWT Token Management + User State)        │        │   │
│  │  └─────────────────────┬───────────────────────────┘        │   │
│  │                        │                                      │   │
│  │  ┌─────────────────────┴───────────────────────────┐        │   │
│  │  │              API SERVICE                         │        │   │
│  │  │         (HTTP Client + Interceptors)            │        │   │
│  │  └─────────────────────┬───────────────────────────┘        │   │
│  └────────────────────────┼────────────────────────────────────┘   │
│                            │                                         │
└────────────────────────────┼─────────────────────────────────────────┘
                             │ HTTPS
                             ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        SERVIDOR (Node.js)                          │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │                      EXPRESS SERVER                          │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │                 MIDDLEWARE LAYER                       │   │   │
│  │  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌─────────┐ │   │   │
│  │  │  │   CORS   │ │  Body    │ │  Static  │ │  Auth  │ │   │   │
│  │  │  │          │ │  Parser  │ │  Files   │ │ JWT    │ │   │   │
│  │  │  └──────────┘ └──────────┘ └──────────┘ └─────────┘ │   │   │
│  │  └──────────────────────────────────────────────────────┘   │   │
│  │                                                              │   │
│  │  ┌──────────────────────────────────────────────────────┐   │   │
│  │  │                   ROUTES LAYER                         │   │   │
│  │  │  ┌────────┐ ┌────────┐ ┌────────┐ ┌───────┐ ┌───────┐│   │   │
│  │  │  │ /auth  │ │/courses│ │/users  │ │/alerts│ │/aula  ││   │   │
│  │  │  │        │ │        │ │        │ │       │ │-virtual││   │   │
│  │  │  └────┬───┘ └────┬───┘ └────┬───┘ └───┬───┘ └───┬───┘│   │   │
│  │  └───────┼──────────┼──────────┼─────────┼─────────┼──────┘   │   │
│  │          │          │          │         │         │          │   │
│  │  ┌───────┴──────────┴──────────┴─────────┴─────────┴──────┐   │   │
│  │  │                 SERVICES LAYER                         │   │   │
│  │  │   (Business Logic + Data Processing)                  │   │   │
│  │  └─────────────────────┬───────────────────────────────────┘   │   │
│  │                        │                                       │   │
│  │  ┌─────────────────────┴───────────────────────────────────┐   │   │
│  │  │              DATA ACCESS LAYER                         │   │   │
│  │  │  ┌────────────────┐  ┌─────────────────────────────┐  │   │   │
│  │  │  │   JSON DB      │  │     PostgreSQL (Future)     │  │   │   │
│  │  │  │  (Development) │  │      (Production)          │  │   │   │
│  │  │  └────────────────┘  └─────────────────────────────┘  │   │   │
│  │  └────────────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 Flujo de Datos - Autenticación

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   CLIENTE    │      │   BACKEND    │      │    BD JSON   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  1. Login(cred.)   │                     │
       │───────────────────>│                     │
       │                    │  2. Buscar usuario  │
       │                    │────────────────────>│
       │                    │                     │
       │                    │<────────────────────│
       │                    │   (datos usuario)   │
       │                    │                     │
       │                    │  3. Validar bcrypt  │
       │                    │────────────────────>│
       │                    │                     │
       │                    │<────────────────────│
       │                    │   (resultado)        │
       │                    │                     │
       │    4. JWT Token    │                     │
       │<──────────────────│                     │
       │                    │                     │
       │  5. Guardar token │                     │
       │   en localStorage │                     │
       │                    │                     │
```

### 5.3 Flujo de Datos - Cursos e Inscripción

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   CLIENTE    │      │   BACKEND    │      │    BD JSON   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  1. GET /courses   │                     │
       │───────────────────>│                     │
       │                    │  2. Leer courses.json│
       │                    │────────────────────>│
       │                    │                     │
       │                    │<────────────────────│
       │                    │   (lista cursos)     │
       │                    │                     │
       │  3. Mostrar cursos │                     │
       │<───────────────────│                     │
       │                    │                     │
       │  4. Click inscribir │                     │
       │───────────────────>│                     │
       │                    │  5. Crear enrollment│
       │                    │────────────────────>│
       │                    │                     │
       │                    │<────────────────────│
       │                    │   (confirmación)    │
       │                    │                     │
       │  6. UI actualizado │                     │
       │<───────────────────│                     │
```

### 5.4 Flujo de Datos - Aula Virtual

```
┌──────────────┐      ┌──────────────┐      ┌──────────────┐
│   CLIENTE    │      │   BACKEND    │      │    BD JSON   │
└──────┬───────┘      └──────┬───────┘      └──────┬───────┘
       │                     │                     │
       │  1. GET /aula-virtual│                    │
       │───────────────────>│                     │
       │                    │  2. Leer aulas.json │
       │                    │────────────────────>│
       │                    │                     │
       │                    │<────────────────────│
       │                    │   (posts + archivos)│
       │  3. Mostrar aula   │                     │
       │<───────────────────│                     │
       │                    │                     │
       │  4. POST nueva tarea│                    │
       │  (con archivo)      │                     │
       │───────────────────>│                     │
       │                    │  5. Guardar archivo │
       │                    │  en /uploads/       │
       │                    │────────────────────>│
       │                    │                     │
       │                    │  6. Actualizar BD  │
       │                    │────────────────────>│
       │                    │                     │
       │  7. Confirmación   │                     │
       │<───────────────────│                     │
```

### 5.5 Diagrama de Roles y Permisos

```
                    ┌─────────────────┐
                    │    MASTER       │
                    │   (Super Admin) │
                    └────────┬────────┘
                             │
           ┌─────────────────┼─────────────────┐
           │                 │                 │
           ▼                 ▼                 ▼
    ┌─────────────┐   ┌─────────────┐   ┌─────────────┐
    │ Gestionar   │   │   Gestionar │   │  Config.    │
    │ TODOS los   │   │   TODOS los │   │  Sistema    │
    │ Usuarios    │   │   Cursos    │   │  (General)  │
    └─────────────┘   └─────────────┘   └─────────────┘
           │                 │                 │
           └────────┬────────┴────────┬────────┘
                    │                 │
                    ▼                 ▼
            ┌─────────────┐   ┌─────────────┐
            │    ADMIN    │   │    ADMIN    │
            │  (Instructor│   │  (Instructor│
            │  /Docente)  │   │  /Docente)  │
            └──────┬──────┘   └──────┬──────┘
                   │                 │
                   │    ┌────────────┴────────────┐
                   │    │                         │
                   ▼    ▼                         ▼
            ┌──────────────┐   ┌──────────────┐  ┌──────────────┐
            │  Gestionar  │   │  Aula Virtual│  │   Ver       │
            │  Cursos     │   │  (Publicar)  │  │   Perfil    │
            │  Asignados │   │              │  │             │
            └─────────────┘   └──────────────┘  └──────────────┘
                   │
                   └────────────┬────────────┘
                                │
                                ▼
                        ┌─────────────┐
                        │    BASE     │
                        │  (Estudiante│
                        │  /Usuario)  │
                        └──────┬──────┘
                               │
            ┌──────────────────┼──────────────────┐
            │                  │                  │
            ▼                  ▼                  ▼
     ┌────────────┐    ┌────────────┐    ┌────────────┐
     │   Ver      │    │ Inscribirse│    │   Aula    │
     │   Cursos   │    │   en Curso │    │  Virtual  │
     └────────────┘    └────────────┘    │ (Entregar │
                                         │  Tareas)  │
                                         └────────────┘
```

---

## 6. Propuestas de Mejora

### 6.1 Prioridad ALTA (Corto Plazo - 1-3 meses)

| # | Mejora | Descripción | Estado |
|---|--------|-------------|--------|
| 1 | **Paginación en API** | Implementar paginación server-side para cursos y usuarios | ⏳ Pendiente |
| 2 | **Validación de Cédula** | Mejorar validación: solo V/E/P + números, longitud exacta | ⏳ Pendiente |
| 3 | **Logout** | Implementar botón/cerrar sesión explícito | ⏳ Pendiente |
| 4 | **Base de Datos PostgreSQL** | Migrar de JSON a PostgreSQL para producción | 🔄 En progreso |
| 5 | **Upload de Avatar** | Permitir subir foto de perfil | ⏳ Pendiente |
| 6 | **Logs de Actividad** | Registrar acciones de usuarios (auditoría) | ⏳ Pendiente |

### 6.2 Prioridad MEDIA (Mediano Plazo - 3-6 meses)

| # | Mejora | Descripción | Prioridad |
|---|--------|-------------|-----------|
| 1 | **Dashboard Admin** | Panel con estadísticas (usuarios, cursos, inscripciones) | MEDIA |
| 2 | **Sistema de Mensajería** | Chat/Mensajes entre usuarios | MEDIA |
| 3 | **Evaluaciones Online** | Crear y tomar exámenes/quizzes | MEDIA |
| 4 | **Certificados** | Generación automática de certificados al completar curso | MEDIA |
| 5 | **Progreso de Curso** | Seguimiento del avance del estudiante | MEDIA |
| 6 | **Categorías de Cursos** | Organizar cursos por categorías/temáticas | MEDIA |
| 7 | **Comentarios/Reseñas** | Students can rate and review courses | MEDIA |
| 8 | **Notificaciones Push** | Notificaciones en tiempo real (WebSocket) | MEDIA |

### 6.3 Prioridad BAJA (Largo Plazo - 6-12 meses)

| # | Mejora | Descripción | Prioridad |
|---|--------|-------------|-----------|
| 1 | **App Móvil** | Aplicación nativa (iOS/Android) | BAJA |
| 2 | **Integración con payment** | Pasarela de pagos para cursos pagos | BAJA |
| 3 | **IA para Recomendaciones** | Recomendador de cursos basado en historial | BAJA |
| 4 | **Gamificación** | Puntos, logros, niveles | BAJA |
| 5 | **Multidioma** | Soporte para inglés, portugués | BAJA |
| 6 | **Reportes Avanzados** | Exportar a PDF/Excel | BAJA |
| 7 | **Webinars/Videoconferencias** | Clases en vivo integradas | BAJA |
| 8 | **LMS Completo** | Sistema de gestión de aprendizaje completo | BAJA |

---

## 7. Endpoints de API

### 7.1 Autenticación

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| POST | /api/auth/login | Iniciar sesión | No |
| POST | /api/auth/forgot | Solicitar recuperación de contraseña | No |
| POST | /api/auth/reset | Restablecer contraseña con token | No |
| GET | /api/auth/me | Obtener usuario actual | JWT |

### 7.2 Cursos

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | /api/courses | Listar todos los cursos | JWT |
| GET | /api/courses/:id | Ver detalle de curso | JWT |
| POST | /api/courses | Crear nuevo curso | Master |
| PUT | /api/courses/:id | Actualizar curso | Master/Admin |
| DELETE | /api/courses/:id | Eliminar curso | Master |
| POST | /api/courses/upload-image | Subir imagen de curso | Master |
| PUT | /api/courses/:id/instructor | Asignar instructor | Master |

### 7.3 Usuarios

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | /api/users | Listar usuarios | Master |
| GET | /api/users/:id | Ver detalle de usuario | Master |
| PATCH | /api/users/:id/status | Cambiar estado (active/disabled) | Master |
| DELETE | /api/users/:id | Eliminar usuario | Master |

### 7.4 Aula Virtual

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | /api/aula-virtual | Listar cursos del aula virtual | JWT |
| GET | /api/aula-virtual/:courseId | Ver posts de un curso | JWT |
| POST | /api/aula-virtual/:courseId | Crear post (tarea/contenido) | Admin |
| POST | /api/aula-virtual/:courseId/submit | Entregar tarea | Base |
| GET | /api/aula-virtual/:courseId/submissions | Ver entregas | Admin/Base |

### 7.5 Alertas

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | /api/alerts | Listar alertas del usuario | JWT |
| POST | /api/alerts/:id/read | Marcar como leída | JWT |

### 7.6 Perfil

| Método | Endpoint | Descripción | Auth |
|--------|----------|-------------|------|
| GET | /api/profile | Obtener perfil | JWT |
| PUT | /api/profile | Actualizar perfil | JWT |

---

## 8. Configuración y Variables de Entorno

### 8.1 Backend (.env)

```env
# Puerto del servidor
PORT=3001

# JWT Secret (generar cadena segura)
JWT_SECRET=your-super-secret-jwt-key-here

# Configuración de Email (SMTP)
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-user
SMTP_PASS=your-smtp-password
EMAIL_FROM=INCES <no-reply@inces.gob.ve>

# URL del Frontend
FRONTEND_URL=http://localhost:5173

# Configuración PostgreSQL (futuro)
# DB_HOST=localhost
# DB_PORT=5432
# DB_NAME=inces_app
# DB_USER=postgres
# DB_PASS=your-db-password
```

---

## 9. Glosario de Términos

| Término | Definición |
|---------|------------|
| **INCES** | Instituto Nacional de Capacitación y Educación Socialista (Venezuela) |
| **JWT** | JSON Web Token - Estándar para autenticación stateless |
| **bcrypt** | Algoritmo de hash de contraseñas |
| **Multer** | Middleware de Node.js para manejo de multipart/form-data |
| **Nodemailer** | Librería para envío de correos electrónicos |
| **LMS** | Learning Management System (Sistema de Gestión de Aprendizaje) |
| **Enrollment** | Inscripción/Matriculación en un curso |
| **Aula Virtual** | Espacio digital donde se comparte contenido y tareas de un curso |

---

## 10. Próximos Pasos Recomendados

1. ✅ Completar migración a PostgreSQL
2. ⏳ Implementar paginación server-side
3. ⏳ Agregar logout explícito
4. ⏳ Mejorar validación de Cédula
5. 🔄 Agregar sistema de logging/auditoría
6. 📋 Diseñar Dashboard para Admin

---

> **Documento generado por Kilo Code**  
> Este análisis fue realizado mediante estudio exhaustivo del código fuente del proyecto.
