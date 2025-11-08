const { Sequelize, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

// 模型文件
const Category = require('./Category');
const Commodity = require('./Commodity');
const User = require('./User');
const Order = require('./Order');
const OrderItem = require('./OrderItem');

const db = {};

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Category = Category;
db.Commodity = Commodity;
db.Order = Order;
db.OrderItem = OrderItem;

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {

    db[modelName].associate(db);
  }
});

db.User = User;

module.exports = db;