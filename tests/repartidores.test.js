const request = require("supertest");
const app = require("../app");

const datosRepartidor = {
  nombre: "Carlos",
  telefono: "1133445566",
  vehiculo: "Moto",
};

const crearRepartidor = (datos = datosRepartidor) =>
  request(app).post("/api/repartidores").send(datos);

describe("API de repartidores", () => {
  test("POST crea un repartidor disponible (201)", async () => {
    const res = await crearRepartidor();
    expect(res.status).toBe(201);
    expect(res.body.repartidor.disponible).toBe(true);
  });

  test("POST con datos faltantes devuelve 400", async () => {
    const res = await crearRepartidor({ nombre: "Carlos" });
    expect(res.status).toBe(400);
  });

  test("GET lista y GET por ID (200, 404, 400)", async () => {
    const { body } = await crearRepartidor();
    const id = body.repartidor._id;

    expect((await request(app).get("/api/repartidores")).body).toHaveLength(1);
    expect((await request(app).get(`/api/repartidores/${id}`)).status).toBe(
      200,
    );
    expect(
      (await request(app).get("/api/repartidores/64b7f0c2a1b2c3d4e5f60718"))
        .status,
    ).toBe(404);
    expect((await request(app).get("/api/repartidores/abc")).status).toBe(400);
  });

  test("PUT actualiza la disponibilidad", async () => {
    const { body } = await crearRepartidor();
    const res = await request(app)
      .put(`/api/repartidores/${body.repartidor._id}`)
      .send({ disponible: false });
    expect(res.status).toBe(200);
    expect(res.body.repartidor.disponible).toBe(false);
  });

  test("DELETE elimina el repartidor y luego devuelve 404", async () => {
    const { body } = await crearRepartidor();
    const id = body.repartidor._id;
    expect((await request(app).delete(`/api/repartidores/${id}`)).status).toBe(
      200,
    );
    expect((await request(app).delete(`/api/repartidores/${id}`)).status).toBe(
      404,
    );
  });
});
