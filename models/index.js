const Sequelize = require('sequelize');
const sequelize = new Sequelize('sql12246619', 'sql12246619', 'BkUuePq27P', {
  host: 'sql12.freemysqlhosting.net',
  dialect: 'mysql',
  pool: {
    max: 5,
    min: 0,
    acquire: 30000,
    idle: 10000
  },
});

module.exports = sequelize;