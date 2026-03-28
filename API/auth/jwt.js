const jwt = require('jsonwebtoken');

const secret = process.env.JWT_SECRET || 'dev-jwt-secret-change-me';

function generateToken(payload) {
  return jwt.sign(payload, secret, { expiresIn: '24h' });
}

function verifyToken(token) {
  return jwt.verify(token, secret);
}

module.exports = { generateToken, verifyToken };
