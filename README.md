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

Por defecto, la aplicación usa archivos JSON para almacenar datos. Puedes migrar a PostgreSQL siguiendo estos pasos:

### 1. Configurar PostgreSQL
Instala PostgreSQL y crea una base de datos:
```sql
CREATE DATABASE inces;
```

### 2. Configurar variables de entorno
Edita `backend/.env` y establece:
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
# Ejecutar las migraciones SQL
psql -U postgres -d inces -f backend/db/migrations/001_create_tables.sql
psql -U postgres -d inces -f backend/db/migrations/002_create_all_tables.sql

# Opcional: Migrar datos existentes de JSON a PostgreSQL
node backend/db/migrations/migrate_to_pg.js
```

### 4. Iniciar la aplicación
La aplicación detectará automáticamente que `USE_PG=true` y usará PostgreSQL.

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
Estudiante: demo@inces.gob.ve / V-12345678
Admin: admin@inces.gob.ve / V-00000000
Clave: (cualquiera, la contraseña hasheada es para desarrollo)

## Notas de Seguridad
- El archivo `backend/.env` contiene credenciales sensibles y NO debe ser commitado
- Los archivos JSON en `backend/db/` contienen datos de ejemplo para desarrollo
- En producción, usa PostgreSQL y configura variables de entorno apropiadamente