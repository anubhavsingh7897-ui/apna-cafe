const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Config', {
    key: {
      type: DataTypes.STRING,
      allowNull: false
    },
    value: {
      type: DataTypes.TEXT,
      allowNull: false
    }
  }, {
    timestamps: true,
    indexes: [
      {
        name: 'config_key_unique',
        unique: true,
        fields: ['key']
      }
    ]
  });
};
