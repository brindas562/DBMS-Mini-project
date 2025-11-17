const mysql = require('mysql2/promise');

const required = ['DB_HOST', 'DB_PORT', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];

function getConfig() {
  const cfg = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 3306,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    multipleStatements: false
  };
  for (const k of required) {
    if (!process.env[k]) {
      console.warn(`[db] Missing env ${k}. Check your .env`);
    }
  }
  return cfg;
}

const pool = mysql.createPool(getConfig());

module.exports = { pool };
