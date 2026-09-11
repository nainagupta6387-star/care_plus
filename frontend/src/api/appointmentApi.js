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
  } catch (err) {
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
  try {
    const res = await fetch(`${API_URL}/appointments/all`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch all appointments');
    return data.appointments;
  } catch (err) {
    return JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
  }
};

export const createAppointment = async (appointmentData) => {
  try {
    const res = await fetch(`${API_URL}/appointments`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(appointmentData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to book appointment');

    if (data.appointment) {
      const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
      localStorage.setItem('careplus_appointments', JSON.stringify([data.appointment, ...stored]));
    }
    return data;
  } catch (err) {
    const tokenNumber = 'OPD-' + Math.floor(1000 + Math.random() * 9000);
    const mockApt = {
      _id: 'apt-' + Math.floor(1000 + Math.random() * 9000),
      tokenNumber,
      patientName: appointmentData.patientName || 'Patient',
      patientEmail: appointmentData.patientEmail || 'patient@careplus-hms.com',
      doctor: appointmentData.doctor,
      department: appointmentData.department,
      date: appointmentData.date,
      timeSlot: appointmentData.timeSlot,
      status: 'Upcoming',
      type: appointmentData.type || 'OPD Consultation'
    };

    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    localStorage.setItem('careplus_appointments', JSON.stringify([mockApt, ...stored]));

    return { success: true, message: 'Appointment booked successfully', appointment: mockApt };
  }
};

export const updateAppointmentStatus = async ({ id, status, date, timeSlot }) => {
  try {
    const res = await fetch(`${API_URL}/appointments/${id}/status`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify({ status, date, timeSlot })
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to update status');

    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    const updated = stored.map(a => {
      if (a._id === id || a.id === id || a.tokenNumber === id) {
        return { ...a, status: status || a.status, date: date || a.date, timeSlot: timeSlot || a.timeSlot };
      }
      return a;
    });
    localStorage.setItem('careplus_appointments', JSON.stringify(updated));

    return data;
  } catch (err) {
    const stored = JSON.parse(localStorage.getItem('careplus_appointments') || '[]');
    const updated = stored.map(a => {
      if (a._id === id || a.id === id || a.tokenNumber === id) {
        return { ...a, status: status || a.status, date: date || a.date, timeSlot: timeSlot || a.timeSlot };
      }
      return a;
    });
    localStorage.setItem('careplus_appointments', JSON.stringify(updated));

    return { success: true, message: 'Status updated successfully' };
  }
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
