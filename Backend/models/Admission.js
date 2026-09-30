import mongoose from 'mongoose';

const admissionSchema = new mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Patient',
      default: undefined,
    },
    patientName: { type: String, required: true, trim: true },
    unknownPatient: { type: Boolean, default: false },
    age: { type: Number, min: 0, max: 120, default: undefined },
    gender: { type: String, default: '' },
    contactNumber: { type: String, default: '' },
    emergencyType: {
      type: String,
      enum: ['Accident', 'Critical Emergency', 'Other Emergency'],
      required: true,
    },
    emergencyDescription: { type: String, required: true, trim: true },
    arrivalAt: { type: Date, required: true },
    priority: {
      type: String,
      enum: ['Emergency', 'High', 'Normal'],
      required: true,
    },
    vitals: {
      bloodPressure: { type: String, default: '' },
      heartRate: { type: String, default: '' },
      temperature: { type: String, default: '' },
      spo2: { type: String, default: '' },
    },
    icuRequired: { type: Boolean, default: false },
    doctorId: { type: String, required: true },
    doctorName: { type: String, required: true },
    doctorEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['Waiting', 'Under Treatment', 'Stabilized', 'ICU', 'Admitted', 'Completed'],
      default: 'Waiting',
    },
    icuBed: { type: String, default: undefined },
    icuAdmissionTime: { type: Date, default: undefined },
    icuStatus: {
      type: String,
      enum: ['Not Assigned', 'Reserved', 'Occupied', 'Released'],
      default: 'Not Assigned',
    },
  },
  { timestamps: true }
);

admissionSchema.index({ icuBed:  1 }, { unique: true, sparse: true });

const Admission = mongoose.models.Admission || mongoose.model('Admission', admissionSchema);

export default Admission;