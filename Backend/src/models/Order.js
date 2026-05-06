const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Order = sequelize.define(
    'Order',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      table_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      waiter_id: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('new', 'preparing', 'ready', 'served', 'paid'),
        allowNull: false,
        defaultValue: 'new'
      },
      total_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0
      }
    },
    {
      tableName: 'Orders',
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  );

  Order.associate = (models) => {
    Order.belongsTo(models.Table, {
      foreignKey: 'table_id',
      as: 'table'
    });

    Order.belongsTo(models.User, {
      foreignKey: 'waiter_id',
      as: 'waiter'
    });

    Order.hasMany(models.OrderItem, {
      foreignKey: 'order_id',
      as: 'items'
    });

    Order.hasOne(models.Payment, {
      foreignKey: 'order_id',
      as: 'payment'
    });
  };

  return Order;
};
