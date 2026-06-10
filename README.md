# INCES App (Cursos)

Aplicación de cursos con frontend en React + Vite y backend local simulado con Express. Incluye páginas: Home, Cursos, Perfil y Alertas (tipo inbox). La opción de Ajustes se removió.

## Estructura
- `src/` Frontend React
	- `components/` Componentes reutilizables (UI, modales, tarjetas)
	- `pages/` Vistas: Home, Cursos, Perfil, Alertas, CursoDetail
	- `services/api.js` Cliente HTTP hacia `/api`
	- `styles/` Estilos modulares por componente/página
- `backend/` API local simulada (Express)
	- `routes/`, `controllers/`, `services/`, `data/`

## Ejecutar en desarrollo (Windows PowerShell)
1. Instalar dependencias
```powershell
npm install
```
2. Levantar backend y frontend juntos
```powershell
npm run dev:all
```
- Frontend: http://localhost:5173
- Backend: http://localhost:3002

También puedes iniciar por separado:
```powershell
npm run server
npm run dev
```

## Usar PostgreSQL (Opcional)

Por defecto, la aplicación usa archivos JSON para desarrollo local. PostgreSQL es opcional y solo debe activarse cuando tengas la base de datos configurada y las credenciales correctas.

### 1. Configurar PostgreSQL
Instala PostgreSQL y crea una base de datos:
```sql
CREATE DATABASE inces;
```

### 2. Configurar variables de entorno
Edita `backend/.env` y usa estos valores si tienes PostgreSQL listo:
```env
USE_PG=true
PG_HOST=localhost
PG_PORT=5432
PG_USER=postgres
PG_PASS=tu-contraseña
PG_DB=inces
```

### 3. Ejecutar migraciones
```powershell
psql -U postgres -d inces -f backend/db/migrations/001_create_tables.sql
psql -U postgres -d inces -f backend/db/migrations/002_create_all_tables.sql
node backend/db/migrations/migrate_to_pg.js
```

### 4. Iniciar la aplicación
```powershell
npm run server
npm run dev
```

Si no tienes PostgreSQL configurado, deja `USE_PG=false` y la aplicación continuará con datos locales JSON.

## API Endpoints
- `GET /api/courses` – lista (query `type`, `q`)
- `GET /api/courses/:id` – detalle
- `GET /api/alerts` – inbox de alertas
- `POST /api/alerts/:id/read` – marcar leída
- `GET /api/profile` – obtener perfil
- `PUT /api/profile` – actualizar perfil

## Notas de diseño
- Estilos divididos en `src/styles/*` (archivos < 600 líneas)
- `Cursos` incluye tabs (Virtual/Presencial/Todos) y modal con detalles.
- `Perfil` con layout tipo red social (avatar iniciales + stats).
- `Alertas` con vista tipo bandeja de entrada (Gmail-like).

## Próximos pasos sugeridos
- Añadir paginación desde backend
- Autenticación (mock) y estado global (Redux/Zustand)
- Subida de avatar a `public/` o un servicio
- Implementar en el login un marcador de cedula (V,E,P) y bloquear los caracteres espereciales

## Usuarios de prueba
- Master: sachano@gmail.com / Sachano
- Admin: admin@inces.gob.ve / Admin123!
- Demo (estudiante): demo@inces.gob.ve / Demo123!
- Administrador: admin2@inces.gob.ve / Admin123!
- Docente: docente@inces.gob.ve / Docente123!

## Validaciones de Formularios

La aplicación incluye validaciones exhaustivas en los formularios para asegurar la integridad de los datos. Todas las validaciones se muestran visualmente debajo de cada campo en tiempo real, incluyendo contadores de caracteres, mensajes de error específicos y indicadores de formato válido/inválido.

### Reglas de Validación por Campo

#### Registro de Usuario (`RegisterPage`)
- **Nombres (firstName)**: Máximo 50 caracteres, solo letras y espacios (acentos permitidos), requerido.
- **Apellidos (lastName)**: Máximo 50 caracteres, solo letras y espacios, requerido.
- **Cédula**: Tipo (V/J/E/C/G/FP) + número (6-10 dígitos), solo números en la parte numérica, requerido. Validación de duplicados asíncrona.
- **Correo Electrónico (email)**: Máximo 50 caracteres, formato válido (@ y dominio), requerido. Validación de duplicados.
- **Teléfono Celular (phone)**: Máximo 15 caracteres, solo números, mínimo 10 dígitos, requerido. Validación de duplicados.
- **Teléfono de Emergencia (emergencyPhone)**: Máximo 15 caracteres, solo números, opcional. Validación de duplicados y no igual al teléfono personal.
- **Preguntas de Seguridad**: Mínimo 2 preguntas con respuestas (máximo 50 caracteres por respuesta, solo letras/números/espacios), requerido.

#### Inicio de Sesión (`LoginPage`)
- **Identificador**: Email o cédula (6-10 dígitos), formato válido detectado automáticamente.
- **Contraseña**: Requerido.

#### Recuperar Contraseña (`ForgotPasswordPage`)
- **Correo Electrónico**: Máximo 50 caracteres, formato válido (@ y dominio), opcional (uno de los dos requerido).
- **Cédula**: Solo números, 6-10 dígitos, opcional.

#### Restablecer Contraseña (`ResetPasswordPage`)
- **Contraseña**: Mínimo 8 caracteres, máximo 32, debe contener letra y número, requerido. Indicador visual de fuerza (Débil/Medio/Fuerte).
- **Confirmar Contraseña**: Debe coincidir con contraseña, requerido.

#### Crear/Editar Curso (`CourseUpsertModal`)
- **Título (title)**: Máximo 20 caracteres, requerido.
- **Descripción (description)**: Máximo 100 caracteres, requerido.
- **Descripción Larga (longDescription)**: Máximo 500 caracteres, opcional.
- **Horas (hours)**: Mínimo 0, máximo 99999, solo números, requerido.
- **Imagen**: Archivo de imagen, opcional.

#### Perfil de Usuario (`ProfilePage`)
- **Nombre (name)**: Máximo 60 caracteres, opcional.
- **Usuario (username)**: Máximo 25 caracteres, opcional.
- **Correo Electrónico (email)**: Máximo 50 caracteres, formato válido, opcional.
- **Bio**: Máximo 50 caracteres, opcional.

### Características de las Validaciones Visuales
- **Contadores de Caracteres**: Se muestran cuando el usuario escribe, indicando el límite actual vs máximo. Colores: gris para normal, rojo para excedido.
- **Mensajes de Error**: Aparecen inmediatamente si se viola una regla (ej. "Máximo 50 caracteres", "Campo requerido", "Debe contener @ y un dominio válido").
- **Validaciones Asíncronas**: Para campos únicos (email, teléfono, cédula), se verifica duplicados en tiempo real mostrando errores específicos.
- **Sanitización de Input**: Los campos restringen caracteres no permitidos (ej. solo números en teléfonos, solo letras en nombres).
- **Feedback en Tiempo Real**: No hay espera al submit; los errores se muestran mientras se escribe para una experiencia amigable.

Estas validaciones aseguran datos consistentes y previenen errores comunes, mejorando la usabilidad de la aplicación.

## Notas de Seguridad
- El archivo `backend/.env` contiene credenciales sensibles y NO debe ser commitado
- Los archivos JSON en `backend/db/` contienen datos de ejemplo para desarrollo
- En producción, usa PostgreSQL y configura variables de entorno apropiadamente