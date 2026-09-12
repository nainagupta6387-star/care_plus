import { getAuthToken } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getPrescriptions = async (params = {}) => {
  try {
    const query = new URLSearchParams(params).toString();
    const url = `${API_URL}/prescriptions${query ? `?${query}` : ''}`;
    const res = await fetch(url, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch prescriptions');
    return data.prescriptions || [];
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_prescriptions') || '[]');
    return stored;
  }
};

export const getPatientPrescriptions = async (patientId) => {
  try {
    const res = await fetch(`${API_URL}/prescriptions/patient/${patientId}`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch patient prescriptions');
    return data.prescriptions || [];
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_prescriptions') || '[]');
    return stored.filter(rx => rx.patientId === patientId || rx.patientEmail === patientId);
  }
};

export const createPrescription = async (prescriptionData) => {
  try {
    const res = await fetch(`${API_URL}/prescriptions`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(prescriptionData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to create prescription');

    if (data.prescription) {
      const stored = JSON.parse(localStorage.getItem('careplus_prescriptions') || '[]');
      localStorage.setItem('careplus_prescriptions', JSON.stringify([data.prescription, ...stored]));
    }
    return data;
  } catch (err) {
    const rxNumber = 'RX-' + Math.floor(1000 + Math.random() * 9000);
    const mockRx = {
      _id: 'rx-' + Math.floor(1000 + Math.random() * 9000),
      rxNumber,
      appointmentId: prescriptionData.appointmentId || '',
      tokenNumber: prescriptionData.tokenNumber || '',
      patientId: prescriptionData.patientId || 'PT-9801',
      patientName: prescriptionData.patientName || 'Patient',
      patientEmail: prescriptionData.patientEmail || '',
      doctor: prescriptionData.doctor || 'Dr. Sarah Jenkins, MD',
      doctorEmail: prescriptionData.doctorEmail || 'dr.jenkins@careplus-hms.com',
      department: prescriptionData.department || 'Cardiology & Heart Care',
      date: new Date().toISOString().split('T')[0],
      medications: prescriptionData.medications || [
        {
          name: prescriptionData.medicationName || 'Medication',
          dosage: prescriptionData.dosage || '1 Tablet daily',
          frequency: prescriptionData.frequency || '1 Tablet daily',
          duration: prescriptionData.duration || '30 Days'
        }
      ],
      diagnosis: prescriptionData.diagnosis || 'Clinical Evaluation',
      notes: prescriptionData.notes || prescriptionData.instructions || '',
      vitals: prescriptionData.vitals || {
        bloodPressure: '120 / 80 mmHg',
        heartRate: '72 BPM',
        spo2: '99% SpO2',
        temperature: '98.6 °F'
      },
      status: 'Active',
      createdAt: new Date().toISOString()
    };

    const stored = JSON.parse(localStorage.getItem('careplus_prescriptions') || '[]');
    localStorage.setItem('careplus_prescriptions', JSON.stringify([mockRx, ...stored]));

    return {
      success: true,
      message: `Digital E-Prescription ${rxNumber} signed and saved (Local fallback)`,
      prescription: mockRx
    };
  }
};

export const updatePatientProfileApi = async (profileData) => {
  try {
    const res = await fetch(`${API_URL}/patient/profile`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(profileData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update profile');

    if (data.patient) {
      const stored = JSON.parse(localStorage.getItem('careplus_patient_user') || '{}');
      localStorage.setItem('careplus_patient_user', JSON.stringify({ ...stored, ...data.patient }));
    }
    return data;
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_patient_user') || '{}');
    const updated = { ...stored, ...profileData };
    localStorage.setItem('careplus_patient_user', JSON.stringify(updated));
    return { success: true, message: 'Profile updated locally', patient: updated };
  }
};

export default {
  getPrescriptions,
  getPatientPrescriptions,
  createPrescription,
  updatePatientProfileApi
};
