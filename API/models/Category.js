const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Category = sequelize.define(
  'Category',
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
    },
  },
  {
    tableName: 'categories',
    timestamps: false,
  },
);

Category.associate = function associate(models) {
  Category.belongsToMany(models.Commodity, {
    through: 'commodity_categories',
    foreignKey: 'category_id',
    otherKey: 'commodity_id',
    as: 'commodities',
    timestamps: false,
  });
};

module.exports = Category;
