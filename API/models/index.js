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

const shouldSync = process.env.DB_AUTO_SYNC !== 'false';

if (shouldSync) {
  const syncOptions = {};

  if (process.env.DB_SYNC_FORCE === 'true') {
    syncOptions.force = true;
  } else if (process.env.DB_SYNC_ALTER === 'true') {
    syncOptions.alter = true;
  }

  sequelize
    .sync(syncOptions)
    .then(() => {
      console.log('数据库结构已同步');
    })
    .catch((error) => {
      console.error('数据库结构同步失败:', error);
    });
}

db.User = User;

module.exports = db;