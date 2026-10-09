# Matriz de pruebas — Actividad Autónoma S8

**Base URL:** `http://localhost:8080/api/v1`  
**Fecha de ejecución:** completar durante las pruebas  
**Entorno y versión de backend:** completar  

> Completa «Resultado obtenido», «Estado» y «Evidencia» solo después de ejecutar cada caso. Si una acción se bloquea en la SPA, prueba también la petición equivalente en Postman donde la matriz lo indica. Guarda capturas en `docs/evidencias-s8/` usando el ID del caso.

| ID | Operación | Precondición | Datos | Resultado esperado | Resultado obtenido (SPA y HTTP) | Estado | Evidencia |
|---|---|---|---|---|---|---|---|
| A-01 | Alta válida | Categoría activa disponible | Producto nuevo; precio 5.50; stock 10; categoría activa | HTTP 201; aparece asociado a su categoría | **Pendiente de ejecutar** | — | — |
| A-02 | Alta sin categoría | Formulario nuevo abierto | `categoriaId` omitido | SPA impide enviar; API responde 400 | **Pendiente de ejecutar** | — | — |
| A-03 | Alta con categoría inexistente | API disponible | `categoriaId: 999` | API responde 404 | **Pendiente de ejecutar** | — | — |
| A-04 | Alta en categoría inactiva | Hay una categoría inactiva | Producto nuevo con su ID | SPA no la ofrece; API debería responder 409 | **Pendiente de ejecutar** | — | — |
| A-05 | Alta con nombre duplicado en otra capitalización | Producto existente conocido | Repetir nombre cambiando mayúsculas | HTTP 409 por unicidad sin distinción de mayúsculas | **Pendiente de ejecutar** | — | — |
| A-06 | Alta con precio cero y stock negativo | API disponible | `precio: 0`, `stock: -1` | SPA bloquea; API responde 400 con ambos errores de validación | **Pendiente de ejecutar** | — | — |
| A-07 | Alta con nombre en el límite mínimo | Categoría activa | Nombre de 3 caracteres, precio 0.01, stock 0 | HTTP 201 si los demás datos son válidos | **Pendiente de ejecutar** | — | — |
| A-08 | Alta con precio negativo | Categoría activa; API disponible | `precio: -1`, stock 1 | SPA bloquea; API responde 400 | **Pendiente de ejecutar** | — | — |
| C-01 | Cambio a otra categoría activa | Producto activo y dos categorías activas | Actualizar `categoriaId` | HTTP 200; listado refleja nueva categoría | **Pendiente de ejecutar** | — | — |
| C-02 | Cambio a categoría inactiva | Producto activo y categoría inactiva | Actualizar con ID inactivo | SPA lo impide; API debería responder 409 | **Pendiente de ejecutar** | — | — |
| C-03 | Desactivar categoría con productos activos | Categoría con producto activo | Editar categoría y cambiar `estado` a false | **Criterio adoptado:** impedir la desactivación y conservar consistencia de ventas | **Pendiente de ejecutar** | — | — |
| C-04 | Carrera entre dos pestañas | En pestaña 1, formulario de alta abierto; categoría X activa | En pestaña 2 desactivar X; luego guardar desde pestaña 1 | API debe revalidar al guardar e impedir producto asociado a categoría ahora inactiva | **Pendiente de ejecutar** | — | — |
| C-05 | Editar con categoría actual inactiva | Producto existente ligado a categoría inactiva | Cambiar solo nombre, conservando categoría | Debe permitir mantener relación existente o exigir traslado explícito; documentar decisión del producto | **Pendiente de ejecutar** | — | — |
| B-01 | Baja de producto activo | Producto activo | DELETE del producto | HTTP 204; producto permanece y aparece inactivo (baja lógica) | **Pendiente de ejecutar** | — | — |
| B-02 | Segunda baja del mismo producto | Producto ya dado de baja | Repetir DELETE | HTTP 409 con mensaje de producto ya inactivo | **Pendiente de ejecutar** | — | — |
| B-03 | Eliminar categoría sin productos | Categoría sin productos asociados | DELETE de categoría | HTTP 204; desaparece del listado y del selector | **Pendiente de ejecutar** | — | — |
| B-04 | Eliminar categoría cuyos productos están dados de baja | Categoría con productos históricos inactivos | DELETE de categoría | **Criterio adoptado:** HTTP 409; conservar categoría para mantener referencias y reportes históricos | **Pendiente de ejecutar** | — | — |
| B-05 | Baja de producto inexistente | ID de producto inexistente | DELETE `/productos/999999` | HTTP 404; no cambia ningún registro | **Pendiente de ejecutar** | — | — |

## Resumen de ejecución

Completar luego de ejecutar los 18 casos. Altas: __ casos, __ pasan, __ fallan. Cambios: __ casos, __ pasan, __ fallan. Bajas: __ casos, __ pasan, __ fallan.
