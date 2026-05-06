const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Table = sequelize.define(
    'Table',
    {
      id: {
        type: DataTypes.INTEGER.UNSIGNED,
        primaryKey: true,
        autoIncrement: true
      },
      table_number: {
        type: DataTypes.STRING(20),
        allowNull: false
      },
      status: {
        type: DataTypes.ENUM('free', 'occupied', 'billing'),
        allowNull: false,
        defaultValue: 'free'
      },
      capacity: {
        type: DataTypes.INTEGER.UNSIGNED,
        allowNull: false
      }
    },
    {
      tableName: 'Tables',
      createdAt: 'created_at',
      updatedAt: false,
      indexes: [
        {
          name: 'tables_table_number_unique',
          unique: true,
          fields: ['table_number']
        }
      ]
    }
  );

  Table.associate = (models) => {
    Table.hasMany(models.Order, {
      foreignKey: 'table_id',
      as: 'orders'
    });
  };

  return Table;
};
