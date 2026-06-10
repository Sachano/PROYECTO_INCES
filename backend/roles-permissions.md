# Permisos por Rol - INCES App

## Resumen de Roles
- **master**: Control total del sistema. Puede crear, editar y eliminar todo.
- **administrador**: Gestión de cursos y usuarios limitados. Puede actualizar cursos.
- **docente**: Gestión de cursos asignados, estudiantes en sus cursos y aula virtual.
- **estudiante**: Acceso a cursos, inscripción, aula virtual y perfil.

## Permisos Detallados

### Usuarios (módulo /users)
| Acción              | master | administrador | docente | estudiante |
|---------------------|--------|---------------|---------|------------|
| Listar usuarios     | ✅     | ❌            | ❌      | ❌         |
| Crear usuario       | ✅     | ❌            | ❌      | ❌         |
| Ver detalle usuario | ✅     | ❌            | ❌      | ❌         |
| Cambiar estado      | ✅     | ❌            | ❌      | ❌         |
| Eliminar (lógico)   | ✅     | ❌            | ❌      | ❌         |

### Cursos (módulo /courses)
| Acción                    | master | administrador | docente | estudiante |
|---------------------------|--------|---------------|---------|------------|
| Listar cursos             | ✅     | ✅            | ✅      | ✅         |
| Crear curso               | ✅     | ❌            | ❌      | ❌         |
| Actualizar curso          | ✅     | ✅            | ❌      | ❌         |
| Eliminar curso            | ✅     | ❌            | ❌      | ❌         |
| Subir imagen              | ✅     | ❌            | ❌      | ❌         |
| Asignar instructor        | ✅     | ❌            | ❌      | ❌         |
| Inscribir estudiante      | ✅     | ✅            | ❌      | ✅         |

### Aula Virtual (/aula-virtual)
| Acción                          | master | administrador | docente | estudiante |
|---------------------------------|--------|---------------|---------|------------|
| Ver cursos inscritos            | ✅     | ✅            | ✅      | ✅         |
| Crear posts                     | ❌     | ✅            | ✅      | ❌         |
| Enviar entregas                 | ✅     | ✅            | ❌      | ✅         |
| Ver entregas de estudiantes     | ✅     | ✅            | ✅      | ❌         |

### Perfil y Alertas
| Acción           | master | administrador | docente | estudiante |
|------------------|--------|---------------|---------|------------|
| Ver/Editar perfil| ✅     | ✅            | ✅      | ✅         |
| Ver alertas      | ✅     | ✅            | ✅      | ✅         |
| Marcar leídas    | ✅     | ✅            | ✅      | ✅         |

### Notas
- Todos los roles requieren autenticación (JWT).
- master tiene bypass en algunas restricciones de aula virtual.
- Estudiantes solo ven sus cursos inscritos.
- Contraseñas temporales para usuarios creados: `Temp123!` (cambiar al primer login).

## Validación
Usuarios de cada rol agregados exitosamente en `backend/db/users.json` y documentados en README.
Funcionalidad de creación de usuarios implementada y verificada vía formulario en módulo Usuarios (solo master).
