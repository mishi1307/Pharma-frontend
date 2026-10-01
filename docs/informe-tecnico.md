# Informe técnico: PharmaSoft Angular

## Propósito
SPA Angular que separa la interfaz del backend Spring Boot y consume sus servicios REST con HTTP y JSON.

## Capas
- **core**: menú, tipos de errores y utilidades HTTP.
- **shared**: página para rutas inexistentes.
- **layout**: encabezado, sidebar y contenedor padre con router-outlet.
- **features/inicio**: página principal.
- **features/categorias**: modelo, servicio, rutas, buscador, formulario y CRUD.
- **features/clientes**: módulo complementario con la misma estructura.

## Rutas
| Ruta | Función |
|---|---|
| /inicio | Inicio |
| /categorias | Listar y buscar |
| /categorias/nuevo | Registrar categoría |
| /categorias/:id/editar | Editar categoría |
| /clientes | Listar y buscar |
| /clientes/nuevo | Registrar cliente |
| /clientes/:id/editar | Editar cliente |
| Cualquier otra | Página 404 propia |

Las features usan carga diferida y routerLink para navegar sin recargar la SPA.

## Responsabilidades y errores
Las páginas mantienen el estado visual, los servicios concentran las peticiones, y los modelos tipan los DTOs. La validación del cliente replica las reglas de los DTOs. Se presentan los errores HTTP 400, 404 y 409 y los mensajes de validación.

## API
Categorías usa GET, GET por id, POST, PUT por id y DELETE en /api/v1/categorias. Clientes usa los mismos métodos en /api/v1/clientes.

## Ejecución
Inicia Oracle y PharmaBackend en el puerto 8080, configura CORS para http://localhost:4200 y ejecuta ng serve -o en la raíz del frontend.

