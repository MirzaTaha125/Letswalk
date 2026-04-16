const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Middleware to protect admin routes.
 * Ensures the request has a valid JWT of an admin user.
 */
const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    // Set token from Bearer token in header
    token = req.headers.authorization.split(' ')[1];
  }

  // Make sure token exists
  if (!token) {
    return res.status(401).json({
      error: 'NotAuthorized',
      message: 'Not authorized to access this route',
    });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = await User.findById(decoded.id);

    if (!req.user) {
        return res.status(401).json({
          error: 'NotAuthorized',
          message: 'Not authorized to access this route',
        });
      }

    next();
  } catch (err) {
    return res.status(401).json({
      error: 'NotAuthorized',
      message: 'Not authorized to access this route',
    });
  }
};

/**
 * Middleware to restrict access based on user role.
 */
const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        error: 'NotAuthorized',
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};

module.exports = { protect, authorize };
