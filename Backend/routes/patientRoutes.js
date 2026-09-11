import express from 'express';
import {
  registerPatient,
  loginPatient,
  logoutPatient,
  getPatientProfile,
  updatePatientProfile,
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.post('/logout', logoutPatient);

// Protected Patient Routes (Requires JWT token & 'patient' role)
router.get('/profile', protect, authorizeRoles('patient'), getPatientProfile);
router.put('/profile', protect, authorizeRoles('patient'), updatePatientProfile);

export default router;
