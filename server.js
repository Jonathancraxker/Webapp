const app = require('./app');
const { sequelize, Usuario, Noticia } = require('./src/models');
const startTcpServer = require('./src/tcpServer');
const { logBackendEvent } = require('./src/telemetry/logger');
const { APP_VERSION } = require('./src/telemetry/otel');

const PORT = process.env.PORT || 4000;

async function seedInitialData() {
  const count = await Usuario.count();
  if (count === 0) {
    const admin = await Usuario.create({
      nombre: 'Jonathan Cruz (Admin)',
      correo: 'admin@uteq.edu.mx',
      password: 'Password#2026',
      rol: 'admin'
    });
    await Noticia.create({
      titulo: 'Despliegue CI/CD y Observabilidad Activos',
      contenido: 'Sistema instrumentado con OpenTelemetry, Playwright y OpenObserve en AWS EC2.',
      usuarioId: admin.id
    });
  }
}

sequelize.sync().then(async () => {
  await seedInitialData();
  console.log('Base de datos SQLite sincronizada.');
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT} | Versión: ${APP_VERSION}`);
    logBackendEvent({
      level: 'INFO',
      message: `Servidor iniciado en puerto ${PORT} (Versión ${APP_VERSION})`,
      method: 'STARTUP',
      url: `http://localhost:${PORT}`,
      statusCode: 200
    });
  });
  startTcpServer();
}).catch((error) => {
  console.error('Error al conectar la base de datos:', error);
});