const express = require('express');
const router = express.Router();
const { Usuario, Noticia } = require('../models');

// Endpoint 10: DELETE /api/database/vaciar
router.delete('/vaciar', async (req, res) => {
  try {
    await Noticia.destroy({ where: {}, truncate: true });
    await Usuario.destroy({ where: {}, truncate: true });
    res.status(200).json({
      statusCode: 200,
      data: { mensaje: 'Base de datos vaciada correctamente' }
    });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al vaciar la base de datos', error: error.message } });
  }
});

module.exports = router;