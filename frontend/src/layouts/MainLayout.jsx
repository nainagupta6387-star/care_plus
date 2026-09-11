import React, { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { QuickBookingModal } from '../components/landing/QuickBookingModal';
import { AuthModal } from '../components/auth/AuthModal';
import { getAuthToken } from '../api';

const MainLayout = () => {
  const navigate = useNavigate();
  const [bookingModalOpen, setBookingModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [selectedDept, setSelectedDept] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const handleOpenBooking = (dept = '', doctor = '') => {
    const token = getAuthToken();
    const storedUserJson = localStorage.getItem('careplus_patient_user');
    const user = storedUserJson ? JSON.parse(storedUserJson) : null;

    if (token && user) {
      // User is already logged in -> Continue directly to appointment booking process
      navigate('/book-appointment', { state: { dept, doctor } });
    } else {
      // User is not logged in -> Redirect to login page with return URL
      navigate('/login?redirect=/book-appointment', { state: { dept, doctor } });
    }
  };

  const handleOpenAuth = () => {
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-800 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Sticky Top Navbar */}
      <Navbar 
        onOpenBooking={() => handleOpenBooking()}
        onOpenAuth={handleOpenAuth}
        onOpenRegister={handleOpenAuth}
      />
      
      {/* Page Content Render via Outlet */}
      <main className="flex-1">
        <Outlet context={{ handleOpenBooking, handleOpenAuth }} />
      </main>

      {/* Global Interactive Modals */}
      <QuickBookingModal 
        isOpen={bookingModalOpen}
        onClose={() => setBookingModalOpen(false)}
        initialDept={selectedDept}
        initialDoctor={selectedDoctor}
      />

      <AuthModal 
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
      />
    </div>
  );
};

export default MainLayout;