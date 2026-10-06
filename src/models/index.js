const { sequelize } = require('../config/database');
const Usuario = require('./Usuario');
const Noticia = require('./Noticia');

// Relación 1:M (Un usuario puede publicar muchas noticias)
Usuario.hasMany(Noticia, { foreignKey: 'usuarioId', onDelete: 'CASCADE' });
Noticia.belongsTo(Usuario, { foreignKey: 'usuarioId' });

module.exports = {
  sequelize,
  Usuario,
  Noticia
};