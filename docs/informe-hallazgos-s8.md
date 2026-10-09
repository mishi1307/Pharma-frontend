# Informe de hallazgos — Actividad Autónoma S8

> Borrador. Completar el resumen, hallazgos y referencias a capturas después de ejecutar la matriz. No exportar como entrega final mientras existan campos pendientes.

## B1. Resumen de ejecución

Casos ejecutados: __ de 18. Altas: __ ejecutados, __ pasan y __ fallan. Cambios: __ ejecutados, __ pasan y __ fallan. Bajas: __ ejecutados, __ pasan y __ fallan. Entorno, fecha y versiones: __.

## B2. Fichas de hallazgos

Crear una ficha por cada caso que falle, con ID, caso relacionado, descripción contrastada con la evidencia, severidad, captura y petición Postman, causa probable (archivo y método) y corrección propuesta por capa.

### Plantilla de ficha

| Campo | Contenido |
|---|---|
| ID del hallazgo | H-__ |
| Caso relacionado | __ |
| Descripción | Completar según el resultado observado. |
| Severidad | Alta / media / baja; justificar. |
| Evidencia | `docs/evidencias-s8/__.png` y petición/respuesta correspondiente. |
| Causa probable | Completar con archivo y método confirmados en el código. |
| Corrección propuesta | Indicar capa, cambio y motivo. |

## B3. Cobertura de reglas

| Regla | SPA | API actual (según código revisado) | Evidencia por ejecutar |
|---|---|---|---|
| Existencia de categoría | Formulario usa categorías cargadas; validar el ID en API | `ProductoServiceImpl.buscarCategoriaPorId`; responde 404 si falta | A-03 |
| Categoría activa al crear/cambiar producto | El selector excluye inactivas; edición conserva la relación original | No se observa comprobación `estado` en `ProductoServiceImpl.create/update` | A-04, C-02 |
| Nombre de producto único sin distinguir mayúsculas | La SPA muestra error de API | `existsByNombreIgnoreCase` en `ProductoServiceImpl.create`; confirmar actualización con Postman | A-05 |
| No eliminar categoría con productos | La SPA informa el error de API | `CategoriaServiceImpl.delete` comprueba `existsByCategoriaId`, incluidos productos dados de baja si son borrados físicamente | B-03, B-04 |
| Baja lógica de producto | La tabla trata inactivos como no habilitados | El `ProductoServiceImpl.delete` revisado llama `productoRepository.delete`, que elimina físicamente; verificar en runtime | B-01, B-02 |

## B4. Recomendación sobre el filtro por categoría

El filtro en el navegador solo puede filtrar los productos recibidos en la página actual; si la API devuelve una página, los registros de otras páginas no están disponibles en memoria. La solución completa es aceptar `categoriaId` en `GET /api/v1/productos`, agregar un método paginado en `ProductoRepository` (por ejemplo, `findByCategoriaId(Long categoriaId, Pageable pageable)`) y construir el `Pageable` con el orden permitido en `ProductoServiceImpl`. En el frontend, `ProductoService.listar` debe agregar `categoriaId` a `HttpParams`; el listado debe actualizar el parámetro cuando cambie el selector. La implementación de esta actividad solicita mostrar los primeros 100 registros para el enlace desde Categorías; si el backend actual ignora paginación y filtro, la nota describe el límite previsto y no debe confundirse con un filtro del servidor.

## B5. Preguntas de análisis

1. **¿Por qué no basta con que la SPA oculte las categorías inactivas?** La API acepta peticiones directas de Postman y llamadas concurrentes. A-04 y C-02 deben confirmar si el backend comprueba que la categoría continúe activa en el momento de crear o actualizar. La comprobación del selector en `producto-form.ts` mejora la experiencia, pero la regla definitiva debe ejecutarse en `ProductoServiceImpl.create/update`.
2. **¿Qué debería pasar al desactivar una categoría con productos activos?** Criterio de este borrador: impedir la desactivación mientras haya productos activos, para no dejar productos vendibles bajo una categoría que el formulario ya no permite elegir. En reportes, las referencias históricas se conservan. Ajustar la respuesta si la ejecución o el criterio del curso llevan a otra decisión.
3. **¿Debe contarse también productos dados de baja al eliminar categoría?** Criterio de este borrador: sí, para conservar la clasificación histórica de ventas y evitar romper referencias. `CategoriaServiceImpl.delete` comprueba `existsByCategoriaId`; B-04 confirmará cómo se comporta el backend actual.
4. **¿Qué revela C-04 sobre el momento de validación?** La validez puede cambiar después de cargar el formulario. Solo la API puede volver a comprobar el estado dentro de la operación de alta, de forma próxima a la escritura, y rechazar el guardado concurrente.
5. **Si el backend corrige A-04, ¿qué cambia en la SPA y qué sigue igual?** La SPA debe seguir ocultando categorías inactivas y mostrando claramente el 409 que responda la API si el estado cambia después de cargar. La selección del usuario, el vínculo por ID y el manejo de errores siguen siendo responsabilidad de la interfaz; la regla de integridad queda protegida por el backend.

## Fuentes del proyecto

- Frontend: `src/app/features/productos/pages/producto-form/producto-form.ts`, `src/app/features/productos/pages/producto-list/producto-list.ts`.
- Backend: `src/main/java/pe/edu/upeu/PharmaBackend/service/impl/ProductoServiceImpl.java`, `src/main/java/pe/edu/upeu/PharmaBackend/service/impl/CategoriaServiceImpl.java`.
