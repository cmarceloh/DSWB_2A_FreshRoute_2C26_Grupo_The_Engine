# Requerimientos de FreshRoute

Sistema de distribución: API REST y panel web para gestionar clientes, productos, repartidores y pedidos.

## Requerimientos funcionales

| ID | Requerimiento |
|----|----------------|
| RF-01 | El sistema permite crear, listar, consultar, actualizar y eliminar **clientes**; la lista se puede filtrar por nombre. |
| RF-02 | El sistema permite crear, listar, consultar, actualizar y eliminar **productos**; la lista se puede filtrar por nombre y categoría. |
| RF-03 | El sistema permite **ajustar el stock** de un producto sumando o restando una cantidad, sin que el stock quede negativo. |
| RF-04 | El sistema permite crear, listar, consultar, actualizar y eliminar **repartidores**, e indicar su disponibilidad. |
| RF-05 | El sistema permite **crear pedidos** asociados a un cliente existente, uno o más productos existentes y, opcionalmente, un repartidor existente. |
| RF-06 | Al crear un pedido, el sistema **calcula el monto total** con los precios de los productos y usa la dirección del cliente si no se indica otra. |
| RF-07 | El sistema permite listar pedidos (con los datos de cliente, productos y repartidor) y filtrarlos por estado y por cliente. |
| RF-08 | El sistema permite **cambiar el estado** de un pedido (`Pendiente`, `Preparado`, `En camino`, `Entregado`, `Cancelado`) respetando las transiciones permitidas. |
| RF-09 | No se puede eliminar un **cliente** ni un **producto** que esté en pedidos activos (`Pendiente`, `Preparado`, `En camino`). |
| RF-10 | No pueden existir dos clientes con el mismo teléfono ni dos productos con el mismo nombre. |
| RF-11 | El panel web (`/`) permite registrar y eliminar clientes, productos, repartidores y pedidos, y muestra los datos actuales; aplica las mismas reglas que la API. |

## Requerimientos no funcionales

| ID | Requerimiento |
|----|----------------|
| RNF-01 | **Arquitectura modular** en capas: rutas, controladores y modelos, con configuración y middlewares separados. |
| RNF-02 | **Persistencia** en MongoDB mediante Mongoose, con la URI configurable por variable de entorno. |
| RNF-03 | **Programación asincrónica** con `async/await` en toda la capa de acceso a datos. |
| RNF-04 | **Validación de datos** en el schema (campos obligatorios, rangos, enumerados, unicidad) y de tipos en los controladores. |
| RNF-05 | **Manejo de errores centralizado**: todas las respuestas de error son JSON `{ "error": "mensaje" }` con el código HTTP correcto (400, 404, 409, 500). |
| RNF-06 | **Seguridad de configuración**: las credenciales y la URI no se versionan (`.env` ignorado, `.env.example` como guía). |
| RNF-07 | **Mantenibilidad**: las reglas de negocio viven en los modelos y se reutilizan desde la API y el panel, sin duplicarlas. |
| RNF-08 | **Testeabilidad**: la app se puede importar sin abrir el puerto ni conectar a la base, y los tests corren contra una base en memoria. |
| RNF-09 | **Documentación**: README con instalación, variables de entorno, endpoints y esquemas; pruebas documentadas. |
