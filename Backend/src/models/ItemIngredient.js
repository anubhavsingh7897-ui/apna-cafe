const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const ItemIngredient = sequelize.define(
    'ItemIngredient',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      item_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      ingredient_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      quantity_required: {
        type: DataTypes.DECIMAL(12, 3),
        allowNull: false
      }
    },
    {
      tableName: 'ItemIngredients',
      timestamps: false,
      indexes: [
        {
          name: 'item_ingredients_item_id_ingredient_id_unique',
          unique: true,
          fields: ['item_id', 'ingredient_id']
        }
      ]
    }
  );

  ItemIngredient.associate = (models) => {
    ItemIngredient.belongsTo(models.Item, {
      foreignKey: 'item_id',
      as: 'item'
    });

    ItemIngredient.belongsTo(models.Ingredient, {
      foreignKey: 'ingredient_id',
      as: 'ingredient'
    });
  };

  return ItemIngredient;
};
