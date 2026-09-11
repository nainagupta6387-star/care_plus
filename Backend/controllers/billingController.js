import Billing from '../models/Billing.js';

export const memoryInvoices = [
  {
    _id: 'mem-inv-9021',
    invoiceId: 'INV-9021',
    patientName: 'Alexander Wright',
    patientId: 'PT-9801',
    patientEmail: 'patient@careplus-hms.com',
    description: 'Cardiology Consultation & ECG Diagnostic',
    amount: 185.00,
    status: 'Paid',
    method: 'Credit Card',
    date: '2026-09-06',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-inv-9022',
    invoiceId: 'INV-9022',
    patientName: 'Maria Garcia',
    patientId: 'PT-9822',
    patientEmail: 'maria@careplus-hms.com',
    description: '3T MRI Brain Diagnostic Scan',
    amount: 450.00,
    status: 'Pending',
    method: 'Insurance Claim Pending',
    date: '2026-09-06',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-inv-9023',
    invoiceId: 'INV-9023',
    patientName: 'David Thorne',
    patientId: 'PT-9840',
    patientEmail: 'david@careplus-hms.com',
    description: 'Pediatric OPD Consultation & Prescription',
    amount: 120.00,
    status: 'Paid',
    method: 'Cash / Reception',
    date: '2026-09-05',
    createdAt: new Date().toISOString()
  }
];

// @desc    Get all billing invoices
// @route   GET /api/billing
// @access  Private (Receptionist / Admin / Patient)
export const getAllInvoices = async (req, res, next) => {
  try {
    let dbInvoices = [];
    try {
      dbInvoices = await Billing.find().sort({ createdAt: -1 });
    } catch (err) {}

    const combinedMap = new Map();
    [...dbInvoices, ...memoryInvoices].forEach(inv => {
      const key = inv._id ? inv._id.toString() : inv.invoiceId;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, inv);
      }
    });

    const finalInvoices = Array.from(combinedMap.values());
    return res.json({
      success: true,
      invoices: finalInvoices
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new invoice
// @route   POST /api/billing
// @access  Private (Receptionist / Admin)
export const createInvoice = async (req, res, next) => {
  try {
    const { patientName, patientId, patientEmail, description, amount, status, method } = req.body;

    const invId = 'INV-' + Math.floor(9000 + Math.random() * 1000);
    const today = new Date().toISOString().split('T')[0];

    try {
      const invoice = await Billing.create({
        invoiceId: invId,
        patientName,
        patientId: patientId || 'PT-9801',
        patientEmail: patientEmail || 'patient@careplus-hms.com',
        description,
        amount: parseFloat(amount) || 100.00,
        status: status || 'Pending',
        method: method || 'Cash / Reception',
        date: today
      });

      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully',
        invoice
      });
    } catch (dbErr) {
      const newMemInv = {
        _id: 'mem-inv-' + Math.floor(1000 + Math.random() * 9000),
        invoiceId: invId,
        patientName,
        patientId: patientId || 'PT-9801',
        patientEmail: patientEmail || 'patient@careplus-hms.com',
        description,
        amount: parseFloat(amount) || 100.00,
        status: status || 'Pending',
        method: method || 'Cash / Reception',
        date: today,
        createdAt: new Date().toISOString()
      };
      memoryInvoices.unshift(newMemInv);

      return res.status(201).json({
        success: true,
        message: 'Invoice created successfully (Memory)',
        invoice: newMemInv
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Update invoice payment status
// @route   PUT /api/billing/:id/status
// @access  Private (Receptionist / Admin)
export const updateInvoiceStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, method } = req.body;

    try {
      const invoice = await Billing.findById(id);
      if (invoice) {
        if (status) invoice.status = status;
        if (method) invoice.method = method;
        const updated = await invoice.save();
        return res.json({
          success: true,
          message: 'Invoice payment status updated successfully',
          invoice: updated
        });
      }
    } catch (dbErr) {}

    const index = memoryInvoices.findIndex(i => i._id === id || i.invoiceId === id || i.id === id);
    if (index !== -1) {
      if (status) memoryInvoices[index].status = status;
      if (method) memoryInvoices[index].method = method;

      return res.json({
        success: true,
        message: 'Invoice payment status updated successfully',
        invoice: memoryInvoices[index]
      });
    }

    return res.status(404).json({ success: false, message: 'Invoice not found' });
  } catch (error) {
    next(error);
  }
};
