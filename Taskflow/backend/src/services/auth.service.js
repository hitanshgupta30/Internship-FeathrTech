const { hashPassword, comparePassword } = require('../utils/password');
const { signToken } = require('../utils/jwt');
const db = require('../config/db');

/**
 * IN-MEMORY USER STORE (Fallback / Testing)
 */
let users = [];

/**
 * Reset store (used for test isolation)
 */
const resetStore = () => {
  users = [];
};

/**
 * Find user by ID
 * @param {string} id
 */
const findUserById = async (id) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const res = await db.query(
        'SELECT id, name, email, created_at AS "createdAt" FROM users WHERE id = $1',
        [id]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error('Error finding user by ID in Neon DB:', err.message);
    }
  }

  const u = users.find((u) => u.id === id);
  if (!u) return null;
  const { password: _, ...safeUser } = u;
  return safeUser;
};

/**
 * Find user by email (internal method, returns password hash for login verification)
 * @param {string} email
 */
const findUserByEmail = async (email) => {
  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const res = await db.query(
        'SELECT id, name, email, password, created_at AS "createdAt" FROM users WHERE LOWER(email) = LOWER($1)',
        [email.trim()]
      );
      return res.rows[0] || null;
    } catch (err) {
      console.error('Error finding user by email in Neon DB:', err.message);
    }
  }

  return users.find((u) => u.email.toLowerCase() === email.toLowerCase()) || null;
};

/**
 * Register a new user
 * @param {object} param0 { name, email, password }
 */
const signup = async ({ name, email, password }) => {
  const existingUser = await findUserByEmail(email);
  if (existingUser) {
    const error = new Error('User already exists with this email address.');
    error.statusCode = 409;
    throw error;
  }

  const hashedPassword = await hashPassword(password);
  const newId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

  if (db.isDatabaseConfigured() && db.pool) {
    try {
      const res = await db.query(
        `INSERT INTO users (id, name, email, password, created_at)
         VALUES ($1, $2, $3, $4, NOW())
         RETURNING id, name, email, created_at AS "createdAt"`,
        [newId, name.trim(), email.toLowerCase().trim(), hashedPassword]
      );
      return res.rows[0];
    } catch (err) {
      console.error('Error inserting user in Neon DB:', err.message);
      if (err.code === '23505') {
        const error = new Error('User already exists with this email address.');
        error.statusCode = 409;
        throw error;
      }
      throw err;
    }
  }

  const newUser = {
    id: newId,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  users.push(newUser);

  const { password: _, ...safeUser } = newUser;
  return safeUser;
};

/**
 * Authenticate user and return token + safe profile
 * @param {object} param0 { email, password }
 */
const login = async ({ email, password }) => {
  const user = await findUserByEmail(email);
  if (!user) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const isMatch = await comparePassword(password, user.password);
  if (!isMatch) {
    const error = new Error('Invalid email or password.');
    error.statusCode = 401;
    throw error;
  }

  const { password: _, ...safeUser } = user;
  const token = signToken({
    id: safeUser.id,
    email: safeUser.email,
    name: safeUser.name
  });

  return {
    token,
    user: safeUser
  };
};

module.exports = {
  findUserById,
  findUserByEmail,
  signup,
  login,
  resetStore
};
