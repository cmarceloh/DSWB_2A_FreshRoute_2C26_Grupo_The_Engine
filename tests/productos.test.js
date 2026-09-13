const request = require("supertest");
const app = require("../index");

describe("API de productos", () => {
  let productoId;

  it("POST /api/productos crea un producto", async () => {
    const res = await request(app).post("/api/productos").send({
      nombre: "Manzana",
      precio: 500,
      stock: 100,
      categoria: "Frutas",
    });

    expect(res.status).toBe(201);
    expect(res.body.producto).toHaveProperty("id");
    expect(res.body.producto.stock).toBe(100);

    productoId = res.body.producto.id;
  });

  it("POST /api/productos con precio invalido devuelve 400", async () => {
    const res = await request(app).post("/api/productos").send({
      nombre: "Producto invalido",
      precio: -10,
      stock: 5,
    });

    expect(res.status).toBe(400);
  });

  it("GET /api/productos/:id devuelve el producto creado", async () => {
    const res = await request(app).get(`/api/productos/${productoId}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe(productoId);
  });

  it("PUT /api/productos/:id/stock ajusta el stock correctamente", async () => {
    const res = await request(app)
      .put(`/api/productos/${productoId}/stock`)
      .send({ cantidad: -20 });

    expect(res.status).toBe(200);
    expect(res.body.producto.stock).toBe(80);
  });

  it("PUT /api/productos/:id/stock rechaza dejar el stock en negativo", async () => {
    const res = await request(app)
      .put(`/api/productos/${productoId}/stock`)
      .send({ cantidad: -1000 });

    expect(res.status).toBe(400);
  });

  it("DELETE /api/productos/:id elimina el producto", async () => {
    const res = await request(app).delete(`/api/productos/${productoId}`);

    expect(res.status).toBe(200);

    const verificacion = await request(app).get(
      `/api/productos/${productoId}`,
    );
    expect(verificacion.status).toBe(404);
  });
});
