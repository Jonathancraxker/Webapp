const express = require('express');
const router = express.Router();
const { Usuario } = require('../models');
const { logBackendEvent } = require('../telemetry/logger');

// POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { correo, password } = req.body;
    if (!correo || !password) {
      return res.status(400).json({
        statusCode: 400,
        data: { mensaje: 'Correo y contraseña requeridos' }
      });
    }

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario || usuario.password !== password) {
      logBackendEvent({
        level: 'WARN',
        message: `Intento de login fallido para: ${correo}`,
        method: 'POST',
        url: '/api/auth/login',
        statusCode: 401
      });
      return res.status(401).json({
        statusCode: 401,
        data: { mensaje: 'Correo o contraseña incorrectos' }
      });
    }

    res.status(200).json({
      statusCode: 200,
      data: {
        mensaje: 'Inicio de sesión exitoso',
        token: `token-jwt-${usuario.id}-${Date.now()}`,
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
          rol: usuario.rol
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      data: { mensaje: 'Error en autenticación', error: error.message }
    });
  }
});

// POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { nombre, correo, password, rol } = req.body;
    if (!nombre || !correo || !password) {
      return res.status(400).json({
        statusCode: 400,
        data: { mensaje: 'Nombre, correo y contraseña son obligatorios' }
      });
    }

    const existe = await Usuario.findOne({ where: { correo } });
    if (existe) {
      return res.status(400).json({
        statusCode: 400,
        data: { mensaje: 'El correo electrónico ya está registrado' }
      });
    }

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      password,
      rol: rol || 'editor'
    });

    res.status(201).json({
      statusCode: 201,
      data: {
        mensaje: 'Usuario registrado correctamente',
        usuario: {
          id: nuevoUsuario.id,
          nombre: nuevoUsuario.nombre,
          correo: nuevoUsuario.correo,
          rol: nuevoUsuario.rol
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      statusCode: 500,
      data: { mensaje: 'Error al registrar usuario', error: error.message }
    });
  }
});

module.exports = router;