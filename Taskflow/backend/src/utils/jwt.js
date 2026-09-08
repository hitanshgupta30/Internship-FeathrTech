const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET || 'taskflow_dev_secret_key_123';
const JWT_EXPIRES_IN = '7d';

/**
 * Sign a new JWT token for a user
 * @param {object} payload - Data to embed in token (e.g. { id, email, name })
 * @returns {string} Signed JWT token
 */
const signToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
};

/**
 * Verify an existing JWT token
 * @param {string} token - JWT token string
 * @returns {object} Decoded payload
 */
const verifyToken = (token) => {
  return jwt.verify(token, JWT_SECRET);
};

module.exports = {
  signToken,
  verifyToken
};
