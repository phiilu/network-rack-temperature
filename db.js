const knex = require('knex')({
  client: process.env.DB_PROVIDER,
  connection: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PW,
    database: process.env.DB_DATABASE,
  },
  pool: { min: 0, max: 7 },
});

module.exports = knex;
