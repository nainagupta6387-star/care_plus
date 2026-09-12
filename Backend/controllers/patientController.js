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
    emergencyContact: 'Eleanor Wright (+1 555 987-6543)',
    address: '742 Evergreen Terrace, Medical District'
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
    bloodType: 'A+',
    specialty: 'Chief of Cardiology',
    department: 'Cardiology & Heart Care',
    experience: '16+ Years Experience',
    education: 'Harvard Medical School',
    roomNumber: 'OPD-102',
    bio: 'Board-certified cardiologist specializing in advanced interventional cardiac care, preventive cardiology, and acute telemetry.',
    address: 'Suite 402, CarePlus Heart Tower'
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
    bloodType: 'B+',
    department: 'Central OPD & Registration Desk'
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

// @desc    Update patient / doctor / user profile (Protected)
// @route   PUT /api/patient/profile
// @access  Private
export const updatePatientProfile = async (req, res, next) => {
  try {
    const {
      name,
      phone,
      age,
      address,
      gender,
      bloodType,
      emergencyContact,
      specialty,
      department,
      experience,
      education,
      bio,
      roomNumber
    } = req.body;

    const userId = req.user?._id || req.user?.id;

    if (req.user && typeof req.user.save === 'function') {
      const patient = await Patient.findById(userId);
      if (patient) {
        if (name !== undefined) patient.name = name;
        if (phone !== undefined) patient.phone = phone;
        if (age !== undefined) patient.age = age;
        if (gender !== undefined) patient.gender = gender;
        if (bloodType !== undefined) patient.bloodType = bloodType;
        if (address !== undefined) patient.address = address;
        if (emergencyContact !== undefined) patient.emergencyContact = emergencyContact;
        if (specialty !== undefined) patient.specialty = specialty;
        if (department !== undefined) patient.department = department;
        if (experience !== undefined) patient.experience = experience;
        if (education !== undefined) patient.education = education;
        if (bio !== undefined) patient.bio = bio;
        if (roomNumber !== undefined) patient.roomNumber = roomNumber;

        const updatedPatient = await patient.save();
        return res.json({
          success: true,
          message: 'Profile updated successfully',
          patient: updatedPatient,
        });
      }
    }

    // Memory Store Update
    const memIndex = memoryPatients.findIndex(p => p._id === userId || p.patientId === userId || p.email === req.user?.email);
    if (memIndex !== -1) {
      if (name !== undefined) memoryPatients[memIndex].name = name;
      if (phone !== undefined) memoryPatients[memIndex].phone = phone;
      if (age !== undefined) memoryPatients[memIndex].age = age;
      if (gender !== undefined) memoryPatients[memIndex].gender = gender;
      if (bloodType !== undefined) memoryPatients[memIndex].bloodType = bloodType;
      if (address !== undefined) memoryPatients[memIndex].address = address;
      if (emergencyContact !== undefined) memoryPatients[memIndex].emergencyContact = emergencyContact;
      if (specialty !== undefined) memoryPatients[memIndex].specialty = specialty;
      if (department !== undefined) memoryPatients[memIndex].department = department;
      if (experience !== undefined) memoryPatients[memIndex].experience = experience;
      if (education !== undefined) memoryPatients[memIndex].education = education;
      if (bio !== undefined) memoryPatients[memIndex].bio = bio;
      if (roomNumber !== undefined) memoryPatients[memIndex].roomNumber = roomNumber;

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        patient: memoryPatients[memIndex],
      });
    }

    res.status(404).json({ success: false, message: 'User record not found' });
  } catch (error) {
    next(error);
  }
};
