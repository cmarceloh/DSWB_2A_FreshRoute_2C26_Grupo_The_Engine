const request = require("supertest");
const app = require("../app");

const datosCliente = {
  nombre: "Juan Perez",
  telefono: "1122334455",
  direccion: "Calle Falsa 123",
};

const crearCliente = (datos = datosCliente) =>
  request(app).post("/api/clientes").send(datos);

describe("API de clientes", () => {
  test("POST crea un cliente (201)", async () => {
    const res = await crearCliente();
    expect(res.status).toBe(201);
    expect(res.body.cliente._id).toBeDefined();
    expect(res.body.cliente.nombre).toBe("Juan Perez");
  });

  test("POST sin teléfono devuelve 400", async () => {
    const res = await crearCliente({ nombre: "Ana", direccion: "Calle 1" });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/teléfono/i);
  });

  test("POST con tipo de dato incorrecto devuelve 400", async () => {
    const res = await crearCliente({ ...datosCliente, telefono: 1122334455 });
    expect(res.status).toBe(400);
  });

  test("POST con teléfono repetido devuelve 409", async () => {
    await crearCliente();
    const res = await crearCliente({ ...datosCliente, nombre: "Otro" });
    expect(res.status).toBe(409);
    expect(res.body.error).toBeDefined();
  });

  test("GET lista los clientes y filtra por nombre", async () => {
    await crearCliente();
    await crearCliente({ nombre: "Maria", telefono: "999", direccion: "X 1" });

    const todos = await request(app).get("/api/clientes");
    expect(todos.status).toBe(200);
    expect(todos.body).toHaveLength(2);

    const filtrados = await request(app).get("/api/clientes?nombre=mar");
    expect(filtrados.body).toHaveLength(1);
    expect(filtrados.body[0].nombre).toBe("Maria");
  });

  test("GET por ID devuelve el cliente; 404 si no existe; 400 si el ID es inválido", async () => {
    const { body } = await crearCliente();
    const id = body.cliente._id;

    const ok = await request(app).get(`/api/clientes/${id}`);
    expect(ok.status).toBe(200);
    expect(ok.body.telefono).toBe(datosCliente.telefono);

    const inexistente = await request(app).get(
      "/api/clientes/64b7f0c2a1b2c3d4e5f60718",
    );
    expect(inexistente.status).toBe(404);

    const invalido = await request(app).get("/api/clientes/abc");
    expect(invalido.status).toBe(400);
  });

  test("PUT actualiza los datos del cliente", async () => {
    const { body } = await crearCliente();
    const res = await request(app)
      .put(`/api/clientes/${body.cliente._id}`)
      .send({ direccion: "Nueva 456" });
    expect(res.status).toBe(200);
    expect(res.body.cliente.direccion).toBe("Nueva 456");
    expect(res.body.cliente.nombre).toBe("Juan Perez");
  });

  test("PUT con un teléfono ya usado devuelve 409", async () => {
    await crearCliente();
    const otro = await crearCliente({
      nombre: "Maria",
      telefono: "999",
      direccion: "X 1",
    });
    const res = await request(app)
      .put(`/api/clientes/${otro.body.cliente._id}`)
      .send({ telefono: datosCliente.telefono });
    expect(res.status).toBe(409);
  });

  test("DELETE elimina el cliente y luego devuelve 404", async () => {
    const { body } = await crearCliente();
    const id = body.cliente._id;

    const borrado = await request(app).delete(`/api/clientes/${id}`);
    expect(borrado.status).toBe(200);

    const otraVez = await request(app).delete(`/api/clientes/${id}`);
    expect(otraVez.status).toBe(404);
  });

  test("DELETE con pedidos activos devuelve 409", async () => {
    const cliente = await crearCliente();
    const producto = await request(app)
      .post("/api/productos")
      .send({ nombre: "Manzana", precio: 500, stock: 10 });
    await request(app)
      .post("/api/pedidos")
      .send({
        idCliente: cliente.body.cliente._id,
        idProductos: [producto.body.producto._id],
      });

    const res = await request(app).delete(
      `/api/clientes/${cliente.body.cliente._id}`,
    );
    expect(res.status).toBe(409);
  });
});

describe("Rutas inexistentes y JSON inválido", () => {
  test("una ruta que no existe devuelve 404 en JSON", async () => {
    const res = await request(app).get("/api/nada");
    expect(res.status).toBe(404);
    expect(res.body.error).toBeDefined();
  });

  test("un JSON malformado devuelve 400", async () => {
    const res = await request(app)
      .post("/api/clientes")
      .set("Content-Type", "application/json")
      .send("{ esto no es json");
    expect(res.status).toBe(400);
  });
});
