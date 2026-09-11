import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const patientSchema = new mongoose.Schema(
  {
    patientId: {
      type: String,
      unique: true,
      default: () => 'PT-' + Math.floor(1000 + Math.random() * 9000),
    },
    name: {
      type: String,
      required: [true, 'Please provide patient full name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please provide email address'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 6,
    },
    phone: {
      type: String,
      required: [true, 'Please provide contact phone number'],
    },
    role: {
      type: String,
      default: 'patient',
    },
    age: {
      type: Number,
      default: 30,
    },
    gender: {
      type: String,
      default: 'Not Specified',
    },
    bloodType: {
      type: String,
      default: 'O+',
    },
    allergies: {
      type: [String],
      default: [],
    },
    emergencyContact: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Method to match password
patientSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Pre-save hook to hash password before saving to DB
patientSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

const Patient = mongoose.models.Patient || mongoose.model('Patient', patientSchema);

export default Patient;
