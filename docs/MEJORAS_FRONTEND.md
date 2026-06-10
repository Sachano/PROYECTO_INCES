# MEJORAS FRONTEND - INCES App

**Fecha:** 2026-06-02  
**Propósito:** Mejoras específicas del frontend identificadas en revisión general

---

## 1. URGENTE (Bugs y UX críticos)

### F01: ErrorBoundary global ✅
- **Problema:** Errores de React pueden romper toda la aplicación
- **Ubicación:** `src/App.jsx`
- **Solución:** Implementar ErrorBoundary con fallback UI amigable
- **Esfuerzo:** Simple (1-2 horas)
- **Estado:** COMPLETADO - `src/shared/components/ErrorBoundary.jsx` creado, integrado en App.jsx, estilos en base.css

### F02: Manejo de errores de API unificado ✅
- **Problema:** Mensajes genéricos "Error" sin contexto en varios componentes
- **Ubicación:** `src/services/api.js`, handlers de error en páginas
- **Solución:** Centralizar manejo de errores con mensajes amigables y logging
- **Estado:** COMPLETADO - `getApiErrorMessage`, `logApiError`, `API_ERRORS` agregados a api.js, usados en RegisterPage y UsersPage

### F03: Validación de contraseña en registro ✅
- **Problema:** RegisterPage.jsx no solicita verificación de contraseña
- **Ubicación:** `src/modules/auth/pages/RegisterPage.jsx`
- **Solución:** Agregar campo confirmPassword con validación en tiempo real
- **Estado:** COMPLETADO - campo confirmPassword agregado con validación de coincidencia

---

## 2. ALTA PRIORIDAD (Consistencia y Funcionalidad)

### F04: Agregar `cedulaType` al formulario de creación admin ✅
- **Problema:** UsersPage.jsx no usa cedulaType consistente con RegisterPage
- **Ubicación:** `src/modules/users/pages/UsersPage.jsx:396-424`
- **Solución:** Añadir select de tipo de cédula con las mismas opciones (V, E, J, C, G, FP)
- **Esfuerzo:** Simple
- **Estado:** COMPLETADO - cedulaType agregado con todas las opciones

### F05: Endpoint y UI para cambio de contraseña desde perfil
- **Problema:** No hay forma de cambiar contraseña desde el perfil (solo recuperación)
- **Ubicación:** `src/modules/profile/pages/ProfilePage.jsx`
- **Solución:** Añadir pestaña/modal para cambio de contraseña con validación

### F06: Centralizar validaciones frontend-backend
- **Problema:** Duplicación de reglas de validación
- **Ubicación:** `src/shared/utils.js` ↔ `backend/shared/utils.js`
- **Solución:** Crear esquema único de validación compartido

### F07: Paginación real en frontend
- **Problema:** Actualmente paginación frontend pero carga todos los datos
- **Ubicación:** `src/modules/users/pages/UsersPage.jsx`, `src/modules/courses/pages/CoursesPage.jsx`
- **Solución:** Implementar scroll infinito o paginación server-side

---

## 3. MEDIA PRIORIDAD (Calidad de Código, Tests, Performance)

### F08: Refactorizar RegisterPage.jsx (751 líneas) ✅
- **Problema:** Componente demasiado grande, difícil de mantener
- **Ubicación:** `src/modules/auth/pages/RegisterPage.jsx`
- **Solución:** Dividir en: `PersonalInfoSection.jsx`, `SecurityQuestionsSection.jsx`, `LocationAreaSection.jsx`
- **Esfuerzo:** Medio
- **Estado:** COMPLETADO - componentes creados y RegisterPage refactorizado a ~400 líneas

### F09: Añadir ESLint + Prettier
- **Problema:** No hay linting ni formato obligatorio en package.json
- **Ubicación:** `package.json`
- **Solución:** Configurar eslint, prettier y scripts de lint/format
- **Esfuerzo:** Simple

### F10: Tests automatizados frontend
- **Problema:** Sin pruebas automatizadas
- **Ubicación:** Configuración inicial
- **Solución:** Vitest + React Testing Library para componentes críticos
- **Esfuerzo:** Alto (recomendado incremental)

### F11: Optimizar imágenes upload
- **Problema:** Imágenes subidas sin compresión/redimensionado
- **Ubicación:** `src/modules/courses`, `src/modules/aulaVirtual`
- **Solución:** Implementar compresión client-side antes del upload

### F12: Skeleton loaders en lugar de "Cargando..."
- **Problema:** UX básica durante carga de datos
- **Ubicación:** Todas las páginas con loading states
- **Solución:** Componentes Skeleton para tablas, cards y formularios

---

## 4. BAJA PRIORIDAD / NICE-TO-HAVE

### F13: Internacionalización (i18n)
- **Problema:** Textos hardcodeados en español
- **Ubicación:** Todos los componentes
- **Solución:** react-i18next con soporte para múltiples idiomas

### F14: React Query / SWR para cache
- **Problema:** Cache manual en api.js limitada
- **Ubicación:** `src/services/api.js`
- **Solución:** Migrar a TanStack Query para cache inteligente y revalidación

### F15: Component Library consistente
- **Problema:** Componentes duplicados con estilos inline
- **Ubicación:** Forms, buttons, cards
- **Solución:** Crear componentes reutilizables en `src/shared/components/ui/`

### F16: Responsive design audit
- **Problema:** Diseño móvil básico
- **Ubicación:** CSS global y componentes
- **Solución:** Auditoría de breakpoints y componentes mobile-first

### F17: Accesibilidad (a11y)
- **Problema:** Falta ARIA proper, foco keyboard, contraste
- **Ubicación:** Modales, botones, inputs
- **Solución:** Añadir atributos ARIA, navegación con teclado, auditoría axe

### F18: Animaciones y transiciones
- **Problema:** UI estática sin feedback visual
- **Ubicación:** Navegación, modales, paginación
- **Solución:** Framer Motion o CSS transitions suaves

---

## 5. POSIBLES MEJORAS A LA BASE DE DATOS

### DB01: Agregar columna `cedula_type` a tabla users
- **Problema:** Cédula sin tipo guardado por separado
- **Ubicación:** `backend/db/migrations/002_create_all_tables.sql`
- **Solución:** Normalizar cédula en `type` + `number` por separado

### DB02: Cambiar `security_questions` de JSONB a tabla relacionada
- **Problema:** JSONB difícil de query y validar
- **Ubicación:** Schema users
- **Solución:** Tabla `user_security_questions` con FK a users

### DB03: Agregar tracking de cambios (audit trail)
- **Problema:** Sin histórico de quién modificó qué
- **Ubicación:** Todas las tablas
- **Solución:** Tabla `audit_logs` con user_id, action, entity, timestamp

### DB04: Soft delete real + restauración
- **Problema:** Solo status='inactive' sin borrado seguro
- **Ubicación:** users, courses, alerts
- **Solución:** Agregar `deleted_at` timestamp y filtrar en queries

### DB05: Optimizar índices para búsqueda
- **Problema:** Búsqueda por nombre/email ineficiente
- **Ubicación:** users table
- **Solución:** Índice GIN en JSONB o full-text search

### DB06: Normalizar enums con CHECK constraints
- **Problema:** role/status sin constraint estricto
- **Ubicación:** Constraints existentes pero podrían ser más explícitos
- **Solución:** CREATE TYPE para roles y estados

---

## Orden de ejecución recomendado

1. **✅ F01 → F02 → F03** (Stabilidad) - COMPLETADO
2. **✅ F04 → F08** (Consistencia/Calidad) - COMPLETADO
3. F05 → F06 → F07 (Funcionalidad)
4. F09 → F10 → F11 → F12
5. DB01 → DB04
6. F13-F18 (Features avanzadas)