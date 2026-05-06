require('dotenv').config();

const app = require('./app');
const { sequelize } = require('./models');
const pruneDuplicateUniqueIndexes = require('./utils/pruneDuplicateUniqueIndexes');

const port = process.env.PORT || 5000;

async function startServer() {
  await sequelize.authenticate();
  await pruneDuplicateUniqueIndexes(sequelize);
  await sequelize.sync();

  app.listen(port, () => {
    console.log(`Backend API running on port ${port}`);
  });
}

startServer().catch((error) => {
  if (error.name === 'SequelizeAccessDeniedError') {
    console.error(
      'Unable to start backend API: the configured database user/password was rejected.'
    );
  } else if (error.name === 'SequelizeConnectionError') {
    console.error(
      'Unable to start backend API: the database is not reachable. Check DATABASE_URL or DB_HOST/DB_PORT.'
    );
  } else {
    console.error('Unable to start backend API:', error);
  }

  process.exit(1);
});
