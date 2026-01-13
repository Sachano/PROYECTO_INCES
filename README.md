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
- Backend: http://localhost:3001

También puedes iniciar por separado:
```powershell
npm run server
npm run dev
```

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
