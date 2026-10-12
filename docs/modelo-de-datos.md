# Modelo de datos y flujo de estados

## Colecciones de MongoDB

```mermaid
erDiagram
    CLIENTE ||--o{ PEDIDO : realiza
    REPARTIDOR |o--o{ PEDIDO : entrega
    PEDIDO }o--|{ PRODUCTO : contiene

    CLIENTE {
        ObjectId _id
        string nombre
        string telefono "unico"
        string direccion
    }
    PRODUCTO {
        ObjectId _id
        string nombre "unico"
        number precio "mayor a 0"
        number stock "no negativo"
        string categoria
    }
    REPARTIDOR {
        ObjectId _id
        string nombre
        string telefono
        string vehiculo
        boolean disponible
    }
    PEDIDO {
        ObjectId _id
        ObjectId idCliente
        ObjectId[] idProductos
        ObjectId idRepartidor "opcional"
        number montoTotal
        string direccionEntrega
        string estado
    }
```

Todas las colecciones incluyen `createdAt` y `updatedAt` (opción `timestamps` de Mongoose).

## Estados de un pedido

```mermaid
stateDiagram-v2
    [*] --> Pendiente
    Pendiente --> Preparado
    Preparado --> EnCamino : En camino
    EnCamino --> Entregado
    Pendiente --> Cancelado
    Preparado --> Cancelado
    EnCamino --> Cancelado
    Entregado --> [*]
    Cancelado --> [*]
```

Reglas implementadas en `Pedido.actualizarEstado`:

- Solo se aceptan los cinco estados definidos.
- Un pedido `Entregado` no puede volver a `Pendiente`.
- Un pedido `Cancelado` no puede pasar a `En camino`.

Se consideran **pedidos activos** los que están en `Pendiente`, `Preparado` o `En camino`; mientras existan, no se puede eliminar el cliente ni los productos involucrados.
