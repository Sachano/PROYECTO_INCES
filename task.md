# Lista de Tareas para Preparación del Despliegue

- [x] Modificar `backend/server.js` para soportar rutas estáticas relativas y dinámicas.
- [x] Crear `backend/package.json` dedicado para el backend.
- [x] Crear `backend/Dockerfile` para desplegar en EasyPanel.
- [x] Crear el script `tools/package-backend.js` para generar el `backend.zip`.
- [x] Modificar el `package.json` de la raíz para añadir el script `package:backend`.
- [x] Modificar `src/services/api.js` para usar la variable de entorno `VITE_API_URL`.
- [x] Crear `public/_redirects` para Netlify.
- [x] Ejecutar pruebas locales y generar el archivo `backend.zip`.
