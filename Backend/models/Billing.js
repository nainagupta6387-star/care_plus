import mongoose from 'mongoose';

const billingSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: String,
      required: true,
    },
    patientId: {
      type: String,
      default: 'PT-9801',
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      default: 'patient@careplus-hms.com',
    },
    description: {
      type: String,
      required: true,
    },
    amount: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ['Paid', 'Pending', 'Insurance Claim Pending', 'Insurance Claimed'],
      default: 'Pending',
    },
    method: {
      type: String,
      default: 'Cash / Reception',
    },
    date: {
      type: String,
      default: () => new Date().toISOString().split('T')[0],
    },
  },
  {
    timestamps: true,
  }
);

const Billing = mongoose.model('Billing', billingSchema);

export default Billing;
