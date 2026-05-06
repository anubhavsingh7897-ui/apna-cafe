const mysql = require('mysql2/promise');
require('dotenv').config();

async function createDatabase() {
  const databaseName = process.env.DB_NAME || 'apna_cafe';
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT || 3306),
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || ''
  });

  await connection.query(`CREATE DATABASE IF NOT EXISTS \`${databaseName}\``);
  await connection.end();

  console.log(`Database "${databaseName}" is ready.`);
}

createDatabase().catch((error) => {
  console.error('Database creation failed:', error.message);
  process.exitCode = 1;
});
