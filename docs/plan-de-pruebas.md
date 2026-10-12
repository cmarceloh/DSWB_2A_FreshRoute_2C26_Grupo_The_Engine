# Plan de pruebas

## Estrategia

- **Pruebas automáticas de la API y el panel** con Jest + Supertest (carpeta `tests/`). Corren contra una base MongoDB en memoria (`mongodb-memory-server`), así que no dependen de datos previos ni tocan la base real. Cada test parte de colecciones vacías.
- **Pruebas manuales con Thunder Client / Postman** sobre el servidor real para dejar evidencia visual (ver sección final).

Ejecución:

```bash
npm test
```

El resultado de la última corrida está en [`evidencia-tests.txt`](evidencia-tests.txt): **45 tests en 5 suites, todos aprobados**.

## Casos cubiertos

| Módulo | Caso | Resultado esperado | Requerimiento |
|--------|------|--------------------|---------------|
| Clientes | Crear cliente válido | 201 y `_id` generado | RF-01 |
| Clientes | Crear sin teléfono / con tipo incorrecto | 400 | RNF-04 |
| Clientes | Crear con teléfono repetido | 409 | RF-10 |
| Clientes | Listar y filtrar por nombre | 200, lista filtrada | RF-01 |
| Clientes | Obtener por ID existente / inexistente / mal formado | 200 / 404 / 400 | RF-01 |
| Clientes | Actualizar datos; actualizar con teléfono ya usado | 200 / 409 | RF-01, RF-10 |
| Clientes | Eliminar; eliminar con pedidos activos | 200 y luego 404 / 409 | RF-01, RF-09 |
| General | Ruta inexistente; JSON malformado | 404 / 400 en JSON | RNF-05 |
| Productos | Crear válido | 201 | RF-02 |
| Productos | Crear sin precio, con precio 0 o negativo, stock negativo o tipos incorrectos | 400 | RNF-04 |
| Productos | Crear con nombre repetido (otra capitalización) | 409 | RF-10 |
| Productos | Listar y filtrar por nombre y categoría | 200, listas filtradas | RF-02 |
| Productos | Obtener por ID existente / inexistente / mal formado | 200 / 404 / 400 | RF-02 |
| Productos | Actualizar con datos válidos / inválidos | 200 / 400 | RF-02 |
| Productos | Ajustar stock (resta, suma, exceso, sin cantidad) | 200 / 200 / 400 / 400 | RF-03 |
| Productos | Eliminar; eliminar con pedidos activos | 200 y luego 404 / 409 | RF-09 |
| Repartidores | CRUD completo, datos faltantes, ID inexistente / mal formado | 201 / 400 / 200 / 404 | RF-04 |
| Pedidos | Crear pedido, calcular monto y dirección por defecto | 201, estado `Pendiente` | RF-05, RF-06 |
| Pedidos | Crear sin datos o con lista vacía | 400 | RNF-04 |
| Pedidos | Crear con cliente / producto / repartidor inexistente | 404 | RF-05 |
| Pedidos | Crear con ID mal formado | 400 | RNF-05 |
| Pedidos | Listar con relaciones y filtrar por estado y cliente | 200 | RF-07 |
| Pedidos | Obtener por ID existente / inexistente / mal formado | 200 / 404 / 400 | RF-07 |
| Pedidos | Cambiar estado válido | 200 | RF-08 |
| Pedidos | Estado inexistente o faltante; Entregado a Pendiente; Cancelado a En camino | 400 | RF-08 |
| Pedidos | Cambiar estado de un pedido inexistente | 404 | RF-08 |
| Pedidos | Pedido entregado permite borrar cliente y producto | 200 | RF-09 |
| Panel | Renderizar `/`; alta de cliente desde el formulario | 200 / 302 y el dato aparece | RF-11 |
| Panel | Teléfono repetido; eliminar cliente con pedidos activos | Redirige con el mensaje de error | RF-10, RF-11 |

## Pruebas manuales (evidencia para completar)

Con el servidor levantado (`npm run dev`) y MongoDB corriendo, ejecutar en Thunder Client o Postman y guardar capturas en `docs/capturas/`:

1. `POST /api/clientes` con un cliente válido (201).
2. `POST /api/clientes` repitiendo el teléfono (409).
3. `POST /api/productos` con `precio: -5` (400).
4. `POST /api/pedidos` con un cliente y un producto creados (201, `montoTotal` calculado).
5. `PUT /api/pedidos/:id/estado` con `Entregado` y luego `Pendiente` (400).
6. `DELETE /api/clientes/:id` de un cliente con pedido activo (409).
7. `GET /api/pedidos` mostrando los datos poblados de cliente, productos y repartidor.
