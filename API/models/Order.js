const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Order = sequelize.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  order_no: {
    type: DataTypes.STRING(32),
    unique: true,
    allowNull: false
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  country: {
    type: DataTypes.STRING(64),
    allowNull: false
  },
  region: {
    type: DataTypes.STRING(128),
    allowNull: false
  },
  address1: {
    type: DataTypes.STRING(255),
    allowNull: false
  },
  address2: {
    type: DataTypes.STRING(255)
  },
  postal_code: {
    type: DataTypes.STRING(32)
  },
  phone: {
    type: DataTypes.STRING(64)
  },
  currency: {
    type: DataTypes.STRING(8),
    allowNull: false,
    defaultValue: 'USD'
  },
  total_amount: {
    type: DataTypes.DECIMAL(10, 2),
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('PENDING','PAID','FULFILLING','SHIPPED','COMPLETED','CANCELED'),
    allowNull: false,
    defaultValue: 'PENDING'
  },
  paypal_order_id: {
    type: DataTypes.STRING(64)
  },
  paypal_capture_id: {
    type: DataTypes.STRING(64)
  }
}, {
  tableName: 'orders',
  createdAt: 'created_at',
  updatedAt: 'updated_at'
});

// 确保 order_no 总是有值（防止数据库 NOT NULL 报错）
Order.beforeCreate(async (order, options) => {
  if (!order.order_no) {
    const now = new Date();
    const y = now.getFullYear();
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const hh = String(now.getHours()).padStart(2, '0');
    const mm = String(now.getMinutes()).padStart(2, '0');
    const ss = String(now.getSeconds()).padStart(2, '0');
    const rand = String(Math.floor(Math.random() * 1000000)).padStart(6, '0');
    order.order_no = `${y}${m}${d}${hh}${mm}${ss}-${rand}`;
  }
});

Order.associate = function(models) {
  Order.hasMany(models.OrderItem, {
    foreignKey: 'order_id',
    as: 'items',
    onDelete: 'CASCADE'
  });
};

module.exports = Order;
