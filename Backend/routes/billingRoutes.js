import express from 'express';
import {
  getAllInvoices,
  createInvoice,
  updateInvoiceStatus
} from '../controllers/billingController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

// Protected Billing Routes using JWT Authentication
router.get('/', protect, getAllInvoices);
router.post('/', protect, createInvoice);
router.put('/:id/status', protect, updateInvoiceStatus);

export default router;
