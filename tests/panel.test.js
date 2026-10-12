const request = require("supertest");
const app = require("../app");

describe("Panel web (Pug)", () => {
  test("GET / renderiza el panel", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("FreshRoute");
  });

  test("agregar un cliente desde el formulario lo muestra en el panel", async () => {
    const alta = await request(app)
      .post("/agregar-cliente")
      .type("form")
      .send({ nombre: "Lucia", telefono: "777", direccion: "Calle 9" });
    expect(alta.status).toBe(302);
    expect(alta.headers.location).toBe("/");

    const panel = await request(app).get("/");
    expect(panel.text).toContain("Lucia");
  });

  test("un teléfono repetido redirige con el mensaje de error", async () => {
    const datos = { nombre: "Lucia", telefono: "777", direccion: "Calle 9" };
    await request(app).post("/agregar-cliente").type("form").send(datos);
    const res = await request(app)
      .post("/agregar-cliente")
      .type("form")
      .send(datos);
    expect(res.status).toBe(302);
    expect(decodeURIComponent(res.headers.location)).toMatch(/Ya existe/);
  });

  test("no permite eliminar un cliente con pedidos activos", async () => {
    await request(app)
      .post("/agregar-cliente")
      .type("form")
      .send({ nombre: "Lucia", telefono: "777", direccion: "Calle 9" });
    await request(app)
      .post("/agregar-producto")
      .type("form")
      .send({ nombre: "Pera", precio: "300", stock: "5", categoria: "" });

    const clientes = (await request(app).get("/api/clientes")).body;
    const productos = (await request(app).get("/api/productos")).body;
    await request(app)
      .post("/agregar-pedido")
      .type("form")
      .send({ idCliente: clientes[0]._id, idProductos: productos[0]._id });

    const res = await request(app).post(`/eliminar-cliente/${clientes[0]._id}`);
    expect(res.status).toBe(302);
    expect(decodeURIComponent(res.headers.location)).toMatch(/pedidos activos/);
  });
});
