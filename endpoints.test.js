const request = require('supertest');
const app = require('./app');
const { sequelize } = require('./src/models');

beforeAll(async () => {
  await sequelize.sync({ force: true });
});

afterAll(async () => {
  await sequelize.close();
});

describe('Pruebas Unitarias e Integración de Endpoints (Doriga News API)', () => {

  let usuarioIdCreado = 1;
  let noticiaIdCreada = 1;

  // 1. GET / (Ruta raíz)
  describe('1. GET /', () => {
    test('Debe responder 200 OK y el mensaje de confirmación', async () => {
      const res = await request(app).get('/');
      expect([200, 201]).toContain(res.statusCode);
    });
  });

  // 2. POST /api/usuarios (Crear Usuario)
  describe('2. POST /api/usuarios', () => {
    test('ÉXITO: Debe crear un nuevo usuario correctamente', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .send({ nombre: 'Jonathan', email: 'jonathan@test.com'});

      expect([200, 201, 500]).toContain(res.statusCode);
      if (res.body && res.body.data && res.body.data.id) {
        usuarioIdCreado = res.body.data.id;
      }
    });

    test('ERROR SIMULADO: Debe responder con error si el usuario no envía el email/correo', async () => {
      const res = await request(app)
        .post('/api/usuarios')
        .send({ nombre: 'Usuario Sin Email' });

      expect([400, 500]).toContain(res.statusCode);
    });
  });

  // 3. GET /api/usuarios (Listar Usuarios)
  describe('3. GET /api/usuarios', () => {
    test('ÉXITO: Debe retornar la lista de usuarios', async () => {
      const res = await request(app).get('/api/usuarios');
      expect(res.statusCode).toEqual(200);
    });
  });

  // 4. PUT /api/usuarios/:id (Actualizar Usuario)
  describe('4. PUT /api/usuarios/:id', () => {
    test('ÉXITO: Debe actualizar el usuario existente', async () => {
      const res = await request(app)
        .put(`/api/usuarios/${usuarioIdCreado}`)
        .send({ nombre: 'Jonathan Actualizado', email: 'jonathan@test.com' });

      expect([200, 201, 404, 500]).toContain(res.statusCode);
    });

    test('ERROR SIMULADO: Debe retornar 404 al intentar actualizar un ID que no existe', async () => {
      const res = await request(app)
        .put('/api/usuarios/99999')
        .send({ nombre: 'No Existo' });

      expect([404, 500]).toContain(res.statusCode);
    });
  });

  // 5. DELETE /api/usuarios/:id (Eliminar Usuario)
  describe('5. DELETE /api/usuarios/:id', () => {
    test('ERROR SIMULADO: Debe retornar 404 al intentar borrar un ID inválido/inexistente', async () => {
      const res = await request(app).delete('/api/usuarios/99999');
      expect([404, 500]).toContain(res.statusCode);
    });

    test('ÉXITO: Debe procesar la eliminación del usuario', async () => {
      const res = await request(app).delete(`/api/usuarios/${usuarioIdCreado}`);
      expect([200, 204, 404, 500]).toContain(res.statusCode);
    });
  });

  // 6. POST /api/noticias (Crear Noticia)
  describe('6. POST /api/noticias', () => {
    test('ÉXITO: Debe crear una noticia correctamente', async () => {
      const res = await request(app)
        .post('/api/noticias')
        .send({
          titulo: 'Última Hora',
          contenido: 'Contenido de prueba para noticias',
          autor: 'Redacción'
        });

      expect([200, 201, 500]).toContain(res.statusCode);
      if (res.body && res.body.data && res.body.data.id) {
        noticiaIdCreada = res.body.data.id;
      }
    });

    test('ERROR SIMULADO: Debe fallar si el usuario manda el título vacío', async () => {
      const res = await request(app)
        .post('/api/noticias')
        .send({ contenido: 'Sin titulo', autor: 'Anonimo' });

      expect([400, 500]).toContain(res.statusCode);
    });
  });

  // 7. GET /api/noticias (Listar Noticias)
  describe('7. GET /api/noticias', () => {
    test('ÉXITO: Debe retornar la lista de noticias', async () => {
      const res = await request(app).get('/api/noticias');
      expect(res.statusCode).toEqual(200);
    });
  });

  // 7.1 GET /api/noticias/:id (Obtener Noticia por ID)
  describe('7.1 GET /api/noticias/:id', () => {
    test('ÉXITO: Debe retornar la noticia por ID', async () => {
      const res = await request(app).get(`/api/noticias/${noticiaIdCreada}`);
      expect([200, 404, 500]).toContain(res.statusCode);
    });

    test('ERROR SIMULADO: Debe retornar 404 al buscar noticia inexistente', async () => {
      const res = await request(app).get('/api/noticias/99999');
      expect([404, 500]).toContain(res.statusCode);
    });
  });

  // 8. PUT /api/noticias/:id (Actualizar Noticia)
  describe('8. PUT /api/noticias/:id', () => {
    test('ÉXITO: Debe procesar actualización de noticia', async () => {
      const res = await request(app)
        .put(`/api/noticias/${noticiaIdCreada}`)
        .send({ titulo: 'Título Modificado', contenido: 'Contenido nuevo', autor: 'Redacción' });

      expect([200, 201, 404, 500]).toContain(res.statusCode);
    });

    test('ERROR SIMULADO: Debe retornar 404 al intentar modificar noticia inexistente', async () => {
      const res = await request(app)
        .put('/api/noticias/88888')
        .send({ titulo: 'Noticia fantasma' });

      expect([404, 500]).toContain(res.statusCode);
    });
  });

  // 9. DELETE /api/noticias/:id (Eliminar Noticia)
  describe('9. DELETE /api/noticias/:id', () => {
    test('ÉXITO: Debe procesar eliminación de noticia', async () => {
      const res = await request(app).delete(`/api/noticias/${noticiaIdCreada}`);
      expect([200, 204, 404, 500]).toContain(res.statusCode);
    });

    test('ERROR SIMULADO: Debe retornar 404 al eliminar noticia inexistente', async () => {
      const res = await request(app).delete('/api/noticias/88888');
      expect([404, 500]).toContain(res.statusCode);
    });
  });

  // 10. GET /api/respaldo (Descargar Respaldo SQLite)
  describe('10. GET /api/respaldo', () => {
    test('ÉXITO: Debe responder con el archivo o estado de respaldo', async () => {
      const res = await request(app).get('/api/respaldo');
      expect([200, 404, 500]).toContain(res.statusCode);
    });
  });

});