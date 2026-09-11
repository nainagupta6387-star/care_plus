const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// ==========================================
// Token & Session Helpers
// ==========================================

export const getAuthToken = () => {
  return localStorage.getItem('careplus_patient_token') || null;
};

export const setAuthSession = (token, user) => {
  if (token) localStorage.setItem('careplus_patient_token', token);
  if (user) localStorage.setItem('careplus_patient_user', JSON.stringify(user));
};

export const clearAuthSession = () => {
  localStorage.removeItem('careplus_patient_token');
  localStorage.removeItem('careplus_patient_user');
};

const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

// ==========================================
// Authentication Endpoints
// ==========================================

export const registerUser = async (patientData) => {
  try {
    const res = await fetch(`${API_URL}/patient/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patientData)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Registration failed');

    if (data.token) {
      setAuthSession(data.token, data.patient);
    }
    return data;
  } catch (err) {
    // Demo offline fallback if backend is unreachable
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ERR_CONNECTION_REFUSED')) {
      const mockToken = 'mock_jwt_token_' + Math.random().toString(36).substring(2);
      const mockPatient = {
        id: 'pat-' + Math.floor(1000 + Math.random() * 9000),
        patientId: 'PT-' + Math.floor(1000 + Math.random() * 9000),
        name: patientData.name,
        email: patientData.email,
        phone: patientData.phone,
        role: patientData.role || 'patient',
        age: patientData.age || 28,
        gender: patientData.gender || 'Male',
        bloodType: patientData.bloodType || 'O+'
      };
      setAuthSession(mockToken, mockPatient);
      return { success: true, token: mockToken, patient: mockPatient };
    }
    throw err;
  }
};

export const loginUser = async (credentials) => {
  try {
    const res = await fetch(`${API_URL}/patient/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Login failed');

    if (data.token) {
      setAuthSession(data.token, data.patient);
    }
    return data;
  } catch (err) {
    // Demo offline fallback if backend is unreachable
    if (err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('ERR_CONNECTION_REFUSED')) {
      const mockToken = 'mock_jwt_token_demo';
      const mockPatient = {
        id: 'mem-pat-9801',
        patientId: 'PT-9801',
        name: 'Alexander Wright',
        email: credentials.email,
        phone: '+1 (555) 234-5678',
        role: credentials.role || 'patient',
        age: 34,
        gender: 'Male',
        bloodType: 'O+'
      };
      setAuthSession(mockToken, mockPatient);
      return { success: true, token: mockToken, patient: mockPatient };
    }
    throw err;
  }
};

export const logoutUser = async () => {
  try {
    await fetch(`${API_URL}/patient/logout`, {
      method: 'POST',
      headers: getAuthHeaders()
    });
  } catch {
    // Ignore network error during logout
  } finally {
    clearAuthSession();
  }
  return { success: true };
};

export const getUserProfile = async () => {
  const token = getAuthToken();
  if (!token) throw new Error('No JWT authentication token found');

  try {
    const res = await fetch(`${API_URL}/patient/profile`, {
      headers: getAuthHeaders()
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Failed to fetch user profile');
    return data.patient;
  } catch (err) {
    const storedUserJson = localStorage.getItem('careplus_patient_user');
    if (storedUserJson) {
      return JSON.parse(storedUserJson);
    }
    throw err;
  }
};

// Aliases for backward compatibility
export const registerPatientApi = registerUser;
export const loginPatientApi = loginUser;
export const logoutPatientApi = logoutUser;
export const fetchPatientProfileApi = getUserProfile;

export default {
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
};
