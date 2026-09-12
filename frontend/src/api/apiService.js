// Centralized API Service aggregator for backward compatibility
import * as auth from './authApi';
import * as appointments from './appointmentApi';
import * as billing from './billingApi';
import * as prescriptions from './prescriptionApi';

// Re-export all named methods
export const {
  getAuthToken,
  setAuthSession,
  clearAuthSession,
  registerUser,
  loginUser,
  logoutUser,
  getUserProfile,
  registerPatientApi,
  loginPatientApi,
  logoutPatientApi,
  fetchPatientProfileApi
} = auth;

export const {
  getMyAppointments,
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus,
  fetchMyAppointmentsApi,
  fetchAllAppointmentsApi,
  createAppointmentApi,
  updateAppointmentStatusApi
} = appointments;

export const {
  getInvoices,
  createInvoice,
  updateInvoiceStatus
} = billing;

export const {
  getPrescriptions,
  getPatientPrescriptions,
  createPrescription,
  updatePatientProfileApi
} = prescriptions;

// High-level dashboard helpers
export const getPatientDashboard = async () => {
  const [profile, apts, rxs] = await Promise.all([
    auth.getUserProfile().catch(() => null),
    appointments.getMyAppointments().catch(() => ({ statistics: {}, appointments: [] })),
    prescriptions.getPrescriptions().catch(() => [])
  ]);
  return {
    profile,
    statistics: apts.statistics,
    appointments: apts.appointments,
    prescriptions: rxs
  };
};

export const getReceptionistDashboard = async () => {
  const [apts, invs] = await Promise.all([
    appointments.getAllAppointments().catch(() => []),
    billing.getInvoices().catch(() => [])
  ]);
  return {
    appointments: apts,
    invoices: invs
  };
};

export const getDoctorDashboard = async () => {
  const [profile, apts, rxs] = await Promise.all([
    auth.getUserProfile().catch(() => null),
    appointments.getAllAppointments().catch(() => []),
    prescriptions.getPrescriptions().catch(() => [])
  ]);
  return {
    profile,
    appointments: apts,
    prescriptions: rxs
  };
};

const apiService = {
  ...auth,
  ...appointments,
  ...billing,
  ...prescriptions,
  getPatientDashboard,
  getReceptionistDashboard,
  getDoctorDashboard
};

export default apiService;
