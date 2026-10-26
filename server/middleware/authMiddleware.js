// ========================================================
// CampusHub 3.0 - Authentication & Role Middlewares
// Protects endpoints and strictly enforces Student vs Admin roles.
// ========================================================

function requireAuth(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Authentication required. Please log in to continue.'
    });
  }
  next();
}

function requireStudent(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Please log in with a student account.'
    });
  }
  if (req.session.user.role !== 'student') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. This action requires a Student account.'
    });
  }
  next();
}

function requireAdmin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.status(401).json({
      success: false,
      message: 'Administrator login required.'
    });
  }
  if (req.session.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
      message: 'Access forbidden. Administrator privileges are required.'
    });
  }
  next();
}

module.exports = {
  requireAuth,
  requireStudent,
  requireAdmin
};
