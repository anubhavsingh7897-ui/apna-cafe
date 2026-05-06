const { Sequelize } = require('sequelize');
require('dotenv').config();

const commonOptions = {
  logging: process.env.DB_LOGGING === 'true' ? console.log : false,
  define: {
    underscored: true,
    freezeTableName: true
  }
};

const databaseUrl = process.env.DATABASE_URL || '';
const databaseUrlHasSslMode = /[?&]sslmode=/i.test(databaseUrl);

const sequelize = process.env.DATABASE_URL
  ? new Sequelize(process.env.DATABASE_URL, {
    ...commonOptions,
    dialect: process.env.DB_DIALECT || 'postgres',
    ...(databaseUrlHasSslMode
      ? {}
      : {
        dialectOptions: {
          ssl: process.env.DB_SSL === 'false'
            ? false
            : {
              require: true,
              rejectUnauthorized: false
            }
        }
      })
  })
  : new Sequelize(
    process.env.DB_NAME || 'apna_cafe',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '',
    {
      ...commonOptions,
      host: process.env.DB_HOST || 'localhost',
      port: Number(process.env.DB_PORT || 3306),
      dialect: process.env.DB_DIALECT || 'mysql'
    }
  );

module.exports = sequelize;
