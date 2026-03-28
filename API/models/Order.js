const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define(
  'Order',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_no: {
      type: DataTypes.STRING(64),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    country: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    region: {
      type: DataTypes.STRING(128),
      allowNull: false,
    },
    address1: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    address2: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    postal_code: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    phone: {
      type: DataTypes.STRING(64),
      allowNull: false,
    },
    currency: {
      type: DataTypes.STRING(8),
      defaultValue: 'USD',
    },
    total_amount: {
      type: DataTypes.STRING(32),
      allowNull: false,
    },
    status: {
      type: DataTypes.STRING(32),
      allowNull: false,
      defaultValue: 'PENDING',
    },
    paypal_order_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    paypal_capture_id: {
      type: DataTypes.STRING(128),
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    tableName: 'orders',
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  },
);

Order.associate = function associate(models) {
  Order.hasMany(models.OrderItem, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE',
    hooks: true,
  });
};

module.exports = Order;
