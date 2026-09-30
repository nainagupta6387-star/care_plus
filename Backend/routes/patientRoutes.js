import express from 'express';
import {
  registerPatient,
  loginPatient,
  logoutPatient,
  getPatientProfile,
  updatePatientProfile,
  getDoctors,
} from '../controllers/patientController.js';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Routes
router.post('/register', registerPatient);
router.post('/login', loginPatient);
router.post('/logout', logoutPatient);
router.get('/doctors', protect, authorizeRoles('receptionist', 'doctor', 'admin'), getDoctors);

// Protected Profile Routes (Requires JWT token for any authorized role)
router.get('/profile', protect, getPatientProfile);
router.put('/profile', protect, updatePatientProfile);

export default router;
