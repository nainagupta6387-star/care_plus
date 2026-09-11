import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import MainLayout from './layouts/MainLayout';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import BookAppointmentPage from './pages/BookAppointmentPage';
import { ProtectedRoute } from './components/common/ProtectedRoute';
import { PublicRoute } from './components/common/PublicRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Main Public Layout Routes */}
          <Route path="/" element={<MainLayout />}>
            <Route index element={<LandingPage />} />
            <Route element={<PublicRoute />}>
              <Route path="login" element={<LoginPage />} />
              <Route path="register" element={<RegisterPage />} />
            </Route>

            {/* Protected Appointment Booking Route */}
            <Route element={<ProtectedRoute allowedRoles={['patient', 'doctor', 'admin', 'receptionist']} />}>
              <Route path="book-appointment" element={<BookAppointmentPage />} />
            </Route>
          </Route>

          {/* Protected Role-Based Routes */}
          <Route element={<ProtectedRoute allowedRoles={['patient']} />}>
            <Route path="/patient-dashboard" element={<PatientDashboard />} />
            <Route path="/patient" element={<PatientDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['doctor']} />}>
            <Route path="/doctor-dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor" element={<DoctorDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
          </Route>

          <Route element={<ProtectedRoute allowedRoles={['receptionist']} />}>
            <Route path="/receptionist-dashboard" element={<ReceptionistDashboard />} />
            <Route path="/receptionist" element={<ReceptionistDashboard />} />
          </Route>

        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}

export default App;
