const { Sequelize } = require('sequelize');
const configs = require('./config');

const env = process.env.NODE_ENV || 'development';
const dbConfig = configs[env];

if (!dbConfig) {
    throw new Error(`未找到针对环境 "${env}" 的数据库配置，请检查 config/config.js`);
}

const { database, username, password, ...rest } = dbConfig;

const sequelize = new Sequelize(database, username, password, rest);

(async () => {
    try {
        await sequelize.authenticate();
        console.log('数据库连接成功');
    } catch (error) {
        console.error('数据库连接失败:', error);
    }
})();

module.exports = sequelize;
