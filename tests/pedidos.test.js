const request = require("supertest");
const app = require("../index");

describe("API de pedidos", () => {
  let clienteId;
  let productoId;
  let pedidoId;

  // Se necesita un cliente y un producto existentes para poder crear un pedido
  beforeAll(async () => {
    const cliente = await request(app).post("/api/clientes").send({
      nombre: "Cliente de prueba",
      telefono: "5566778899",
      direccion: "Av. Siempre Viva 742",
    });
    clienteId = cliente.body.cliente.id;

    const producto = await request(app).post("/api/productos").send({
      nombre: "Producto de prueba",
      precio: 100,
      stock: 50,
      categoria: "Varios",
    });
    productoId = producto.body.producto.id;
  });

  // Se limpian los registros creados para las pruebas (el pedido debe quedar
  // en un estado no activo para poder borrar el cliente y el producto)
  afterAll(async () => {
    await request(app)
      .put(`/api/pedidos/${pedidoId}/estado`)
      .send({ nuevoEstado: "En camino" });
    await request(app)
      .put(`/api/pedidos/${pedidoId}/estado`)
      .send({ nuevoEstado: "Entregado" });

    await request(app).delete(`/api/clientes/${clienteId}`);
    await request(app).delete(`/api/productos/${productoId}`);
  });

  it("POST /api/pedidos crea un pedido", async () => {
    const res = await request(app).post("/api/pedidos").send({
      idCliente: clienteId,
      idProductos: [productoId],
    });

    expect(res.status).toBe(201);
    expect(res.body.pedido).toHaveProperty("id");
    expect(res.body.pedido.estado).toBe("Pendiente");

    pedidoId = res.body.pedido.id;
  });

  it("POST /api/pedidos con cliente inexistente devuelve 404", async () => {
    const res = await request(app).post("/api/pedidos").send({
      idCliente: 999999999,
      idProductos: [productoId],
    });

    expect(res.status).toBe(404);
  });

  it("GET /api/pedidos/:id devuelve el pedido creado", async () => {
    const res = await request(app).get(`/api/pedidos/${pedidoId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(pedidoId);
  });

  it("PUT /api/pedidos/:id/estado actualiza el estado", async () => {
    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}/estado`)
      .send({ nuevoEstado: "Preparado" });

    expect(res.status).toBe(200);
    expect(res.body.pedido.estado).toBe("Preparado");
  });

  it("PUT /api/pedidos/:id/estado rechaza un estado invalido", async () => {
    const res = await request(app)
      .put(`/api/pedidos/${pedidoId}/estado`)
      .send({ nuevoEstado: "Volando" });

    expect(res.status).toBe(400);
  });
});
