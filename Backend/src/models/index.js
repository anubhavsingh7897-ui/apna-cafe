const sequelize = require('../config/database');

const models = {
  User: require('./User')(sequelize),
  Table: require('./Table')(sequelize),
  Item: require('./Item')(sequelize),
  Ingredient: require('./Ingredient')(sequelize),
  ItemIngredient: require('./ItemIngredient')(sequelize),
  Order: require('./Order')(sequelize),
  OrderItem: require('./OrderItem')(sequelize),
  Payment: require('./Payment')(sequelize),
  Config: require('./Config')(sequelize)
};

Object.values(models).forEach((model) => {
  if (typeof model.associate === 'function') {
    model.associate(models);
  }
});

module.exports = {
  sequelize,
  ...models
};
