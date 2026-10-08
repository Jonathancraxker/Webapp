const express = require('express');
const cors = require('cors');
const { sequelize } = require('./src/models');

const usuariosRoutes = require('./src/routes/usuarios');
const noticiasRoutes = require('./src/routes/noticias');
const backupRoutes = require('./src/routes/respaldo');
const baseDatosRoutes = require('./src/routes/database');
const startTcpServer = require('./src/tcpServer');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.status(200).json({
    statusCode: 200,
    data: { mensaje: 'Ta jalando al 200 el chalan: Jonathan + +' }
  });
});

// Endpoints
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/respaldo', backupRoutes);
app.use('/api/database', baseDatosRoutes);

// Sincronizar base de datos e iniciar servidor
sequelize.sync().then(() => {
  console.log('Base de datos SQLite sincronizada.');
  app.listen(PORT, () => {
    console.log(`Servidor ejecutándose en el puerto ${PORT}`);
  });
  startTcpServer();
}).catch((error) => {
  console.error('Error al conectar la base de datos:', error);
});

module.exports = app;