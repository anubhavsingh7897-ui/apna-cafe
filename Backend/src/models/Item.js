const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Item = sequelize.define(
    'Item',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false
      },
      category: {
        type: DataTypes.STRING(80),
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      image_url: {
        type: DataTypes.STRING(500),
        allowNull: true
      },
      is_available: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      },
      manual_override: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
      }
    },
    {
      tableName: 'Items',
      createdAt: 'created_at',
      updatedAt: false
    }
  );

  Item.associate = (models) => {
    Item.belongsToMany(models.Ingredient, {
      through: models.ItemIngredient,
      foreignKey: 'item_id',
      otherKey: 'ingredient_id',
      as: 'ingredients'
    });

    Item.hasMany(models.ItemIngredient, {
      foreignKey: 'item_id',
      as: 'item_ingredients'
    });

    Item.hasMany(models.OrderItem, {
      foreignKey: 'item_id',
      as: 'order_items'
    });
  };

  return Item;
};
