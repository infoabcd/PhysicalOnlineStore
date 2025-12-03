const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const Commodity = sequelize.define('Commodity', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    title: {
        type: DataTypes.STRING(255),
        allowNull: false
    },
    description: {
        type: DataTypes.TEXT
    },
    price: {                                    // 出售价格
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
    },
    shipping_fee: {                              // 邮费
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true
    },
    original_price: {                           // 进货价格
        type: DataTypes.DECIMAL(10, 2)
    },
    promotion_price: {                          // 促销价格
        type: DataTypes.DECIMAL(10, 2)
    },
    is_on_promotion: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
    },
    discount_amount: {
        type: DataTypes.DECIMAL(10, 2)
    },
    stock: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0
    },
    image_urls: {
        type: DataTypes.TEXT,
        allowNull: true,
        get() {
            const rawValue = this.getDataValue('image_urls');
            if (!rawValue) {
                return [];
            }

            if (Array.isArray(rawValue)) {
                return rawValue;
            }

            if (typeof rawValue === 'string') {
                const trimmed = rawValue.trim();
                if (!trimmed) {
                    return [];
                }

                if (trimmed.startsWith('[') || trimmed.startsWith('{')) {
                    try {
                        const parsed = JSON.parse(trimmed);
                        if (Array.isArray(parsed)) {
                            return parsed;
                        }
                        return parsed && parsed.urls ? parsed.urls : [];
                    } catch (err) {
                        // fall through to manual parsing below
                    }
                }

                const segments = trimmed
                    .replace(/^[\[\(\{]+|[\]\)\}]+$/g, '')
                    .split(',')
                    .map(item => item.trim().replace(/^['"]|['"]$/g, ''))
                    .filter(Boolean);

                return segments;
            }

            return [];
        },
        set(value) {
            if (!value) {
                this.setDataValue('image_urls', null);
                return;
            }

            if (typeof value === 'string') {
                this.setDataValue('image_urls', value);
            } else if (Array.isArray(value)) {
                this.setDataValue('image_urls', JSON.stringify(value));
            } else {
                this.setDataValue('image_urls', JSON.stringify(value));
            }
        }
    },
    created_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    updated_at: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        onUpdate: DataTypes.NOW
    }
    }, {
    tableName: 'commodities',
    createdAt: 'created_at',
    updatedAt: 'updated_at'
    });

    Commodity.associate = function(models) {
    Commodity.belongsToMany(models.Category, {
        through: 'commodity_categories',
        foreignKey: 'commodity_id',
        otherKey: 'category_id',
        as: 'categories',
        timestamps: false
    });
    
};

module.exports = Commodity;