import { getAuthToken } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

export const getMyAppointments = async () => {
  const token = getAuthToken();
  if (!token) {
    return {
      statistics: { total: 0, upcoming: 0, completed: 0, cancelled: 0 },
      appointments: []
    };
  }

  try {
    const res = await fetch(`${API_URL}/appointments/my-appointments`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch appointments');
    return data;
  } catch {
    // Offline / LocalStorage fallback
    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    const total = stored.length;
    const upcoming = stored.filter(a => ['Upcoming', 'Confirmed', 'In Consultation', 'Rescheduled'].includes(a.status)).length;
    const completed = stored.filter(a => a.status === 'Completed').length;
    const cancelled = stored.filter(a => a.status === 'Cancelled').length;

    return {
      statistics: { total, upcoming, completed, cancelled },
      appointments: stored
    };
  }
};

export const getAllAppointments = async () => {
  const res = await fetch(`${API_URL}/appointments/all`, {
    headers: getAuthHeaders()
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to fetch all appointments');
  return data.appointments || [];
};

export const createAppointment = async (appointmentData) => {
  const res = await fetch(`${API_URL}/appointments`, {
    method: 'POST',
    headers: getAuthHeaders(),
    body: JSON.stringify(appointmentData)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to book appointment');
  return data;
};

export const updateAppointmentStatus = async ({ id, status, date, timeSlot }) => {
  const res = await fetch(`${API_URL}/appointments/${id}/status`, {
    method: 'PUT',
    headers: getAuthHeaders(),
    body: JSON.stringify({ status, date, timeSlot })
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to update status');
  return data;
};

// Aliases for backward compatibility
export const fetchMyAppointmentsApi = getMyAppointments;
export const fetchAllAppointmentsApi = getAllAppointments;
export const createAppointmentApi = createAppointment;
export const updateAppointmentStatusApi = updateAppointmentStatus;

export default {
  getMyAppointments,
  getAllAppointments,
  createAppointment,
  updateAppointmentStatus,
  fetchMyAppointmentsApi,
  fetchAllAppointmentsApi,
  createAppointmentApi,
  updateAppointmentStatusApi
};
