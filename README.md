# 🚚 DSWB_2A_FreshRoute_2C26_Grupo_The_Engine

> API REST y panel web para la gestión de pedidos de FreshRoute, un sistema de distribución. Permite administrar clientes, productos, repartidores y pedidos.

![Node.js](https://img.shields.io/badge/Node.js-339933?style=flat-square&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-47A248?style=flat-square&logo=mongodb&logoColor=white)
![Jest](https://img.shields.io/badge/Jest-C21325?style=flat-square&logo=jest&logoColor=white)
![Pug](https://img.shields.io/badge/Pug-A86454?style=flat-square&logo=pug&logoColor=white)

---

## 🛠 Stack

- Node.js + Express 5
- MongoDB + Mongoose (persistencia)
- Pug (panel visual en `/` para registrar y consultar los datos)
- Jest + Supertest + mongodb-memory-server para los tests

## 📦 Instalación

```bash
npm install
```

Crear un archivo `.env` a partir del ejemplo y ajustar la URI de MongoDB si hace falta:

```bash
cp .env.example .env
```

| Variable    | Descripción                          | Valor por defecto                         |
|-------------|----------------------------------------|---------------------------------------------|
| `PORT`      | Puerto del servidor                    | `3000`                                      |
| `HOST`      | Interfaz de escucha                    | `127.0.0.1`                                 |
| `MONGO_URI` | URI de conexión a MongoDB              | `mongodb://localhost:27017/freshroute`      |

> El archivo `.env` no se versiona (está en `.gitignore`). Se necesita una instancia de MongoDB corriendo (local o Atlas).

## 🚀 Uso

```bash
npm run dev     # levanta el servidor con nodemon (recarga automática)
node index.js   # levanta el servidor sin recarga automática
```

Por defecto el servidor corre en `http://localhost:3000` (panel web en `/`, API en `/api/...`).

## 🧪 Tests

```bash
npm test
```

Corre los tests de los módulos (clientes, productos, repartidores, pedidos y panel) contra la API real, usando una base MongoDB **en memoria** (`mongodb-memory-server`): no hace falta tener MongoDB instalado ni se toca la base real. La primera ejecución descarga el binario de MongoDB.

El script usa `--experimental-vm-modules` porque el driver de MongoDB lo necesita para funcionar dentro de Jest.

## 🗂 Estructura del proyecto

```
index.js          # punto de entrada: conecta a MongoDB y levanta el servidor
app.js            # app Express (middlewares, rutas, errores); la importan index.js y los tests
config/           # conexión a MongoDB
models/           # schemas de Mongoose con sus reglas de negocio, y las clases de error
controllers/      # lógica de cada endpoint (async/await) y del panel web
routes/           # definición de rutas de Express (API y panel)
middlewares/      # manejo de errores centralizado y 404
views/            # plantillas Pug del panel
tests/            # tests con Jest + Supertest
docs/             # documentación (requerimientos, modelo de datos, plan de pruebas)
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

**Body para crear/actualizar** (`nombre`, `telefono` y `direccion` obligatorios al crear):

```json
{
  "nombre": "Juan Perez",
  "telefono": "1122334455",
  "direccion": "Calle Falsa 123"
}
```

### Productos — `/api/productos`

| Método | Ruta                      | Descripción                                  |
|--------|----------------------------|------------------------------------------------|
| GET    | `/api/productos`           | Lista todos los productos. Admite `?nombre=` y `?categoria=` para filtrar |
| GET    | `/api/productos/:id`       | Devuelve un producto por ID |
| POST   | `/api/productos`           | Crea un producto |
| PUT    | `/api/productos/:id`       | Actualiza los datos de un producto |
| PUT/PATCH | `/api/productos/:id/stock` | Ajusta el stock (suma o resta según `cantidad`) |
| DELETE | `/api/productos/:id`       | Elimina un producto (no permitido si tiene pedidos activos) |

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

### Repartidores — `/api/repartidores`

| Método | Ruta                      | Descripción                    |
|--------|----------------------------|----------------------------------|
| GET    | `/api/repartidores`        | Lista los repartidores |
| GET    | `/api/repartidores/:id`    | Devuelve un repartidor por ID |
| POST   | `/api/repartidores`        | Crea un repartidor |
| PUT    | `/api/repartidores/:id`    | Actualiza un repartidor (incluida su disponibilidad) |
| DELETE | `/api/repartidores/:id`    | Elimina un repartidor |

**Body para crear** (`nombre`, `telefono` y `vehiculo` obligatorios):

```json
{
  "nombre": "Carlos",
  "telefono": "1133445566",
  "vehiculo": "Moto"
}
```

### Pedidos — `/api/pedidos`

| Método | Ruta                       | Descripción                                  |
|--------|-----------------------------|------------------------------------------------|
| GET    | `/api/pedidos`              | Lista todos los pedidos (con cliente, productos y repartidor). Admite `?estado=` y `?idCliente=` |
| GET    | `/api/pedidos/:id`          | Devuelve un pedido por ID |
| POST   | `/api/pedidos`              | Crea un pedido (cliente, productos y repartidor deben existir) |
| PUT/PATCH | `/api/pedidos/:id/estado` | Cambia el estado del pedido |

**Body para crear** (`idCliente` e `idProductos` obligatorios; `idRepartidor` y `direccionEntrega` opcionales):

```json
{
  "idCliente": "64b7f0c2a1b2c3d4e5f60718",
  "idProductos": ["64b7f0c2a1b2c3d4e5f60719"],
  "idRepartidor": null,
  "direccionEntrega": "Av. Siempre Viva 742"
}
```

El `montoTotal` se calcula sumando los precios de los productos, y si no se indica `direccionEntrega` se usa la dirección del cliente.

**Body para cambiar estado**:

```json
{
  "nuevoEstado": "Preparado"
}
```

Estados válidos: `Pendiente` → `Preparado` → `En camino` → `Entregado`, o `Cancelado`. Un pedido `Entregado` no puede volver a `Pendiente`, y uno `Cancelado` no puede pasar a `En camino`. Se consideran **pedidos activos** los que están en `Pendiente`, `Preparado` o `En camino`.

---

## Esquemas de datos

Todos los documentos tienen `_id` (ObjectId generado por MongoDB), `createdAt` y `updatedAt`.

### Cliente

| Campo      | Tipo   | Descripción              |
|------------|--------|---------------------------|
| `nombre`   | string | Obligatorio |
| `telefono` | string | Obligatorio, único |
| `direccion`| string | Obligatorio |

### Producto

| Campo       | Tipo   | Descripción                        |
|-------------|--------|--------------------------------------|
| `nombre`    | string | Obligatorio, único (sin distinguir mayúsculas) |
| `precio`    | number | Obligatorio, mayor a 0 |
| `stock`     | number | Obligatorio, no negativo |
| `categoria` | string | Opcional |

### Repartidor

| Campo        | Tipo    | Descripción                        |
|--------------|---------|--------------------------------------|
| `nombre`     | string  | Obligatorio |
| `telefono`   | string  | Obligatorio |
| `vehiculo`   | string  | Obligatorio |
| `disponible` | boolean | `true` por defecto |

### Pedido

| Campo              | Tipo               | Descripción                                  |
|--------------------|--------------------|------------------------------------------------|
| `idCliente`        | ObjectId (Cliente) | Obligatorio, debe existir |
| `idProductos`      | ObjectId[] (Producto) | Obligatorio, al menos un producto existente |
| `idRepartidor`     | ObjectId (Repartidor) \| null | Opcional, debe existir si se indica |
| `montoTotal`       | number             | Calculado al crear el pedido |
| `direccionEntrega` | string             | Por defecto, la dirección del cliente |
| `estado`           | string             | `Pendiente` por defecto |

## Respuestas de error

Todas las validaciones y reglas de negocio las resuelve un middleware de errores centralizado (`middlewares/errorHandler.js`), que devuelve un JSON con la forma `{ "error": "mensaje" }`:

| Código | Cuándo ocurre |
|--------|----------------|
| `400`  | Datos inválidos (validación del schema o de tipos), ID con formato incorrecto, JSON malformado, transición de estado inválida, stock insuficiente |
| `404`  | Recurso (o cliente/producto/repartidor referenciado) inexistente, o ruta que no existe |
| `409`  | Valor duplicado (teléfono de cliente, nombre de producto) o conflicto con una regla de negocio (borrar un cliente o producto con pedidos activos) |
| `500`  | Error inesperado del servidor |

## 📚 Documentación adicional

- [Requerimientos funcionales y no funcionales](docs/requerimientos.md)
- [Modelo de datos y flujo de estados](docs/modelo-de-datos.md)
- [Plan de pruebas](docs/plan-de-pruebas.md)
- [Roles, responsabilidades y bibliografía](docs/roles-y-bibliografia.md) (para completar por el grupo)
