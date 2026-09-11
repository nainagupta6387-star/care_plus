import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import Patient from '../models/Patient.js';

// Pre-seeded Memory Patients Store for fallback
// Pre-seeded Memory Patients Store for fallback
export const memoryPatients = [
  {
    _id: 'mem-pat-9801',
    patientId: 'PT-9801',
    name: 'Alexander Wright',
    email: 'patient@careplus-hms.com',
    passwordHash: bcrypt.hashSync('demo12345', 10),
    phone: '+1 (555) 234-5678',
    role: 'patient',
    age: 34,
    gender: 'Male',
    bloodType: 'O+',
    allergies: ['Penicillin', 'Peanuts'],
    emergencyContact: 'Eleanor Wright (+1 555 987-6543)'
  },
  {
    _id: 'mem-doc-9001',
    patientId: 'DOC-9001',
    name: 'Dr. Sarah Jenkins, MD',
    email: 'dr.jenkins@careplus-hms.com',
    passwordHash: bcrypt.hashSync('demo12345', 10),
    phone: '+1 (555) 345-6789',
    role: 'doctor',
    age: 42,
    gender: 'Female',
    bloodType: 'A+'
  },
  {
    _id: 'mem-rec-4091',
    patientId: 'REC-4091',
    name: 'Sarah Davis',
    email: 'staff@careplus-hms.com',
    passwordHash: bcrypt.hashSync('demo12345', 10),
    phone: '+1 (555) 456-7890',
    role: 'receptionist',
    age: 29,
    gender: 'Female',
    bloodType: 'B+'
  }
];

// Helper: Generate JWT Token
const generateToken = (id, role) => {
  return jwt.sign(
    { id, role },
    process.env.JWT_SECRET || 'careplus_hms_super_secret_jwt_key_2026',
    { expiresIn: '30d' }
  );
};

// @desc    Register a new patient
// @route   POST /api/patient/register
// @access  Public
export const registerPatient = async (req, res, next) => {
  try {
    const { name, email, password, phone, role, age, gender, bloodType } = req.body;

    if (!name || !email || !password || !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, phone',
      });
    }

    const selectedRole = (role && ['patient', 'doctor', 'receptionist'].includes(role.toLowerCase()))
      ? role.toLowerCase()
      : 'patient';

    // Check if user already exists in DB
    try {
      const patientExists = await Patient.findOne({ email: email.toLowerCase() });
      if (patientExists) {
        return res.status(400).json({
          success: false,
          message: 'Account already exists with this email address',
        });
      }

      const patient = await Patient.create({
        name,
        email: email.toLowerCase(),
        password,
        phone,
        role: selectedRole,
        age: age || 30,
        gender: gender || 'Not Specified',
        bloodType: bloodType || 'O+',
      });

      const token = generateToken(patient._id, patient.role);

      return res.status(201).json({
        success: true,
        message: 'Patient registered successfully',
        token,
        patient: {
          id: patient._id,
          patientId: patient.patientId,
          name: patient.name,
          email: patient.email,
          phone: patient.phone,
          role: patient.role,
          age: patient.age,
          gender: patient.gender,
          bloodType: patient.bloodType,
          allergies: patient.allergies,
          emergencyContact: patient.emergencyContact,
        },
      });
    } catch (dbErr) {
      // Memory Store Fallback
      const existingMem = memoryPatients.find(p => p.email === email.toLowerCase());
      if (existingMem) {
        return res.status(400).json({
          success: false,
          message: 'Patient account already exists with this email address',
        });
      }

      const passwordHash = await bcrypt.hash(password, 10);
      const newMem = {
        _id: 'mem-pat-' + Math.floor(1000 + Math.random() * 9000),
        patientId: 'PT-' + Math.floor(1000 + Math.random() * 9000),
        name,
        email: email.toLowerCase(),
        passwordHash,
        phone,
        role: selectedRole,
        age: age || 30,
        gender: gender || 'Male',
        bloodType: bloodType || 'O+',
        allergies: [],
        emergencyContact: ''
      };
      memoryPatients.push(newMem);

      const token = generateToken(newMem._id, newMem.role);

      return res.status(201).json({
        success: true,
        message: 'Patient registered successfully (Local Session)',
        token,
        patient: {
          id: newMem._id,
          patientId: newMem.patientId,
          name: newMem.name,
          email: newMem.email,
          phone: newMem.phone,
          role: newMem.role,
          age: newMem.age,
          gender: newMem.gender,
          bloodType: newMem.bloodType,
          allergies: newMem.allergies,
          emergencyContact: newMem.emergencyContact,
        },
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Authenticate patient & get JWT token
// @route   POST /api/patient/login
// @access  Public
export const loginPatient = async (req, res, next) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please enter email and password',
      });
    }

    const cleanEmail = email.toLowerCase();
    const targetRole = role ? role.toLowerCase() : null;

    const validateRoleAndRespond = (user) => {
      const dbRole = (user.role || 'patient').toLowerCase();

      // Backend Role Verification & Enforcement
      if (targetRole && dbRole !== targetRole) {
        return res.status(401).json({
          success: false,
          message: `Role mismatch: This account is registered as ${dbRole.toUpperCase()}, not ${targetRole.toUpperCase()}. Please select the correct role.`,
        });
      }

      const token = generateToken(user._id || user.id, user.role);
      return res.json({
        success: true,
        message: `Logged in successfully as ${user.role}`,
        token,
        patient: {
          id: user._id || user.id,
          patientId: user.patientId || 'PT-9801',
          name: user.name,
          email: user.email,
          phone: user.phone,
          role: user.role,
          age: user.age,
          gender: user.gender,
          bloodType: user.bloodType,
          allergies: user.allergies || [],
          emergencyContact: user.emergencyContact || '',
        },
      });
    };

    // 1. Query MongoDB Database first
    try {
      const patient = await Patient.findOne({ email: cleanEmail });

      if (patient && (await patient.matchPassword(password))) {
        return validateRoleAndRespond(patient);
      }
    } catch (dbErr) {
      // Memory Store Check
    }

    // 2. Memory Store Check
    const memPatient = memoryPatients.find(p => p.email === cleanEmail);
    if (memPatient && (await bcrypt.compare(password, memPatient.passwordHash))) {
      return validateRoleAndRespond(memPatient);
    }

    return res.status(401).json({
      success: false,
      message: 'Invalid email or password',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout patient
// @route   POST /api/patient/logout
// @access  Public / Protected
export const logoutPatient = async (req, res) => {
  res.json({
    success: true,
    message: 'Patient logged out successfully. Token invalidated.',
  });
};

// @desc    Get current patient profile (Protected)
// @route   GET /api/patient/profile
// @access  Private (Patient Role)
export const getPatientProfile = async (req, res) => {
  res.json({
    success: true,
    patient: req.user,
  });
};

// @desc    Update patient profile (Protected)
// @route   PUT /api/patient/profile
// @access  Private (Patient Role)
export const updatePatientProfile = async (req, res, next) => {
  try {
    const { name, phone, age, address, emergencyContact } = req.body;

    if (req.user._id && typeof req.user.save === 'function') {
      const patient = await Patient.findById(req.user._id);
      if (patient) {
        patient.name = name || patient.name;
        patient.phone = phone || patient.phone;
        patient.age = age || patient.age;
        patient.address = address || patient.address;
        patient.emergencyContact = emergencyContact || patient.emergencyContact;

        const updatedPatient = await patient.save();
        return res.json({
          success: true,
          message: 'Patient profile updated successfully',
          patient: updatedPatient,
        });
      }
    }

    // Memory Store Update
    const memIndex = memoryPatients.findIndex(p => p._id === req.user._id);
    if (memIndex !== -1) {
      memoryPatients[memIndex].name = name || memoryPatients[memIndex].name;
      memoryPatients[memIndex].phone = phone || memoryPatients[memIndex].phone;
      memoryPatients[memIndex].age = age || memoryPatients[memIndex].age;
      memoryPatients[memIndex].address = address || memoryPatients[memIndex].address;
      memoryPatients[memIndex].emergencyContact = emergencyContact || memoryPatients[memIndex].emergencyContact;

      return res.json({
        success: true,
        message: 'Patient profile updated successfully',
        patient: memoryPatients[memIndex],
      });
    }

    res.status(404).json({ success: false, message: 'Patient record not found' });
  } catch (error) {
    next(error);
  }
};
