const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');

// Endpoint 1: GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll();
    res.status(200).json({ statusCode: 200, data: usuarios });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al obtener usuarios', error: error.message } });
  }
});

// Endpoint 2: GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ statusCode: 404, data: { mensaje: 'Usuario no encontrado' } });
    }
    res.status(200).json({ statusCode: 200, data: usuario });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al obtener usuario', error: error.message } });
  }
});

// Endpoint 3: POST /api/usuarios
router.post('/', async (req, res) => {
  try {
    const { nombre, correo } = req.body;
    const nuevoUsuario = await Usuario.create({ nombre, correo });
    res.status(201).json({ statusCode: 201, data: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al crear usuario', error: error.message } });
  }
});

// Endpoint 4: DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ statusCode: 404, data: { mensaje: 'Usuario no encontrado' } });
    }
    await usuario.destroy();
    res.status(200).json({ statusCode: 200, data: { mensaje: 'Usuario eliminado correctamente' } });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al eliminar usuario', error: error.message } });
  }
});

module.exports = router;