require('dotenv').config();

const resolveLogging = () => {
  if (process.env.DB_LOGGING === 'true') {
    return console.log;
  }
  if (process.env.DB_LOGGING === 'sql') {
    return (msg) => console.log(msg);
  }
  return false;
};

const buildConfig = (overrides = {}) => {
  const config = {
    username: process.env.DB_USERNAME || process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '123456',
    database: process.env.DB_NAME || 'test',
    host: process.env.DB_HOST || 'localhost',
    dialect: process.env.DB_DIALECT || 'mysql',
    logging: resolveLogging(),
  };

  if (process.env.DB_PORT) {
    const port = Number(process.env.DB_PORT);
    if (!Number.isNaN(port)) {
      config.port = port;
    }
  }

  if (process.env.DB_TIMEZONE) {
    config.timezone = process.env.DB_TIMEZONE;
  }

  return {
    ...config,
    ...overrides,
  };
};

module.exports = {
  development: buildConfig(),
  test: buildConfig({
    database: process.env.DB_TEST_NAME || process.env.DB_NAME || 'test',
  }),
  production: buildConfig(),
};
