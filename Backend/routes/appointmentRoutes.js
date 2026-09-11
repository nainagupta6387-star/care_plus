import express from 'express';
import {
  createAppointment,
  getMyAppointments,
  getAllAppointments,
  updateAppointmentStatus
} from '../controllers/appointmentController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Routes using JWT Authentication
router.post('/', protect, createAppointment);
router.get('/my-appointments', protect, getMyAppointments);
router.get('/all', protect, getAllAppointments);
router.put('/:id/status', protect, updateAppointmentStatus);

export default router;
