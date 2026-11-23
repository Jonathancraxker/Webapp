const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');

// GET /api/usuarios
router.get('/', async (req, res) => {
  try {
    const usuarios = await Usuario.findAll({
      attributes: ['id', 'nombre', 'correo', 'rol', 'createdAt', 'updatedAt']
    });
    res.status(200).json({ statusCode: 200, data: usuarios });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al obtener usuarios', error: error.message } });
  }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id, {
      attributes: ['id', 'nombre', 'correo', 'rol', 'createdAt', 'updatedAt']
    });
    if (!usuario) {
      return res.status(404).json({ statusCode: 404, data: { mensaje: 'Usuario no encontrado' } });
    }
    res.status(200).json({ statusCode: 200, data: usuario });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al obtener usuario', error: error.message } });
  }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;
    if (!nombre || !correo) {
      return res.status(400).json({ statusCode: 400, data: { mensaje: 'Nombre y correo son obligatorios' } });
    }
    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password: password || '123456',
      rol: rol || 'editor'
    });
    res.status(201).json({ statusCode: 201, data: nuevoUsuario });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al crear usuario', error: error.message } });
  }
});

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
  try {
    const usuario = await Usuario.findByPk(req.params.id);
    if (!usuario) {
      return res.status(404).json({ statusCode: 404, data: { mensaje: 'Usuario no encontrado' } });
    }
    const { nombre, correo, password, rol } = req.body;
    await usuario.update({
      nombre: nombre ?? usuario.nombre,
      correo: correo ?? usuario.correo,
      password: password || usuario.password,
      rol: rol ?? usuario.rol
    });
    res.status(200).json({ statusCode: 200, data: usuario });
  } catch (error) {
    res.status(500).json({ statusCode: 500, data: { mensaje: 'Error al actualizar usuario', error: error.message } });
  }
});

// DELETE /api/usuarios/:id
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