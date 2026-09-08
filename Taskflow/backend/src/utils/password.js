const bcrypt = require('bcrypt');

const SALT_ROUNDS = 10;

/**
 * Hash a plain text password
 * @param {string} password - Raw password
 * @returns {Promise<string>} Hashed password string
 */
const hashPassword = async (password) => {
  return bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Compare plain text password with stored hash
 * @param {string} password - Raw password
 * @param {string} hash - Hashed password
 * @returns {Promise<boolean>} Match result
 */
const comparePassword = async (password, hash) => {
  return bcrypt.compare(password, hash);
};

module.exports = {
  hashPassword,
  comparePassword
};
