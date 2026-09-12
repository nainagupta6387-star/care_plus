import mongoose from 'mongoose';

const prescriptionSchema = new mongoose.Schema(
  {
    rxNumber: {
      type: String,
      required: true,
      unique: true,
      default: () => 'RX-' + Math.floor(1000 + Math.random() * 9000),
    },
    appointmentId: {
      type: String,
      required: false,
    },
    tokenNumber: {
      type: String,
      required: false,
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: false,
    },
    patientId: {
      type: String,
      required: true,
      default: 'PT-9801',
    },
    patientName: {
      type: String,
      required: true,
    },
    patientEmail: {
      type: String,
      required: false,
      default: '',
    },
    doctor: {
      type: String,
      required: true,
    },
    doctorEmail: {
      type: String,
      required: false,
      default: '',
    },
    department: {
      type: String,
      required: false,
      default: 'General Medicine',
    },
    date: {
      type: String,
      required: true,
      default: () => new Date().toISOString().split('T')[0],
    },
    medications: [
      {
        name: { type: String, required: true },
        dosage: { type: String, required: true },
        frequency: { type: String, default: '1 Tablet once daily' },
        duration: { type: String, default: '30 Days' },
      }
    ],
    diagnosis: {
      type: String,
      default: '',
    },
    notes: {
      type: String,
      default: '',
    },
    vitals: {
      bloodPressure: { type: String, default: '120 / 80 mmHg' },
      heartRate: { type: String, default: '72 BPM' },
      spo2: { type: String, default: '99% SpO2' },
      temperature: { type: String, default: '98.6 °F' },
    },
    status: {
      type: String,
      enum: ['Active', 'Dispensed', 'Completed', 'Cancelled'],
      default: 'Active',
    },
  },
  {
    timestamps: true,
  }
);

const Prescription = mongoose.models.Prescription || mongoose.model('Prescription', prescriptionSchema);

export default Prescription;
