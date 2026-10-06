const express = require('express');
const router = express.Router();
const { Noticia, Usuario } = require('../models');

// Endpoint 5: GET /api/noticias
router.get('/', async (req, res) => {
  try {
    const noticias = await Noticia.findAll({
      include: { model: Usuario, attributes: ['id', 'nombre', 'correo'] }
    });
    res.status(200).json({ statusCode: 200, data: noticias });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al obtener noticias', error: error.message } });
  }
});

// Endpoint 6: GET /api/noticias/:id
router.get('/:id', async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id, {
      include: { model: Usuario, attributes: ['id', 'nombre', 'correo'] }
    });
    if (!noticia) {
      return res.status(404).json({ statusCode: 404, data: { mensaje: 'Noticia no encontrada' } });
    }
    res.status(200).json({ statusCode: 200, data: noticia });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al obtener noticia', error: error.message } });
  }
});

// Endpoint 7: POST /api/noticias
router.post('/', async (req, res) => {
  try {
    const { titulo, contenido, usuarioId } = req.body;
    const nuevaNoticia = await Noticia.create({ titulo, contenido, usuarioId });
    res.status(201).json({ statusCode: 201, data: nuevaNoticia });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al crear noticia', error: error.message } });
  }
});

// Endpoint 8: DELETE /api/noticias/:id
router.delete('/:id', async (req, res) => {
  try {
    const noticia = await Noticia.findByPk(req.params.id);
    if (!noticia) {
      return res.status(404).json({ statusCode: 404, data: { mensaje: 'Noticia no encontrada' } });
    }
    await noticia.destroy();
    res.status(200).json({ statusCode: 200, data: { mensaje: 'Noticia eliminada correctamente' } });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al eliminar noticia', error: error.message } });
  }
});

module.exports = router;