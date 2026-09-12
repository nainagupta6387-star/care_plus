import Prescription from '../models/Prescription.js';
import Appointment from '../models/Appointment.js';
import { memoryAppointments } from './appointmentController.js';

// Pre-seeded Memory Prescriptions Store for fallback & immediate demo data
export const memoryPrescriptions = [
  {
    _id: 'mem-rx-7701',
    rxNumber: 'RX-7701',
    appointmentId: 'mem-apt-1082',
    tokenNumber: 'OPD-1082',
    patientId: 'PT-9801',
    patientName: 'Alexander Wright',
    patientEmail: 'patient@careplus-hms.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    doctorEmail: 'dr.jenkins@careplus-hms.com',
    department: 'Cardiology & Heart Care',
    date: '2026-08-28',
    medications: [
      { name: 'Atorvastatin', dosage: '20mg', frequency: '1 Tablet daily at bedtime', duration: '30 Days' },
      { name: 'Aspirin (Low Dose)', dosage: '81mg', frequency: '1 Tablet after breakfast', duration: '30 Days' }
    ],
    diagnosis: 'Hypertension & Lipid Management',
    notes: 'Maintain low-sodium diet and daily 30-min cardio walking. Recheck blood profile after 30 days.',
    vitals: {
      bloodPressure: '120 / 80 mmHg',
      heartRate: '72 BPM',
      spo2: '99% SpO2',
      temperature: '98.4 °F'
    },
    status: 'Active',
    createdAt: new Date('2026-08-28T10:30:00Z').toISOString()
  },
  {
    _id: 'mem-rx-7650',
    rxNumber: 'RX-7650',
    appointmentId: 'mem-apt-1090',
    tokenNumber: 'OPD-1090',
    patientId: 'PT-9801',
    patientName: 'Alexander Wright',
    patientEmail: 'patient@careplus-hms.com',
    doctor: 'Dr. Michael Chen, MD',
    doctorEmail: 'dr.chen@careplus-hms.com',
    department: 'Neurology & Brain Sciences',
    date: '2026-07-14',
    medications: [
      { name: 'Neuro B-Complex', dosage: '500mg', frequency: '1 Tablet twice daily', duration: '15 Days' }
    ],
    diagnosis: 'Mild Peripheral Neuropathy',
    notes: 'Take with full glass of water after meal. Avoid caffeinated drinks close to bedtime.',
    vitals: {
      bloodPressure: '118 / 78 mmHg',
      heartRate: '68 BPM',
      spo2: '98% SpO2',
      temperature: '98.6 °F'
    },
    status: 'Completed',
    createdAt: new Date('2026-07-14T14:00:00Z').toISOString()
  }
];

// @desc    Create and sign a new digital E-Prescription
// @route   POST /api/prescriptions
// @access  Private (Doctor / Admin)
export const createPrescription = async (req, res, next) => {
  try {
    const {
      appointmentId,
      tokenNumber,
      patientId,
      patientName,
      patientEmail,
      doctor,
      doctorEmail,
      department,
      medications,
      medicationName,
      dosage,
      frequency,
      duration,
      diagnosis,
      notes,
      vitals,
      status
    } = req.body;

    const signingDoctor = doctor || req.user?.name || 'Dr. Sarah Jenkins, MD';
    const signingEmail = doctorEmail || req.user?.email || 'dr.jenkins@careplus-hms.com';
    const rxNumber = 'RX-' + Math.floor(1000 + Math.random() * 9000);
    const date = new Date().toISOString().split('T')[0];

    // Build medications list
    let medsList = [];
    if (Array.isArray(medications) && medications.length > 0) {
      medsList = medications;
    } else if (medicationName || req.body.drug) {
      medsList = [
        {
          name: medicationName || req.body.drug,
          dosage: dosage || req.body.dosageFrequency || 'As Directed',
          frequency: frequency || dosage || '1 Tablet once daily',
          duration: duration || '30 Days'
        }
      ];
    } else {
      medsList = [
        {
          name: 'General Prescribed Medication',
          dosage: 'Standard Dosage',
          frequency: '1 Tablet once daily',
          duration: '15 Days'
        }
      ];
    }

    const prescriptionPayload = {
      rxNumber,
      appointmentId: appointmentId || '',
      tokenNumber: tokenNumber || '',
      patientId: patientId || 'PT-9801',
      patientName: patientName || 'Alexander Wright',
      patientEmail: patientEmail || 'patient@careplus-hms.com',
      doctor: signingDoctor,
      doctorEmail: signingEmail,
      department: department || 'Cardiology & Heart Care',
      date,
      medications: medsList,
      diagnosis: diagnosis || 'Clinical Evaluation & Treatment Plan',
      notes: notes || req.body.instructions || '',
      vitals: vitals || {
        bloodPressure: '120 / 80 mmHg',
        heartRate: '72 BPM',
        spo2: '99% SpO2',
        temperature: '98.6 °F'
      },
      status: status || 'Active',
      createdAt: new Date().toISOString()
    };

    // Try DB Save first
    try {
      const createdPrescription = await Prescription.create(prescriptionPayload);

      // If appointment exists, update status to Completed or In Consultation
      if (appointmentId || tokenNumber) {
        try {
          await Appointment.findOneAndUpdate(
            { $or: [{ _id: appointmentId }, { tokenNumber: tokenNumber || appointmentId }] },
            { status: 'Completed' }
          );
        } catch (e) {}
      }

      return res.status(201).json({
        success: true,
        message: `Digital E-Prescription ${rxNumber} signed and recorded successfully`,
        prescription: createdPrescription
      });
    } catch (dbErr) {
      // Memory Store Fallback
      const newMemRx = {
        _id: 'mem-rx-' + Math.floor(1000 + Math.random() * 9000),
        ...prescriptionPayload
      };
      memoryPrescriptions.unshift(newMemRx);

      // Also update memory appointment if matched
      if (appointmentId || tokenNumber) {
        const aptIdx = memoryAppointments.findIndex(
          a => a._id === appointmentId || a.tokenNumber === tokenNumber || a.tokenNumber === appointmentId
        );
        if (aptIdx !== -1) {
          memoryAppointments[aptIdx].status = 'Completed';
        }
      }

      return res.status(201).json({
        success: true,
        message: `Digital E-Prescription ${rxNumber} signed and recorded successfully (Memory Store)`,
        prescription: newMemRx
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get all prescriptions (filter by patient, doctor, or appointment)
// @route   GET /api/prescriptions
// @access  Private
export const getPrescriptions = async (req, res, next) => {
  try {
    const { patientId, patientEmail, doctor, appointmentId, tokenNumber } = req.query;

    let dbPrescriptions = [];
    try {
      const query = {};
      if (patientId) query.patientId = patientId;
      if (patientEmail) query.patientEmail = patientEmail.toLowerCase();
      if (doctor) query.doctor = new RegExp(doctor, 'i');
      if (appointmentId) query.appointmentId = appointmentId;
      if (tokenNumber) query.tokenNumber = tokenNumber;

      dbPrescriptions = await Prescription.find(query).sort({ createdAt: -1 });
    } catch (dbErr) {}

    // Filter memory prescriptions
    const memList = memoryPrescriptions.filter(rx => {
      if (patientId && rx.patientId !== patientId) return false;
      if (patientEmail && rx.patientEmail.toLowerCase() !== patientEmail.toLowerCase()) return false;
      if (doctor && !rx.doctor.toLowerCase().includes(doctor.toLowerCase())) return false;
      if (appointmentId && rx.appointmentId !== appointmentId) return false;
      if (tokenNumber && rx.tokenNumber !== tokenNumber) return false;
      return true;
    });

    // Combine avoiding duplicate rxNumbers
    const combinedMap = new Map();
    [...dbPrescriptions, ...memList].forEach(item => {
      const key = item.rxNumber || item._id;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    });

    const finalPrescriptions = Array.from(combinedMap.values());

    return res.json({
      success: true,
      count: finalPrescriptions.length,
      prescriptions: finalPrescriptions
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get prescriptions for a specific patient ID or current patient
// @route   GET /api/prescriptions/patient/:patientId
// @access  Private
export const getPrescriptionsByPatient = async (req, res, next) => {
  try {
    const { patientId } = req.params;

    let dbPrescriptions = [];
    try {
      dbPrescriptions = await Prescription.find({
        $or: [
          { patientId: patientId },
          { patientEmail: patientId.toLowerCase() },
          { patientName: new RegExp(patientId, 'i') }
        ]
      }).sort({ createdAt: -1 });
    } catch (dbErr) {}

    const memList = memoryPrescriptions.filter(
      rx => rx.patientId === patientId ||
            rx.patientEmail.toLowerCase() === patientId.toLowerCase() ||
            rx.patientName.toLowerCase().includes(patientId.toLowerCase())
    );

    const combinedMap = new Map();
    [...dbPrescriptions, ...memList].forEach(item => {
      const key = item.rxNumber || item._id;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    });

    const finalPrescriptions = Array.from(combinedMap.values());

    return res.json({
      success: true,
      count: finalPrescriptions.length,
      prescriptions: finalPrescriptions
    });
  } catch (error) {
    next(error);
  }
};
