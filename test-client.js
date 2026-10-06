const net = require('net');

const HOST = '18.191.218.236';
const PORT = 6061;

const client = new net.Socket();
let paso = 'insert';

client.connect(PORT, HOST, () => {
  console.log('--- CONECTADO AL SERVIDOR TCP EC2 ---');

  // 1. Probar inserción
  const noticia = { titulo: "Noticia Socket TCP en peligro", contenido: "Noticia de Claudia Sheinbaum", autor: "Jonathan", usuarioId: 1 };
  const mensajeInsert = `{insert:${JSON.stringify(noticia)}}`;
  
  console.log('Enviando comando:', mensajeInsert);
  client.write(mensajeInsert);
});

client.on('data', (data) => {
  console.log('Respuesta recibida:', data.toString());

  if (paso === 'insert') {
    paso = 'get';
    // 2. Probar consulta
    const mensajeGet = '{get:1}';
    console.log('Enviando comando:', mensajeGet);
    client.write(mensajeGet);
  } else {
    client.destroy(); // Finalizar prueba
  }
});

client.on('close', () => console.log('--- PRUEBA TCP FINALIZADA ---'));
client.on('error', (err) => console.error('Error TCP:', err.message));