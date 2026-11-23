process.env.NODE_ENV = 'test';

const request = require('supertest');
const app = require('./app');
const { sequelize } = require('./src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

// ============================================================================
// BLOQUE 1: HEALTH CHECK, ZONA HORARIA Y TELEMETRÍA (4 PRUEBAS)
// ============================================================================
describe('1. Health Check, Zona Horaria y Telemetría', () => {
  test('01. GET /api/health debe responder 200 OK con metadatos del servicio', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('OK');
    expect(res.body).toHaveProperty('version');
    expect(res.body).toHaveProperty('uptime_seconds');
  });

  test('02. GET /api/health debe incluir timestamps sincronizados con México (UTC-6)', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.timezone).toContain('America/Mexico_City');
    expect(res.body).toHaveProperty('timestamp_mx');
    expect(res.body).toHaveProperty('timestamp_utc');
  });

  test('03. POST /api/telemetry/frontend debe aceptar logs estructurados con 202', async () => {
    const res = await request(app)
      .post('/api/telemetry/frontend')
      .send({
        level: 'INFO',
        action: 'TEST_TELEMETRY_EVENT',
        page: '/noticias-feed',
        status: '200',
        details: { test: true }
      });

    expect(res.statusCode).toBe(202);
    expect(res.body.received).toBe(true);
  });

  test('04. POST /api/telemetry/frontend debe aplicar valores por defecto si el body viene vacío', async () => {
    const res = await request(app)
      .post('/api/telemetry/frontend')
      .send({});

    expect(res.statusCode).toBe(202);
    expect(res.body.received).toBe(true);
  });
});

// ============================================================================
// BLOQUE 2: AUTENTICACIÓN - REGISTRO Y LOGIN (6 PRUEBAS)
// ============================================================================
describe('2. Autenticación (/api/auth)', () => {
  test('05. POST /api/auth/register debe crear un nuevo usuario administrador (201)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Jonathan Admin',
        correo: 'admin_test@uteq.edu.mx',
        password: 'Password#2026',
        rol: 'admin'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.usuario.correo).toBe('admin_test@uteq.edu.mx');
    expect(res.body.data.usuario.rol).toBe('admin');
  });

  test('06. POST /api/auth/register debe fallar con 400 si faltan campos obligatorios', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ nombre: 'Sin Correo Ni Password' });

    expect(res.statusCode).toBe(400);
  });

  test('07. POST /api/auth/register debe rechazar correos duplicados con 400', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        nombre: 'Duplicado',
        correo: 'admin_test@uteq.edu.mx',
        password: 'Password#2026'
      });

    expect(res.statusCode).toBe(400);
  });

  test('08. POST /api/auth/login debe iniciar sesión con credenciales válidas (200)', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'admin_test@uteq.edu.mx',
        password: 'Password#2026'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.data).toHaveProperty('token');
    expect(res.body.data.usuario.nombre).toBe('Jonathan Admin');
  });

  test('09. POST /api/auth/login debe rechazar contraseña incorrecta con 401', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({
        correo: 'admin_test@uteq.edu.mx',
        password: 'ClaveEquivocada999'
      });

    expect(res.statusCode).toBe(401);
  });

  test('10. POST /api/auth/login debe responder 400 si no se envían credenciales', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({});

    expect(res.statusCode).toBe(400);
  });
});

// ============================================================================
// BLOQUE 3: CRUD COMPLETO DE USUARIOS (6 PRUEBAS)
// ============================================================================
describe('3. CRUD de Usuarios (/api/usuarios)', () => {
  let usuarioCreadoId;

  test('11. POST /api/usuarios debe registrar un redactor válido (201)', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({
        nombre: 'María Redactora',
        correo: 'maria_test@uteq.edu.mx',
        password: 'Password#2026',
        rol: 'editor'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    usuarioCreadoId = res.body.data.id;
  });

  test('12. POST /api/usuarios debe responder 400 si falta nombre o correo', async () => {
    const res = await request(app)
      .post('/api/usuarios')
      .send({ nombre: 'Usuario Incompleto' });

    expect(res.statusCode).toBe(400);
  });

  test('13. GET /api/usuarios debe devolver el listado sin exponer contraseñas (200)', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(2);
    expect(res.body.data[0]).not.toHaveProperty('password');
  });

  test('14. GET /api/usuarios/:id debe retornar el usuario por ID y 404 si no existe', async () => {
    const resOk = await request(app).get(`/api/usuarios/${usuarioCreadoId}`);
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body.data.correo).toBe('maria_test@uteq.edu.mx');

    const res404 = await request(app).get('/api/usuarios/99999');
    expect(res404.statusCode).toBe(404);
  });

  test('15. PUT /api/usuarios/:id debe actualizar datos y responder 404 si ID no existe', async () => {
    const resOk = await request(app)
      .put(`/api/usuarios/${usuarioCreadoId}`)
      .send({ nombre: 'María López Actualizada', rol: 'admin' });
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body.data.nombre).toBe('María López Actualizada');

    const res404 = await request(app)
      .put('/api/usuarios/99999')
      .send({ nombre: 'Fantasma' });
    expect(res404.statusCode).toBe(404);
  });

  test('16. DELETE /api/usuarios/:id debe eliminar el usuario y responder 404 si ya no existe', async () => {
    const resOk = await request(app).delete(`/api/usuarios/${usuarioCreadoId}`);
    expect(resOk.statusCode).toBe(200);

    const res404 = await request(app).delete(`/api/usuarios/${usuarioCreadoId}`);
    expect(res404.statusCode).toBe(404);
  });
});

// ============================================================================
// BLOQUE 4: CRUD COMPLETO DE NOTICIAS (7 PRUEBAS)
// ============================================================================
describe('4. CRUD de Noticias (/api/noticias)', () => {
  let noticiaId;

  test('17. POST /api/noticias debe publicar una noticia asociada a un usuario (201)', async () => {
    const res = await request(app)
      .post('/api/noticias')
      .send({
        titulo: 'Noticia de Prueba Jest',
        contenido: 'Contenido completo verificado mediante Supertest.',
        usuarioId: 1
      });

    expect(res.statusCode).toBe(201);
    expect(res.body.data.titulo).toBe('Noticia de Prueba Jest');
    noticiaId = res.body.data.id;
  });

  test('18. POST /api/noticias debe fallar con 400 si falta título o contenido', async () => {
    const resSinTitulo = await request(app)
      .post('/api/noticias')
      .send({ contenido: 'Falta el titular' });
    expect(resSinTitulo.statusCode).toBe(400);

    const resSinContenido = await request(app)
      .post('/api/noticias')
      .send({ titulo: 'Falta el cuerpo' });
    expect(resSinContenido.statusCode).toBe(400);
  });

  test('19. GET /api/noticias debe listar noticias incluyendo datos del autor (200)', async () => {
    const res = await request(app).get('/api/noticias');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data[0]).toHaveProperty('Usuario');
  });

  test('20. GET /api/noticias/:id debe retornar la nota específica (200)', async () => {
    const res = await request(app).get(`/api/noticias/${noticiaId}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data.id).toBe(noticiaId);
  });

  test('21. GET /api/noticias/:id debe retornar 404 para una noticia inexistente', async () => {
    const res = await request(app).get('/api/noticias/88888');
    expect(res.statusCode).toBe(404);
  });

  test('22. PUT /api/noticias/:id debe actualizar titular y contenido (200) y dar 404 si no existe', async () => {
    const resOk = await request(app)
      .put(`/api/noticias/${noticiaId}`)
      .send({ titulo: 'Titular Editado Jest', contenido: 'Cuerpo modificado' });
    expect(resOk.statusCode).toBe(200);
    expect(resOk.body.data.titulo).toBe('Titular Editado Jest');

    const res404 = await request(app)
      .put('/api/noticias/88888')
      .send({ titulo: 'Inexistente' });
    expect(res404.statusCode).toBe(404);
  });

  test('23. DELETE /api/noticias/:id debe eliminar la noticia (200) y dar 404 si se repite', async () => {
    const resOk = await request(app).delete(`/api/noticias/${noticiaId}`);
    expect(resOk.statusCode).toBe(200);

    const res404 = await request(app).delete(`/api/noticias/${noticiaId}`);
    expect(res404.statusCode).toBe(404);
  });
});

// ============================================================================
// BLOQUE 5: RESPALDO Y MANTENIMIENTO DE BASE DE DATOS (3 PRUEBAS)
// ============================================================================
describe('5. Respaldo y Mantenimiento SQLite (/api/respaldo y /api/database)', () => {
  test('24. GET /api/respaldo debe responder con archivo SQLite o estado controlado', async () => {
    const res = await request(app).get('/api/respaldo');
    expect([200, 404]).toContain(res.statusCode);
  });

  test('25. DELETE /api/database/vaciar debe limpiar las tablas correctamente (200)', async () => {
    const res = await request(app).delete('/api/database/vaciar');
    expect(res.statusCode).toBe(200);
    expect(res.body.data.mensaje).toContain('vaciada');
  });

  test('26. GET /api/usuarios después de vaciar debe retornar un arreglo vacío (200)', async () => {
    const res = await request(app).get('/api/usuarios');
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toEqual([]);
  });
});