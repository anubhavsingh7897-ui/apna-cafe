const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Payment = sequelize.define(
    'Payment',
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
      amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      payment_method: {
        type: DataTypes.ENUM('cash', 'UPI', 'card'),
        allowNull: false
      },
      payment_status: {
        type: DataTypes.ENUM('pending', 'completed'),
        allowNull: false,
        defaultValue: 'pending'
      },
      paid_at: {
        type: DataTypes.DATE,
        allowNull: true
      }
    },
    {
      tableName: 'Payments',
      timestamps: false,
      indexes: [
        {
          name: 'payments_order_id_unique',
          unique: true,
          fields: ['order_id']
        }
      ]
    }
  );

  Payment.associate = (models) => {
    Payment.belongsTo(models.Order, {
      foreignKey: 'order_id',
      as: 'order'
    });
  };

  return Payment;
};
