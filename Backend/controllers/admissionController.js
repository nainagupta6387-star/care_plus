import mongoose from 'mongoose';
import Admission from '../models/Admission.js';
import Patient from '../models/Patient.js';
import { memoryPatients } from './patientController.js';

export const memoryAdmissions = [];

const admissionStatuses = ['Waiting', 'Under Treatment', 'Stabilized', 'ICU', 'Admitted', 'Completed'];
const icuStatuses = ['Reserved', 'Occupied', 'Released'];
const defaultIcuBeds = ['DEMO-ICU-01', 'DEMO-ICU-02', 'DEMO-ICU-03'];

const getConfiguredIcuBeds = () => {
  const configuredBeds = process.env.ICU_BED_IDS
    ?.split(',')
    .map((bed) => bed.trim())
    .filter(Boolean);

  return configuredBeds?.length ? configuredBeds : defaultIcuBeds;
};

const canUseDatabase = () => mongoose.connection.readyState === 1;

const getAdmissions = async () => {
  try {
    return await Admission.find().sort({ createdAt: -1 }).lean();
  } catch (error) {
    if (canUseDatabase()) throw error;
    return [...memoryAdmissions];
  }
};

const getDoctorByIdOrEmail = async (doctorId, doctorEmail) => {
  try {
    let doctor = null;
    if (doctorId && mongoose.Types.ObjectId.isValid(doctorId)) {
      doctor = await Patient.findOne({ _id: doctorId, role: 'doctor' }).select('_id name email role department specialty');
    }
    if (!doctor && doctorEmail) {
      doctor = await Patient.findOne({ email: doctorEmail, role: 'doctor' }).select('_id name email role department specialty');
    }
    if (doctor) return doctor;
  } catch (error) {
    if (canUseDatabase()) throw error;
  }

  return memoryPatients.find((patient) =>
    patient.role === 'doctor' &&
    ((doctorId && patient._id === doctorId) || (doctorEmail && patient.email === doctorEmail))
  ) || null;
};

const canManageAdmission = (user, admission) => {
  if (user.role !== 'doctor') return true;
  return admission.doctorEmail === user.email || admission.doctorId === String(user._id || user.id);
};

const saveAdmission = async (admission, next, res) => {
  try {
    return await admission.save();
  } catch (error) {
    if (error.code === 11000) {
      res.status(409).json({ success: false, message: 'That ICU bed is already assigned to another patient.' });
      return false;
    }
    if (canUseDatabase()) {
      next(error);
      return false;
    }
    return null;
  }
};

export const getAdmissionsList = async (req, res, next) => {
  try {
    let admissions = await getAdmissions();
    if (req.user.role === 'doctor') {
      admissions = admissions.filter((admission) => canManageAdmission(req.user, admission));
    }
    return res.json({ success: true, admissions });
  } catch (error) {
    return next(error);
  }
};

export const getIcuBeds = async (req, res, next) => {
  try {
    const admissions = await getAdmissions();
    const beds = getConfiguredIcuBeds().map((bedId) => {
      const occupant = admissions.find((admission) => admission.icuBed === bedId && admission.icuStatus !== 'Released');
      return {
        bedId,
        status: occupant ? occupant.icuStatus : 'Available',
        patientName: occupant?.patientName || '',
        admissionId: occupant?._id || '',
        doctorName: occupant?.doctorName || '',
      };
    });
    return res.json({ success: true, demo: !process.env.ICU_BED_IDS, beds });
  } catch (error) {
    return next(error);
  }
};

export const createAdmission = async (req, res, next) => {
  try {
    const {
      patientName,
      unknownPatient = false,
      age,
      gender,
      contactNumber,
      emergencyType,
      emergencyDescription,
      arrivalAt,
      priority,
      vitals = {},
      icuRequired = false,
      doctorId,
      doctorEmail,
      icuBed,
    } = req.body;

    const cleanName = unknownPatient ? 'Unknown Patient' : String(patientName || '').trim();
    if (!cleanName) return res.status(400).json({ success: false, message: 'Patient name is required unless Unknown Patient is selected.' });
    if (age !== undefined && age !== '' && (!Number.isInteger(Number(age)) || Number(age) < 0 || Number(age) > 120)) {
      return res.status(400).json({ success: false, message: 'Age must be a whole number between 0 and 120.' });
    }
    if (contactNumber && !/^[+()\-\s\d.]{7,20}$/.test(String(contactNumber).trim())) {
      return res.status(400).json({ success: false, message: 'Enter a valid contact number.' });
    }
    if (!['Accident', 'Critical Emergency', 'Other Emergency'].includes(emergencyType)) {
      return res.status(400).json({ success: false, message: 'Select a valid emergency type.' });
    }
    if (!String(emergencyDescription || '').trim()) {
      return res.status(400).json({ success: false, message: 'Emergency description is required.' });
    }
    if (!arrivalAt || Number.isNaN(Date.parse(arrivalAt))) {
      return res.status(400).json({ success: false, message: 'A valid arrival date and time is required.' });
    }
    if (!['Emergency', 'High', 'Normal'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Select a valid priority.' });
    }
    if (typeof icuRequired !== 'boolean') {
      return res.status(400).json({ success: false, message: 'Select whether ICU care is required.' });
    }

    const doctor = await getDoctorByIdOrEmail(doctorId, doctorEmail);
    if (!doctor) return res.status(400).json({ success: false, message: 'Select an existing doctor.' });

    const record = {
      patientName: cleanName,
      unknownPatient: Boolean(unknownPatient),
      age: age === undefined || age === '' ? undefined : Number(age),
      gender: String(gender || ''),
      contactNumber: String(contactNumber || '').trim(),
      emergencyType,
      emergencyDescription: String(emergencyDescription).trim(),
      arrivalAt: new Date(arrivalAt),
      priority,
      vitals: {
        bloodPressure: String(vitals.bloodPressure || '').trim(),
        heartRate: String(vitals.heartRate || '').trim(),
        temperature: String(vitals.temperature || '').trim(),
        spo2: String(vitals.spo2 || '').trim(),
      },
      icuRequired,
      doctorId: String(doctor._id || doctor.id),
      doctorName: doctor.name,
      doctorEmail: doctor.email,
      status: 'Waiting',
      icuStatus: 'Not Assigned',
    };

    if (icuBed) {
      if (!icuRequired) return res.status(400).json({ success: false, message: 'A bed can only be assigned when ICU is required.' });
      if (!getConfiguredIcuBeds().includes(icuBed)) return res.status(400).json({ success: false, message: 'Select a configured ICU bed.' });
    }

    if (canUseDatabase()) {
      if (icuBed) {
        if (await Admission.exists({ icuBed })) {
          return res.status(409).json({ success: false, message: 'That ICU bed is already assigned to another patient.' });
        }
        record.icuBed = icuBed;
        record.icuAdmissionTime = new Date();
        record.icuStatus = 'Reserved';
      }
      try {
        const admission = await Admission.create(record);
        return res.status(201).json({ success: true, admission });
      } catch (error) {
        if (error.code === 11000) {
          return res.status(409).json({ success: false, message: 'That ICU bed is already assigned to another patient.' });
        }
        return next(error);
      }
    }

    if (icuBed && memoryAdmissions.some((admission) => admission.icuBed === icuBed && admission.icuStatus !== 'Released')) {
      return res.status(409).json({ success: false, message: 'That ICU bed is already assigned to another patient.' });
    }
    const admission = {
      ...record,
      _id: `mem-adm-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ...(icuBed ? { icuBed, icuAdmissionTime: new Date().toISOString(), icuStatus: 'Reserved' } : {}),
    };
    memoryAdmissions.unshift(admission);
    return res.status(201).json({ success: true, admission });
  } catch (error) {
    return next(error);
  }
};

export const updateAdmissionStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    if (!admissionStatuses.includes(status)) {
      return res.status(400).json({ success: false, message: 'Select a valid emergency status.' });
    }

    const admission = canUseDatabase()
      ? await Admission.findById(req.params.id)
      : memoryAdmissions.find((item) => item._id === req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Emergency admission not found.' });
    if (!canManageAdmission(req.user, admission)) return res.status(403).json({ success: false, message: 'You can only update emergencies assigned to you.' });
    if (status === 'ICU' && !admission.icuBed) return res.status(400).json({ success: false, message: 'Assign an ICU bed before setting this patient to ICU.' });

    admission.status = status;
    if (status === 'Completed' && admission.icuBed) {
      admission.icuStatus = 'Released';
      if (typeof admission.set === 'function') admission.set('icuBed', undefined);
      else delete admission.icuBed;
    }

    if (typeof admission.save === 'function') {
      const saved = await saveAdmission(admission, next, res);
      if (saved === false) return;
      if (!saved) return res.status(503).json({ success: false, message: 'Emergency status could not be saved.' });
    } else {
      admission.updatedAt = new Date().toISOString();
    }
    return res.json({ success: true, admission });
  } catch (error) {
    return next(error);
  }
};

export const assignIcuBed = async (req, res, next) => {
  try {
    const { bedId } = req.body;
    if (!getConfiguredIcuBeds().includes(bedId)) {
      return res.status(400).json({ success: false, message: 'Select a configured ICU bed.' });
    }

    const admission = canUseDatabase()
      ? await Admission.findById(req.params.id)
      : memoryAdmissions.find((item) => item._id === req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Emergency admission not found.' });
    if (req.user.role === 'doctor' && !canManageAdmission(req.user, admission)) {
      return res.status(403).json({ success: false, message: 'You can only update emergencies assigned to you.' });
    }
    if (!admission.icuRequired) return res.status(400).json({ success: false, message: 'This emergency is not marked as requiring ICU.' });
    if (admission.icuBed === bedId) return res.json({ success: true, admission });

    const occupied = canUseDatabase()
      ? await Admission.exists({ icuBed: bedId })
      : memoryAdmissions.some((item) => item.icuBed === bedId && item.icuStatus !== 'Released');
    if (occupied) return res.status(409).json({ success: false, message: 'That ICU bed is already assigned to another patient.' });

    admission.icuBed = bedId;
    admission.icuAdmissionTime = new Date();
    admission.icuStatus = 'Reserved';
    if (typeof admission.save === 'function') {
      const saved = await saveAdmission(admission, next, res);
      if (saved === false) return;
      if (!saved) return res.status(503).json({ success: false, message: 'ICU bed assignment could not be saved.' });
    } else {
      admission.updatedAt = new Date().toISOString();
    }
    return res.json({ success: true, admission });
  } catch (error) {
    return next(error);
  }
};

export const updateIcuStatus = async (req, res, next) => {
  try {
    const { icuStatus } = req.body;
    if (!icuStatuses.includes(icuStatus)) return res.status(400).json({ success: false, message: 'Select a valid ICU status.' });

    const admission = canUseDatabase()
      ? await Admission.findById(req.params.id)
      : memoryAdmissions.find((item) => item._id === req.params.id);
    if (!admission) return res.status(404).json({ success: false, message: 'Emergency admission not found.' });
    if (!canManageAdmission(req.user, admission)) return res.status(403).json({ success: false, message: 'You can only update emergencies assigned to you.' });
    if (!admission.icuBed) return res.status(400).json({ success: false, message: 'Assign an ICU bed before updating ICU status.' });

    admission.icuStatus = icuStatus;
    if (icuStatus === 'Released') {
      if (typeof admission.set === 'function') admission.set('icuBed', undefined);
      else delete admission.icuBed;
    }
    if (typeof admission.save === 'function') {
      const saved = await saveAdmission(admission, next, res);
      if (saved === false) return;
      if (!saved) return res.status(503).json({ success: false, message: 'ICU status could not be saved.' });
    } else {
      admission.updatedAt = new Date().toISOString();
    }
    return res.json({ success: true, admission });
  } catch (error) {
    return next(error);
  }
};