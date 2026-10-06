const net = require('net');
const path = require('path');
// Importamos los modelos (por ejemplo Noticia o Usuario)
const { Noticia } = require('./models');

const PORT = 6061;

const startTcpServer = () => {
  const server = net.createServer((socket) => {
    console.log('Cliente TCP conectado');

    socket.on('data', async (data) => {
      const mensaje = data.toString().trim();
      console.log('Mensaje TCP recibido:', mensaje);

      try {
        // 1. Manejo del comando {insert:}
        if (mensaje.startsWith('{insert:') && mensaje.endsWith('}')) {
          // Extrae el contenido dentro de {insert:...}
          const payload = mensaje.slice(8, -1).trim();
          const dataJson = JSON.parse(payload);

          // Inserta en la base de datos
          const nuevoRegistro = await Noticia.create(dataJson);
          
          socket.write(JSON.stringify({
            statusCode: 201,
            data: { mensaje: "Elemento insertado via TCP", registro: nuevoRegistro }
          }) + '\n');

        // 2. Manejo del comando {get:}
        } else if (mensaje.startsWith('{get:') && mensaje.endsWith('}')) {
          // Extrae el elemento/ID dentro de {get:...}
          const id = mensaje.slice(5, -1).trim();

          const registro = await Noticia.findByPk(id);
          
          if (registro) {
            socket.write(JSON.stringify({
              statusCode: 200,
              data: registro
            }) + '\n');
          } else {
            socket.write(JSON.stringify({
              statusCode: 404,
              data: { mensaje: "Elemento no encontrado" }
            }) + '\n');
          }

        } else {
          socket.write(JSON.stringify({
            statusCode: 400,
            data: { mensaje: "Formato invalido. Usa {insert:} o {get:}" }
          }) + '\n');
        }
      } catch (error) {
        socket.write(JSON.stringify({
          statusCode: 500,
          data: { mensaje: "Error al procesar socket TCP", error: error.message }
        }) + '\n');
      }
    });

    socket.on('end', () => console.log('Cliente TCP desconectado'));
    socket.on('error', (err) => console.error('Error en Socket TCP:', err.message));
  });

  server.listen(PORT, () => {
    console.log(`Servidor TCP Sockets escuchando en el puerto ${PORT}`);
  });
};

module.exports = startTcpServer;