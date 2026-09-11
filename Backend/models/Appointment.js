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
      enum: ['Upcoming', 'Confirmed', 'In Consultation', 'Completed', 'Rescheduled', 'Cancelled'],
      default: 'Upcoming',
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

const Appointment = mongoose.model('Appointment', appointmentSchema);

export default Appointment;
