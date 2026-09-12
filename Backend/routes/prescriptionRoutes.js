import express from 'express';
import {
  createPrescription,
  getPrescriptions,
  getPrescriptionsByPatient
} from '../controllers/prescriptionController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Routes using JWT Authentication
router.post('/', protect, createPrescription);
router.get('/', protect, getPrescriptions);
router.get('/patient/:patientId', protect, getPrescriptionsByPatient);

export default router;
