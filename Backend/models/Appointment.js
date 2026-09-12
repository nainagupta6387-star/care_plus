import mongoose from 'mongoose';

const appointmentSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      required: false,
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
      required: true,
    },
    doctor: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    timeSlot: {
      type: String,
      required: true,
    },
    tokenNumber: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Confirmed', 'Waiting', 'In Consultation', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Upcoming',
    },
    priority: {
      type: String,
      enum: ['Routine', 'Normal', 'High', 'Emergency'],
      default: 'Normal',
    },
    age: {
      type: Number,
      default: 34,
    },
    gender: {
      type: String,
      default: 'Male',
    },
    vitals: {
      bloodPressure: { type: String, default: '120 / 80 mmHg' },
      heartRate: { type: String, default: '72 BPM' },
      spo2: { type: String, default: '99% SpO2' },
      temperature: { type: String, default: '98.6 °F' },
    },
    type: {
      type: String,
      default: 'OPD Consultation',
    },
    reason: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const Appointment = mongoose.models.Appointment || mongoose.model('Appointment', appointmentSchema);

export default Appointment;
