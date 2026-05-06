const { sequelize } = require('./models');
const pruneDuplicateUniqueIndexes = require('./utils/pruneDuplicateUniqueIndexes');

async function syncDatabase() {
  await sequelize.authenticate();
  await pruneDuplicateUniqueIndexes(sequelize);
  await sequelize.sync({ alter: true });
  console.log('Database synced successfully.');
}

syncDatabase()
  .catch((error) => {
    console.error('Database sync failed:', error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await sequelize.close();
  });
