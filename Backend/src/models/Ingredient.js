const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Ingredient = sequelize.define(
    'Ingredient',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(120),
        allowNull: false
      },
      unit: {
        type: DataTypes.STRING(30),
        allowNull: false
      },
      stock_quantity: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0
      },
      min_stock_level: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'Ingredients',
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          name: 'ingredients_name_unique',
          unique: true,
          fields: ['name']
        }
      ]
    }
  );

  Ingredient.associate = (models) => {
    Ingredient.belongsToMany(models.Item, {
      through: models.ItemIngredient,
      foreignKey: 'ingredient_id',
      otherKey: 'item_id',
      as: 'items'
    });

    Ingredient.hasMany(models.ItemIngredient, {
      foreignKey: 'ingredient_id',
      as: 'item_ingredients'
    });
  };

  return Ingredient;
};
