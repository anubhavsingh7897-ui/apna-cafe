const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
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
      phone: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: true,
        validate: {
          isEmail: true
        }
      },
      role: {
        type: DataTypes.ENUM('admin', 'waiter', 'cashier', 'kitchen'),
        allowNull: false
      },
      password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false
      },
      is_active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
      }
    },
    {
      tableName: 'Users',
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          name: 'users_phone_unique',
          unique: true,
          fields: ['phone']
        },
        {
          name: 'users_email_unique',
          unique: true,
          fields: ['email']
        }
      ]
    }
  );

  User.associate = (models) => {
    User.hasMany(models.Order, {
      foreignKey: 'waiter_id',
      as: 'orders'
    });
  };

  return User;
};
