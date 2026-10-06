const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');

const dbPath = path.join(__dirname, '../../data/database.sqlite');

// Endpoint: GET /
router.get('/', (req, res) => {
  // Verificar que la base de datos exista
  if (!fs.existsSync(dbPath)) {
    return res.status(404).json({ statusCode: 404, data: "Base de datos no encontrada" });
  }

  // Descargar directamente el archivo en la máquina del cliente
  res.download(dbPath, 'database_backup.sqlite', (err) => {
    if (err) {
      console.error('Error al descargar el archivo:', err);
      if (!res.headersSent) {
        return res.status(500).json({ statusCode: 500, data: "Error al descargar el respaldo" });
      }
    }
  });
});

module.exports = router;