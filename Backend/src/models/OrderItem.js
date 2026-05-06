const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OrderItem = sequelize.define(
    'OrderItem',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      order_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      item_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      quantity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      price: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      subtotal: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('ordered', 'preparing', 'ready', 'served'),
        allowNull: false,
        defaultValue: 'ordered'
      }
    },
    {
      tableName: 'OrderItems',
      timestamps: false
    }
  );

  OrderItem.associate = (models) => {
    OrderItem.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });

    OrderItem.belongsTo(models.Item, {
      foreignKey: 'item_id',
      as: 'item'
    });
  };

  return OrderItem;
};
