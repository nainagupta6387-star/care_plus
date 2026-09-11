// Centralized API Service aggregator for backward compatibility
import * as auth from './authApi';
import * as appointments from './appointmentApi';
import * as billing from './billingApi';

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

// High-level dashboard helpers
export const getPatientDashboard = async () => {
  const [profile, apts] = await Promise.all([
    auth.getUserProfile().catch(() => null),
    appointments.getMyAppointments().catch(() => ({ statistics: {}, appointments: [] }))
  ]);
  return {
    profile,
    statistics: apts.statistics,
    appointments: apts.appointments
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

const apiService = {
  ...auth,
  ...appointments,
  ...billing,
  getPatientDashboard,
  getReceptionistDashboard
};

export default apiService;
