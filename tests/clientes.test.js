const request = require("supertest");
const app = require("../index");

describe("API de clientes", () => {
  let clienteId;

  it("POST /api/clientes crea un cliente", async () => {
    const res = await request(app).post("/api/clientes").send({
      nombre: "Juan Perez",
      telefono: "1122334455",
      direccion: "Calle Falsa 123",
    });

    expect(res.status).toBe(201);
    expect(res.body.cliente).toHaveProperty("id");
    expect(res.body.cliente.nombre).toBe("Juan Perez");

    clienteId = res.body.cliente.id;
  });

  it("POST /api/clientes sin campos obligatorios devuelve 400", async () => {
    const res = await request(app).post("/api/clientes").send({
      nombre: "Sin telefono",
    });

    expect(res.status).toBe(400);
  });

  it("GET /api/clientes/:id devuelve el cliente creado", async () => {
    const res = await request(app).get(`/api/clientes/${clienteId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(clienteId);
  });

  it("PUT /api/clientes/:id actualiza los datos", async () => {
    const res = await request(app)
      .put(`/api/clientes/${clienteId}`)
      .send({ direccion: "Nueva Direccion 456" });

    expect(res.status).toBe(200);
    expect(res.body.cliente.direccion).toBe("Nueva Direccion 456");
  });

  it("DELETE /api/clientes/:id elimina el cliente", async () => {
    const res = await request(app).delete(`/api/clientes/${clienteId}`);

    expect(res.status).toBe(200);

    const verificacion = await request(app).get(
      `/api/clientes/${clienteId}`,
    );
    expect(verificacion.status).toBe(404);
  });
});
