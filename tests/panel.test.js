const request = require("supertest");
const app = require("../app");

// Crea un agente con cookies/sesión autenticada en Passport
const crearAgenteAutenticado = async () => {
  const agent = request.agent(app);
  await agent
    .post("/signup")
    .type("form")
    .send({
      username: "operador",
      name: "Operador Test",
      password: "clave1234",
    });
  return agent;
};

describe("Panel web (Pug) protegido con sesión y cookies", () => {
  test("GET / sin iniciar sesión redirige a /login", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("/login");
  });

  test("GET / con sesión iniciada renderiza el panel y muestra al operador", async () => {
    const agent = await crearAgenteAutenticado();
    const res = await agent.get("/");
    expect(res.status).toBe(200);
    expect(res.text).toContain("FreshRoute");
    expect(res.text).toContain("Operador Test");
  });

  test("agregar un cliente desde el formulario lo muestra en el panel", async () => {
    const agent = await crearAgenteAutenticado();
    const alta = await agent
      .post("/agregar-cliente")
      .type("form")
      .send({ nombre: "Lucia", telefono: "777", direccion: "Calle 9" });
    expect(alta.status).toBe(302);
    expect(alta.headers.location).toBe("/");

    const panel = await agent.get("/");
    expect(panel.text).toContain("Lucia");
  });

  test("un teléfono repetido redirige con el mensaje de error", async () => {
    const agent = await crearAgenteAutenticado();
    const datos = { nombre: "Lucia", telefono: "777", direccion: "Calle 9" };
    await agent.post("/agregar-cliente").type("form").send(datos);
    const res = await agent
      .post("/agregar-cliente")
      .type("form")
      .send(datos);
    expect(res.status).toBe(302);
    expect(decodeURIComponent(res.headers.location)).toMatch(/Ya existe/);
  });

  test("no permite eliminar un cliente con pedidos activos", async () => {
    const agent = await crearAgenteAutenticado();
    await agent
      .post("/agregar-cliente")
      .type("form")
      .send({ nombre: "Lucia", telefono: "777", direccion: "Calle 9" });
    await agent
      .post("/agregar-producto")
      .type("form")
      .send({ nombre: "Pera", precio: "300", stock: "5", categoria: "" });

    const clientes = (await request(app).get("/api/clientes")).body;
    const productos = (await request(app).get("/api/productos")).body;
    await agent
      .post("/agregar-pedido")
      .type("form")
      .send({ idCliente: clientes[0]._id, idProductos: productos[0]._id });

    const res = await agent.post(`/eliminar-cliente/${clientes[0]._id}`);
    expect(res.status).toBe(302);
    expect(decodeURIComponent(res.headers.location)).toMatch(/pedidos activos/);
  });
});
