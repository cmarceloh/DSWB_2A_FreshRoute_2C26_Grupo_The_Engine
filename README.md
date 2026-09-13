# DSWB_2A_FreshRoute_2C26_Grupo_The_Engine

API REST para la gestión de pedidos de FreshRoute, un sistema de distribución. Permite administrar clientes, productos y pedidos.

## Stack

- Node.js + Express
- Pug (vista de bienvenida en `/`)
- Persistencia en archivo JSON (`data/database.json`), sin base de datos externa
- Jest + Supertest para los tests

## Instalación

```bash
npm install
```

## Uso

```bash
npm run dev     # levanta el servidor con nodemon (recarga automática)
node index.js   # levanta el servidor sin recarga automática
```

Por defecto el servidor corre en `http://localhost:3000`.

## Tests

```bash
npm test
```

Corre los tests de los tres módulos (clientes, productos, pedidos) contra la API real, sin necesidad de levantar el servidor a mano.

## Estructura del proyecto

```
controllers/   # lógica de cada endpoint
models/        # clases con los datos y las reglas de negocio de cada entidad
routes/        # definición de rutas de Express
data/          # base de datos en JSON
tests/         # tests con Jest + Supertest
```

---

## Endpoints

### Clientes — `/api/clientes`

| Método | Ruta               | Descripción                                  |
|--------|---------------------|-----------------------------------------------|
| GET    | `/api/clientes`      | Lista todos los clientes. Admite `?nombre=` para filtrar por nombre (parcial) |
| GET    | `/api/clientes/:id`  | Devuelve un cliente por ID |
| POST   | `/api/clientes`      | Crea un cliente |
| PUT    | `/api/clientes/:id`  | Actualiza los datos de un cliente |
| DELETE | `/api/clientes/:id`  | Elimina un cliente (no permitido si tiene pedidos activos) |

**Body para crear/actualizar** (`nombre` y `telefono` obligatorios al crear):

```json
{
  "nombre": "Juan Perez",
  "telefono": "1122334455",
  "direccion": "Calle Falsa 123"
}
```

### Productos — `/api/productos`

| Método | Ruta                    | Descripción                                  |
|--------|--------------------------|------------------------------------------------|
| GET    | `/api/productos`         | Lista todos los productos. Admite `?nombre=` y `?categoria=` para filtrar |
| GET    | `/api/productos/:id`     | Devuelve un producto por ID |
| POST   | `/api/productos`         | Crea un producto |
| PUT    | `/api/productos/:id`     | Actualiza los datos de un producto |
| PUT    | `/api/productos/:id/stock` | Ajusta el stock (suma o resta según `cantidad`) |
| DELETE | `/api/productos/:id`     | Elimina un producto (no permitido si tiene pedidos activos) |

**Body para crear/actualizar** (`nombre`, `precio` y `stock` obligatorios al crear):

```json
{
  "nombre": "Manzana",
  "precio": 500,
  "stock": 100,
  "categoria": "Frutas"
}
```

**Body para ajustar stock** (`cantidad` puede ser negativa para descontar):

```json
{
  "cantidad": -20
}
```

### Pedidos — `/api/pedidos`

| Método | Ruta                     | Descripción                                  |
|--------|---------------------------|------------------------------------------------|
| GET    | `/api/pedidos`             | Lista todos los pedidos. Admite `?estado=` y `?idCliente=` para filtrar |
| GET    | `/api/pedidos/:id`         | Devuelve un pedido por ID |
| POST   | `/api/pedidos`             | Crea un pedido (el cliente indicado debe existir) |
| PUT    | `/api/pedidos/:id/estado`  | Cambia el estado del pedido |

**Body para crear** (`idCliente` e `idProductos` obligatorios):

```json
{
  "idCliente": 1789309413650,
  "idProductos": [1789309413658],
  "idRepartidor": null
}
```

**Body para cambiar estado**:

```json
{
  "nuevoEstado": "Preparado"
}
```

Estados válidos: `Pendiente` → `Preparado` → `En camino` → `Entregado`, o `Cancelado` en cualquier punto salvo desde `Entregado`. Un pedido `Entregado` no puede volver a `Pendiente`, y uno `Cancelado` no puede pasar a `En camino`.

---

## Esquemas de datos

### Cliente

| Campo      | Tipo   | Descripción              |
|------------|--------|---------------------------|
| `id`       | number | Generado automáticamente |
| `nombre`   | string | Obligatorio |
| `telefono` | string | Obligatorio, único |
| `direccion`| string | Opcional |

### Producto

| Campo       | Tipo   | Descripción                        |
|-------------|--------|--------------------------------------|
| `id`        | number | Generado automáticamente |
| `nombre`    | string | Obligatorio, único |
| `precio`    | number | Obligatorio, mayor a 0 |
| `stock`     | number | Obligatorio, no negativo |
| `categoria` | string | Opcional |

### Pedido

| Campo          | Tipo             | Descripción                                  |
|----------------|------------------|------------------------------------------------|
| `id`           | number           | Generado automáticamente |
| `idCliente`    | number           | Obligatorio, debe existir en `clientes` |
| `idProductos`  | number[]         | Obligatorio, al menos un producto |
| `idRepartidor` | number \| null   | Opcional |
| `estado`       | string           | `Pendiente` por defecto |

## Respuestas de error

Todas las validaciones y reglas de negocio devuelven un JSON con la forma `{ "error": "mensaje" }` junto con el código HTTP correspondiente (`400` datos inválidos, `404` recurso no encontrado, `409` conflicto por una regla de negocio, ej. borrar un cliente con pedidos activos).
