const request = require("supertest");
const app = require("../app");

const ID_INEXISTENTE = "64b7f0c2a1b2c3d4e5f60718";

// Crea un cliente y dos productos para poder armar pedidos
const prepararDatos = async () => {
  const cliente = await request(app)
    .post("/api/clientes")
    .send({ nombre: "Ana", telefono: "111", direccion: "Calle 1" });
  const manzana = await request(app)
    .post("/api/productos")
    .send({ nombre: "Manzana", precio: 500, stock: 10 });
  const pera = await request(app)
    .post("/api/productos")
    .send({ nombre: "Pera", precio: 300, stock: 10 });
  return {
    idCliente: cliente.body.cliente._id,
    idManzana: manzana.body.producto._id,
    idPera: pera.body.producto._id,
  };
};

describe("API de pedidos", () => {
  test("POST crea un pedido en estado Pendiente y calcula el monto", async () => {
    const { idCliente, idManzana, idPera } = await prepararDatos();
    const res = await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [idManzana, idPera, idManzana] });

    expect(res.status).toBe(201);
    expect(res.body.pedido.estado).toBe("Pendiente");
    expect(res.body.pedido.montoTotal).toBe(1300);
    expect(res.body.pedido.direccionEntrega).toBe("Calle 1");
  });

  test("POST sin datos obligatorios o con lista vacía devuelve 400", async () => {
    const { idCliente } = await prepararDatos();

    expect((await request(app).post("/api/pedidos").send({})).status).toBe(400);
    const vacio = await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [] });
    expect(vacio.status).toBe(400);
  });

  test("POST con cliente, producto o repartidor inexistente devuelve 404", async () => {
    const { idCliente, idManzana } = await prepararDatos();

    const sinCliente = await request(app)
      .post("/api/pedidos")
      .send({ idCliente: ID_INEXISTENTE, idProductos: [idManzana] });
    expect(sinCliente.status).toBe(404);

    const sinProducto = await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [ID_INEXISTENTE] });
    expect(sinProducto.status).toBe(404);

    const sinRepartidor = await request(app)
      .post("/api/pedidos")
      .send({
        idCliente,
        idProductos: [idManzana],
        idRepartidor: ID_INEXISTENTE,
      });
    expect(sinRepartidor.status).toBe(404);
  });

  test("POST con un ID mal formado devuelve 400", async () => {
    const res = await request(app)
      .post("/api/pedidos")
      .send({ idCliente: "abc", idProductos: ["abc"] });
    expect(res.status).toBe(400);
  });

  test("GET lista pedidos con relaciones y filtra por estado y cliente", async () => {
    const { idCliente, idManzana } = await prepararDatos();
    const creado = await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [idManzana] });
    await request(app)
      .put(`/api/pedidos/${creado.body.pedido._id}/estado`)
      .send({ nuevoEstado: "Preparado" });
    await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [idManzana] });

    const todos = await request(app).get("/api/pedidos");
    expect(todos.body).toHaveLength(2);
    expect(todos.body[0].idCliente.nombre).toBe("Ana");

    const porEstado = await request(app).get("/api/pedidos?estado=preparado");
    expect(porEstado.body).toHaveLength(1);

    const porCliente = await request(app).get(
      `/api/pedidos?idCliente=${idCliente}`,
    );
    expect(porCliente.body).toHaveLength(2);
  });

  test("GET por ID: 200, 404 si no existe y 400 si es inválido", async () => {
    const { idCliente, idManzana } = await prepararDatos();
    const creado = await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [idManzana] });

    expect(
      (await request(app).get(`/api/pedidos/${creado.body.pedido._id}`)).status,
    ).toBe(200);
    expect((await request(app).get(`/api/pedidos/${ID_INEXISTENTE}`)).status).toBe(
      404,
    );
    expect((await request(app).get("/api/pedidos/abc")).status).toBe(400);
  });

  describe("cambio de estado", () => {
    let url;

    beforeEach(async () => {
      const { idCliente, idManzana } = await prepararDatos();
      const creado = await request(app)
        .post("/api/pedidos")
        .send({ idCliente, idProductos: [idManzana] });
      url = `/api/pedidos/${creado.body.pedido._id}/estado`;
    });

    test("avanza el estado correctamente", async () => {
      const res = await request(app)
        .put(url)
        .send({ nuevoEstado: "Preparado" });
      expect(res.status).toBe(200);
      expect(res.body.pedido.estado).toBe("Preparado");
    });

    test("rechaza un estado inexistente o faltante (400)", async () => {
      expect(
        (await request(app).put(url).send({ nuevoEstado: "Volando" })).status,
      ).toBe(400);
      expect((await request(app).put(url).send({})).status).toBe(400);
    });

    test("un pedido entregado no vuelve a Pendiente (400)", async () => {
      await request(app).put(url).send({ nuevoEstado: "Entregado" });
      const res = await request(app)
        .put(url)
        .send({ nuevoEstado: "Pendiente" });
      expect(res.status).toBe(400);
    });

    test("un pedido cancelado no puede pasar a En camino (400)", async () => {
      await request(app).patch(url).send({ nuevoEstado: "Cancelado" });
      const res = await request(app)
        .patch(url)
        .send({ nuevoEstado: "En camino" });
      expect(res.status).toBe(400);
    });

    test("pedido inexistente devuelve 404", async () => {
      const res = await request(app)
        .put(`/api/pedidos/${ID_INEXISTENTE}/estado`)
        .send({ nuevoEstado: "Preparado" });
      expect(res.status).toBe(404);
    });
  });

  test("un pedido entregado permite borrar cliente y producto", async () => {
    const { idCliente, idManzana } = await prepararDatos();
    const creado = await request(app)
      .post("/api/pedidos")
      .send({ idCliente, idProductos: [idManzana] });
    await request(app)
      .put(`/api/pedidos/${creado.body.pedido._id}/estado`)
      .send({ nuevoEstado: "Entregado" });

    expect(
      (await request(app).delete(`/api/clientes/${idCliente}`)).status,
    ).toBe(200);
    expect(
      (await request(app).delete(`/api/productos/${idManzana}`)).status,
    ).toBe(200);
  });
});
