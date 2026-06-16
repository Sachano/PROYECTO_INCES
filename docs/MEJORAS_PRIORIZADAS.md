# MEJORAS PRIORIZADAS - INCES App
**Fecha de generación:** 2026-05-25  
**Propósito:** Documento de solo lectura con mejoras priorizadas del proyecto.  
**Estado:** ARCHIVO DE SOLO LECTURA - No modificar directamente.

---

## 1. URGENTE (Crítico - Seguridad y Bugs que rompen funcionalidad)

- [x] **Corregir verificación de cédula duplicada** ✅ **COMPLETADO 2026-05-25**  
  El endpoint `/auth/check-duplicate` ignora completamente el campo `cedula`. El frontend llama para cédula pero nunca detecta duplicados.  
  **Archivos:** `backend/modules/auth/service.js`, `backend/shared/utils.js`, `backend/shared/dbAdapter.js`  
  **Solución:** Se creó `normalizeCedula()` centralizado + se actualizó checkDuplicate, register() y findUserByCedula para normalización robusta (soporta V12345678, V-12345678, 12345678, mayúsculas/minúsculas).  
  **Validación:** Pruebas reales contra backend en puerto 3002 confirmaron detección correcta en múltiples formatos.  
  **Esfuerzo:** Simple (1-2 horas)

- [x] **Unificar y endurecer la creación de usuarios** ✅ **COMPLETADO 2026-05-26**  
  Implementado (resumen):  
  - Unificación de la lógica de creación de usuarios: `auth.register` delega a `users.createUser` para evitar duplicación.  
  - `users.createUser` ahora realiza validaciones alineadas con el registro público, usa `normalizeCedula`, genera contraseña temporal segura (`generateSecurePassword`), fuerza `mustChangePassword` y opcionalmente genera `enrollment` cuando se proveen `location` y `area`.  
  - Seguridad: respuestas de preguntas de seguridad ahora se almacenan como hashes (bcrypt).  
  - Email: el flujo de creación (registro y admin) intenta enviar email de bienvenida (nodemailer / ethereal fallback).  
  - Frontend admin: modal de creación actualizado con `cedulaType`, `location`, `area`, verificación de duplicados y muestra de contraseña temporal.  
  - Archivos modificados clave: `backend/modules/users/service.js`, `backend/modules/users/controller.js`, `backend/modules/auth/service.js`, `backend/modules/auth/controller.js`, `backend/shared/utils.js`, `src/modules/users/pages/UsersPage.jsx`  
  - Validación: pruebas manuales en entorno local confirmaron detección de duplicados, generación de contraseña segura y envío de email (ethereal preview).  
  - Notas / próximos pasos (no bloqueantes): implementar verificación completa en frontend admin, reforzar mustChangePassword en login flow, añadir tests y rate-limiting.  
  **Esfuerzo estimado:** Medio (completo en fases)

- [x] **Añadir rate-limiting en endpoints de autenticación** ✅ **COMPLETADO 2026-05-29**  
  Se añadió middleware `express-rate-limit` a `/api/auth` con límite de 30 solicitudes por minuto por IP.  
  **Archivos:** `backend/server.js`  
  **Validación:** Se verificó que se respete el límite mediante pruebas manuales (simulando múltiples requests).  
  **Esfuerzo:** Medio (usar `express-rate-limit`)

- [x] **Reemplazar contraseña estática `Temp123!` en creación admin** ✅ **COMPLETADO 2026-05-26**  
  La creación admin (`POST /users`) ahora usa `generateSecurePassword(12)` (igual que el registro público) y establece `mustChangePassword: true` para forzar cambio en primer login.  
  **Archivos:** `backend/modules/users/service.js`  
  **Validación:** Se verificó que los usuarios creados vía admin reciben una contraseña segura aleatoria y que el flujo de login obliga a cambiarla.  
  **Esfuerzo:** Simple

- [x] **Proteger respuestas de preguntas de seguridad** ✅ **COMPLETADO 2026-05-28**  
  Las respuestas a las preguntas de seguridad ahora se almacenan como hashes bcrypt (never in plain text) tanto en el flujo de registro público como en la creación admin.  
  **Archivos:** `backend/modules/auth/service.js`, `backend/modules/users/service.js`  
  **Validación:** Se inspeccionó la base de datos y se confirmó que el campo `answerHash` contiene un hash y no el texto plano.  
  **Esfuerzo:** Medio

- [x] **Validar variables de entorno al iniciar el servidor** ✅ **COMPLETADO 2026-05-29**  
  Se añadió validación temprana de variables críticas (JWT_SECRET, SMTP_* si se usa email) con mensajes claros y salida del proceso si faltan o son débiles.  
  **Archivos:** `backend/server.js`  
  **Validación:** Se simuló arranque con variables faltantes y se confirmó que el servidor no inicia y muestra error explicativo.  
  **Esfuerzo:** Simple

---

## 2. ALTA PRIORIDAD (Consistencia y Funcionalidad clave)

- [ ] **Añadir `cedulaType` al formulario de creación de usuarios (admin)**  
  Actualmente solo permite cédula sin tipo, rompiendo consistencia con el registro público.  
  **Archivos:** `src/modules/users/pages/UsersPage.jsx:34-36`, `backend/modules/users/service.js`  
  **Esfuerzo:** Simple

- [ ] **Hacer que la creación admin también envíe email de bienvenida**  
  Igual que el registro público.  
  **Archivos:** `backend/modules/users/service.js`, `backend/modules/auth/emailTemplate.js`  
  **Esfuerzo:** Medio

- [ ] **Implementar paginación real en backend y frontend**  
  Actualmente se cargan todos los usuarios, cursos y posts sin límite.  
  **Módulos afectados:** Users, Courses, VirtualClassroom, Alerts  
  **Esfuerzo:** Medio-Alto

- [ ] **Añadir endpoint y UI para cambio de contraseña desde el perfil**  
  Actualmente solo se puede cambiar vía recuperación.  
  **Archivos:** `src/modules/profile/pages/ProfilePage.jsx`, nuevo endpoint en `backend/modules/auth`

- [ ] **Centralizar validaciones** (backend + frontend)  
  Mover reglas a un módulo compartido para evitar duplicación y divergencia.  
  **Archivos:** `src/shared/utils.js`, `backend/shared/utils.js`

- [ ] **Añadir logs de auditoría básicos**  
  Registrar: quién creó/deshabilitó usuarios, cambios en cursos, etc.  
  **Esfuerzo:** Medio

---

## 3. MEDIA PRIORIDAD (Calidad de Código, Tests, UX)

- [ ] **Añadir ESLint + Prettier + scripts de lint**  
  Actualmente `package.json` no tiene `lint` ni formato obligatorio.  
  **Esfuerzo:** Simple

- [ ] **Implementar tests automatizados**  
  - Backend: supertest + vitest/jest  
  - Frontend: @testing-library/react  
  - Cobertura mínima: auth, users, courses  
  **Esfuerzo:** Alto (recomendado incremental)

- [ ] **Reducir tamaño de componentes grandes**  
  `RegisterPage.jsx` tiene 751 líneas. Dividir en componentes más pequeños.  
  **Esfuerzo:** Medio

- [ ] **Añadir ErrorBoundary global**  
  Actualmente errores de React pueden romper toda la aplicación.  
  **Archivos:** `src/App.jsx`

- [ ] **Mejorar manejo de errores de API**  
  Muchos catch solo muestran "Error" genérico. Unificar mensajes amigables.  
  **Archivos:** `src/services/api.js`

- [ ] **Añadir compresión y redimensionado de imágenes al subir**  
  Actualmente se guardan archivos originales sin optimizar.  
  **Módulos:** Courses upload, VirtualClassroom upload

- [ ] **Reemplazar console.log por logger estructurado** (pino o winston)  
  Especialmente en producción.

---

## 4. BAJA PRIORIDAD / NICE-TO-HAVE (Infra, Features avanzadas, Futuro)

- [ ] **Soporte Docker + docker-compose** (app + PostgreSQL)
- [ ] **Backups automáticos** de archivos JSON cuando se usa modo sin PostgreSQL
- [ ] **Generación de certificados** al completar cursos
- [ ] **Dashboard de reportes y estadísticas** para master/admin
- [ ] **Verificación de email** antes de activar cuenta (registro público)
- [ ] **Soporte 2FA / MFA** (TOTP)
- [ ] **Internacionalización (i18n)** o al menos estandarización completa en español
- [ ] **Búsqueda full-text** (PostgreSQL tsvector o Meilisearch)
- [ ] **WebSockets** para notificaciones en tiempo real (en vez de polling)
- [ ] **Escaneo de archivos subidos** (antivirus)
- [ ] **Soft delete real + restauración** para todas las entidades
- [ ] **CI/CD** (GitHub Actions) with lint + tests + build + deploy
- [ ] **Auditoría de accesibilidad (a11y)**
- [ ] **Documentación de API** (OpenAPI / Swagger)
- [ ] **Migración completa a PostgreSQL** como única fuente de verdad (quitar modo JSON)

---

## 5. Notas adicionales

- **Orden de ejecución recomendado:**  
  URGENTE → ALTA → MEDIA → BAJA

- Este documento debe mantenerse actualizado cada vez que se complete o se añada una mejora.

- Para marcar un ítem como completado, cambiar `[ ]` por `[x]`.

**Fin del documento - Solo lectura**