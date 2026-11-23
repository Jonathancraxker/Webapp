require('./src/telemetry/otel');
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { observabilityMiddleware, logFrontendEvent, getTimestamps } = require('./src/telemetry/logger');
const { APP_VERSION } = require('./src/telemetry/otel');

const authRoutes = require('./src/routes/auth');
const usuariosRoutes = require('./src/routes/usuarios');
const noticiasRoutes = require('./src/routes/noticias');
const backupRoutes = require('./src/routes/respaldo');
const baseDatosRoutes = require('./src/routes/database');

const app = express();

app.use(cors());
app.use(express.json());
app.use(observabilityMiddleware);

// API Health con versión de Git y hora de México (UTC-6)
app.get('/api/health', (req, res) => {
  const { timestamp_mx, timestamp_utc } = getTimestamps();
  res.status(200).json({
    statusCode: 200,
    status: 'OK',
    service: 'Doriga_News App',
    version: APP_VERSION,
    timezone: 'America/Mexico_City (UTC-6)',
    timestamp_mx,
    timestamp_utc,
    uptime_seconds: Math.floor(process.uptime())
  });
});

// Endpoint receptor de logs y eventos del Frontend React -> OpenObserve
app.post('/api/telemetry/frontend', (req, res) => {
  const { level = 'INFO', action, page, details, status = 'OK' } = req.body;
  logFrontendEvent({
    level,
    action: action || 'UI_EVENT',
    page: page || '/',
    status,
    details: details || {}
  });
  res.status(202).json({ statusCode: 202, received: true });
});

// Endpoints REST
app.use('/api/auth', authRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/noticias', noticiasRoutes);
app.use('/api/respaldo', backupRoutes);
app.use('/api/database', baseDatosRoutes);

// Servir Frontend React compilado (client/dist) si existe
const frontendDistPath = path.join(__dirname, 'client', 'dist');
if (fs.existsSync(frontendDistPath)) {
  app.use(express.static(frontendDistPath));
  app.get('/{*splat}', (req, res) => {
    res.sendFile(path.join(frontendDistPath, 'index.html'));
  });
} else {
  app.get('/', (req, res) => {
    res.status(200).json({
      statusCode: 200,
      version: APP_VERSION,
      data: { mensaje: 'API Webapp Noticias funcionando correctamente', health: '/api/health' }
    });
  });
}

module.exports = app;