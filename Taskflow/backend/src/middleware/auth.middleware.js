const { verifyToken } = require('../utils/jwt');
const authService = require('../services/auth.service');

/**
 * Authentication middleware to verify JWT and attach user to req.user
 */
const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Missing or malformed token.',
        errors: []
      });
    }

    const token = authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication required. Token not provided.',
        errors: []
      });
    }

    let decoded;
    try {
      decoded = verifyToken(token);
    } catch (err) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token.',
        errors: []
      });
    }

    // Verify user still exists in storage
    const user = await authService.findUserById(decoded.id);
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User no longer exists.',
        errors: []
      });
    }

    // Exclude password hash from req.user
    const { password: _, ...safeUser } = user;
    req.user = safeUser;
    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication.',
      errors: []
    });
  }
};

module.exports = {
  authenticate
};
