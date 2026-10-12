const request = require("supertest");
const app = require("../app");

const datosProducto = {
  nombre: "Manzana",
  precio: 500,
  stock: 100,
  categoria: "Frutas",
};

const crearProducto = (datos = datosProducto) =>
  request(app).post("/api/productos").send(datos);

describe("API de productos", () => {
  test("POST crea un producto (201)", async () => {
    const res = await crearProducto();
    expect(res.status).toBe(201);
    expect(res.body.producto._id).toBeDefined();
    expect(res.body.producto.precio).toBe(500);
  });

  test("POST sin precio devuelve 400", async () => {
    const res = await crearProducto({ nombre: "Pera", stock: 5 });
    expect(res.status).toBe(400);
  });

  test("POST con precio 0 o negativo devuelve 400", async () => {
    expect((await crearProducto({ ...datosProducto, precio: 0 })).status).toBe(
      400,
    );
    expect((await crearProducto({ ...datosProducto, precio: -5 })).status).toBe(
      400,
    );
  });

  test("POST con stock negativo devuelve 400", async () => {
    const res = await crearProducto({ ...datosProducto, stock: -1 });
    expect(res.status).toBe(400);
  });

  test("POST con precio de tipo incorrecto devuelve 400", async () => {
    const res = await crearProducto({ ...datosProducto, precio: "caro" });
    expect(res.status).toBe(400);
  });

  test("POST con nombre repetido (sin importar mayúsculas) devuelve 409", async () => {
    await crearProducto();
    const res = await crearProducto({ ...datosProducto, nombre: "MANZANA" });
    expect(res.status).toBe(409);
  });

  test("GET lista y filtra por nombre y categoría", async () => {
    await crearProducto();
    await crearProducto({
      nombre: "Lechuga",
      precio: 300,
      stock: 20,
      categoria: "Verduras",
    });

    expect((await request(app).get("/api/productos")).body).toHaveLength(2);

    const porNombre = await request(app).get("/api/productos?nombre=lech");
    expect(porNombre.body).toHaveLength(1);

    const porCategoria = await request(app).get(
      "/api/productos?categoria=frutas",
    );
    expect(porCategoria.body).toHaveLength(1);
    expect(porCategoria.body[0].nombre).toBe("Manzana");
  });

  test("GET por ID: 200, 404 si no existe y 400 si es inválido", async () => {
    const { body } = await crearProducto();

    expect(
      (await request(app).get(`/api/productos/${body.producto._id}`)).status,
    ).toBe(200);
    expect(
      (await request(app).get("/api/productos/64b7f0c2a1b2c3d4e5f60718")).status,
    ).toBe(404);
    expect((await request(app).get("/api/productos/abc")).status).toBe(400);
  });

  test("PUT actualiza datos y rechaza valores inválidos", async () => {
    const { body } = await crearProducto();
    const id = body.producto._id;

    const ok = await request(app)
      .put(`/api/productos/${id}`)
      .send({ precio: 650 });
    expect(ok.status).toBe(200);
    expect(ok.body.producto.precio).toBe(650);

    const invalido = await request(app)
      .put(`/api/productos/${id}`)
      .send({ precio: -1 });
    expect(invalido.status).toBe(400);
  });

  test("PUT /stock suma y resta stock, y no permite quedar en negativo", async () => {
    const { body } = await crearProducto();
    const url = `/api/productos/${body.producto._id}/stock`;

    const resta = await request(app).put(url).send({ cantidad: -20 });
    expect(resta.status).toBe(200);
    expect(resta.body.producto.stock).toBe(80);

    const suma = await request(app).patch(url).send({ cantidad: 5 });
    expect(suma.body.producto.stock).toBe(85);

    const demasiado = await request(app).put(url).send({ cantidad: -1000 });
    expect(demasiado.status).toBe(400);

    const sinCantidad = await request(app).put(url).send({});
    expect(sinCantidad.status).toBe(400);
  });

  test("DELETE elimina el producto y luego devuelve 404", async () => {
    const { body } = await crearProducto();
    const id = body.producto._id;

    expect((await request(app).delete(`/api/productos/${id}`)).status).toBe(
      200,
    );
    expect((await request(app).delete(`/api/productos/${id}`)).status).toBe(
      404,
    );
  });

  test("DELETE con pedidos activos devuelve 409", async () => {
    const producto = await crearProducto();
    const cliente = await request(app)
      .post("/api/clientes")
      .send({ nombre: "Ana", telefono: "111", direccion: "Calle 1" });
    await request(app)
      .post("/api/pedidos")
      .send({
        idCliente: cliente.body.cliente._id,
        idProductos: [producto.body.producto._id],
      });

    const res = await request(app).delete(
      `/api/productos/${producto.body.producto._id}`,
    );
    expect(res.status).toBe(409);
  });
});
