const request = require("supertest");
const app = require("../app");

describe("Autenticación, Cookies, Sesiones y JWT", () => {
  test("POST /api/usuarios crea un usuario con contraseña hasheada y oculta passwordHash", async () => {
    const res = await request(app).post("/api/usuarios").send({
      username: "admin",
      name: "Admin FreshRoute",
      password: "secret123",
    });

    expect(res.status).toBe(201);
    expect(res.body.username).toBe("admin");
    expect(res.body.name).toBe("Admin FreshRoute");
    expect(res.body.id).toBeDefined();
    expect(res.body.passwordHash).toBeUndefined();
  });

  test("POST /api/usuarios rechaza nombre de usuario duplicado (409)", async () => {
    await request(app).post("/api/usuarios").send({
      username: "admin",
      name: "Admin 1",
      password: "secret123",
    });

    const duplicado = await request(app).post("/api/usuarios").send({
      username: "admin",
      name: "Admin 2",
      password: "secret456",
    });

    expect(duplicado.status).toBe(409);
  });

  test("POST /api/login devuelve JWT y cookie httpOnly con credenciales válidas, y 401 si son inválidas", async () => {
    await request(app).post("/api/usuarios").send({
      username: "admin",
      name: "Admin FreshRoute",
      password: "secret123",
    });

    const fallo = await request(app).post("/api/login").send({
      username: "admin",
      password: "clave_incorrecta",
    });
    expect(fallo.status).toBe(401);
    expect(fallo.body.error).toMatch(/invalid username or password/i);

    const exito = await request(app).post("/api/login").send({
      username: "admin",
      password: "secret123",
    });
    expect(exito.status).toBe(200);
    expect(exito.body.token).toBeDefined();
    expect(exito.body.username).toBe("admin");
    expect(exito.headers["set-cookie"]).toBeDefined();
  });

  test("GET /api/perfil valida el token Bearer y rechaza tokens inválidos con 401", async () => {
    await request(app).post("/api/usuarios").send({
      username: "admin",
      name: "Admin FreshRoute",
      password: "secret123",
    });

    const login = await request(app).post("/api/login").send({
      username: "admin",
      password: "secret123",
    });
    const token = login.body.token;

    const sinToken = await request(app).get("/api/perfil");
    expect(sinToken.status).toBe(401);

    const tokenInvalido = await request(app)
      .get("/api/perfil")
      .set("Authorization", "Bearer token.adulterado.invalido");
    expect(tokenInvalido.status).toBe(401);
    expect(tokenInvalido.body.error).toBe("invalid token");

    const conToken = await request(app)
      .get("/api/perfil")
      .set("Authorization", `Bearer ${token}`);
    expect(conToken.status).toBe(200);
    expect(conToken.body.usuario.username).toBe("admin");
  });

  test("Flujo completo de sesión web con Passport, cookies y cierre de sesión (/signout)", async () => {
    const agent = request.agent(app);

    // 1. Registro por formulario web crea sesión y setea cookies
    const registro = await agent
      .post("/signup")
      .type("form")
      .send({
        username: "valeria",
        name: "Valeria Fernandez",
        password: "pass1234",
      });
    expect(registro.status).toBe(302);
    expect(registro.headers.location).toBe("/");
    expect(registro.headers["set-cookie"]).toBeDefined();

    // 2. Acceso al panel con la sesión activa
    const panel = await agent.get("/");
    expect(panel.status).toBe(200);
    expect(panel.text).toContain("Valeria Fernandez");

    // 3. Cierre de sesión destruye la sesión y redirige a /login
    const logout = await agent.get("/signout");
    expect(logout.status).toBe(302);
    expect(logout.headers.location).toBe("/login");

    // 4. Intentar entrar de nuevo al panel sin sesión redirige a /login
    const bloqueado = await agent.get("/");
    expect(bloqueado.status).toBe(302);
    expect(bloqueado.headers.location).toBe("/login");
  });
});
