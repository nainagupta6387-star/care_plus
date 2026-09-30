import { getAuthToken } from './authApi';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: { ...getAuthHeaders(), ...options.headers },
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.message || 'Emergency management request failed.');
  return data;
};

export const getAdmissions = async () => {
  const data = await request('/admissions');
  return data.admissions || [];
};

export const getIcuBeds = async () => request('/admissions/icu-beds');

export const getDoctors = async () => {
  const data = await request('/patient/doctors');
  return data.doctors || [];
};

export const createAdmission = async (admission) => request('/admissions', {
  method: 'POST',
  body: JSON.stringify(admission),
});

export const updateAdmissionStatus = async ({ id, status }) => request(`/admissions/${id}/status`, {
  method: 'PUT',
  body: JSON.stringify({ status }),
});

export const assignIcuBed = async ({ id, bedId }) => request(`/admissions/${id}/icu-bed`, {
  method: 'PUT',
  body: JSON.stringify({ bedId }),
});

export const updateIcuStatus = async ({ id, icuStatus }) => request(`/admissions/${id}/icu-status`, {
  method: 'PUT',
  body: JSON.stringify({ icuStatus }),
});