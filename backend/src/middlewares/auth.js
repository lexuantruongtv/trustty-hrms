const jwt = require('jsonwebtoken');
const jwtConfig = require('../config/jwt');

/**
 * Verify JWT token from Authorization header
 */
const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'Không có token xác thực' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, jwtConfig.secret);
    req.user = decoded;
    next();
  } catch {
    return res.status(401).json({ success: false, message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
};

/**
 * Authorize by roles
 * @param {...string} roles - allowed roles
 */
const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.PhanQuyen)) {
    return res.status(403).json({ success: false, message: 'Bạn không có quyền truy cập' });
  }
  next();
};

module.exports = { authenticate, authorize };
