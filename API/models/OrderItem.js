const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const OrderItem = sequelize.define('OrderItem', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  commodity_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  title_snapshot: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  unit_price: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  line_total: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  }
}, {
  tableName: 'order_items',
  timestamps: false
});

OrderItem.associate = function(models) {
  OrderItem.belongsTo(models.Order, {
    foreignKey: 'order_id',
    as: 'order',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
  OrderItem.belongsTo(models.Commodity, {
    foreignKey: 'commodity_id',
    as: 'commodity',
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE'
  });
};

module.exports = OrderItem;
