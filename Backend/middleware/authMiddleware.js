import jwt from 'jsonwebtoken';

// In-Memory store fallback reference
import { memoryPatients } from '../controllers/patientController.js';
import Patient from '../models/Patient.js';

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'careplus_hms_super_secret_jwt_key_2026'
      );

      // Check Mongoose DB first, or Fallback to Memory Store
      try {
        req.user = await Patient.findById(decoded.id).select('-password');
      } catch (err) {
        req.user = memoryPatients.find((p) => p._id === decoded.id);
      }

      if (!req.user && memoryPatients) {
        req.user = memoryPatients.find((p) => p._id === decoded.id);
      }

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized, patient record not found',
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized, token invalid or expired',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized, no token provided in request header',
    });
  }
};

// Role Authorization Middleware
export const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Role (${req.user?.role || 'Guest'}) is not authorized to access this resource`,
      });
    }
    next();
  };
};
