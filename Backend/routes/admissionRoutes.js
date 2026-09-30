import express from 'express';
import { protect, authorizeRoles } from '../middleware/authMiddleware.js';
import {
  assignIcuBed,
  createAdmission,
  getAdmissionsList,
  getIcuBeds,
  updateAdmissionStatus,
  updateIcuStatus,
} from '../controllers/admissionController.js';

const router = express.Router();
const staffAccess = authorizeRoles('receptionist', 'doctor', 'admin');
const intakeAccess = authorizeRoles('receptionist', 'admin');

router.use(protect, staffAccess);
router.get('/', getAdmissionsList);
router.get('/icu-beds', getIcuBeds);
router.post('/', intakeAccess, createAdmission);
router.put('/:id/status', updateAdmissionStatus);
router.put('/:id/icu-bed', assignIcuBed);
router.put('/:id/icu-status', updateIcuStatus);

export default router;