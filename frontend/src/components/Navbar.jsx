import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Activity, PhoneCall, Calendar, UserCheck, UserPlus, Menu, X, ShieldAlert, ChevronRight, LogOut, LayoutDashboard, User } from 'lucide-react';
import { getAuthToken, logoutUser } from '../api';
import { getDashboardForRole } from './common/PublicRoute';

const Navbar = ({ onOpenBooking, onOpenAuth }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const token = getAuthToken();
  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const user = storedUserJson ? JSON.parse(storedUserJson) : null;
  const isAuthenticated = !!(token && user);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const emergencyHotline = '+1 (800) 555-9000';

  return (
    <header className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 backdrop-blur-md shadow-md py-3 border-b border-slate-200/80' 
        : 'bg-white py-4 border-b border-slate-100'
    }`}>
      
      {/* Top Emergency Ribbon */}
      <div className="bg-slate-900 text-white text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-600 text-white uppercase tracking-wider animate-pulse">
              <ShieldAlert className="w-3 h-3 mr-1" /> 24/7 Emergency
            </span>
            <span className="text-slate-300 hidden sm:inline">Level-1 Trauma & Rapid Ambulance Service Active</span>
          </div>
          <div className="flex items-center space-x-4">
            <a 
              href={`tel:${emergencyHotline}`} 
              className="flex items-center space-x-1.5 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              <PhoneCall className="w-3.5 h-3.5" />
              <span>Helpline: {emergencyHotline}</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mt-1">
          
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
              <Activity className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-xl font-extrabold text-slate-900 tracking-tight">CarePlus</span>
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-100 text-blue-700 uppercase">HMS</span>
              </div>
              <p className="text-[11px] font-medium text-slate-500">Hospital Management System</p>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-700">
            <Link to="/" className="hover:text-blue-600 transition-colors text-blue-600">Home</Link>
            <a href="#features" className="hover:text-blue-600 transition-colors">Features</a>
            <a href="#departments" className="hover:text-blue-600 transition-colors">Departments</a>
            <a href="#doctors" className="hover:text-blue-600 transition-colors">Doctors</a>
            <a href="#testimonials" className="hover:text-blue-600 transition-colors">Reviews</a>
            <a href="#contact" className="hover:text-blue-600 transition-colors">Contact</a>
          </nav>

          {/* Action Buttons: Real-time Auth User or Guest Login/Register */}
          <div className="hidden md:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="flex items-center space-x-3">
                {/* Real-time Logged-in User Welcome Badge */}
                <div className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-blue-50 border border-blue-100 text-xs">
                  <div className="w-7 h-7 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                    {user.name ? user.name[0].toUpperCase() : 'U'}
                  </div>
                  <div>
                    <p className="font-bold text-slate-900 leading-tight">👋 {user.name}</p>
                    <span className="text-[9px] font-extrabold uppercase text-blue-600">{user.role}</span>
                  </div>
                </div>

                {/* Dashboard Link */}
                <Link
                  to={getDashboardForRole(user.role)}
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>

                {/* Logout Button */}
                <button
                  onClick={handleLogout}
                  className="p-2 rounded-xl text-slate-500 hover:text-rose-600 hover:bg-rose-50 border border-slate-200 transition-all"
                  title="Sign Out / Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <>
                {/* Login Button */}
                <Link
                  to="/login"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 hover:text-blue-600 hover:bg-slate-100 transition-all border border-slate-200 shadow-sm"
                >
                  <UserCheck className="w-4 h-4 text-blue-600" />
                  <span>Login</span>
                </Link>

                {/* Register Button */}
                <Link
                  to="/register"
                  className="flex items-center space-x-1.5 px-4 py-2 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 transition-all border border-blue-200 shadow-sm"
                >
                  <UserPlus className="w-4 h-4 text-blue-600" />
                  <span>Register</span>
                </Link>

                {/* Book Appointment CTA */}
                <button
                  onClick={onOpenBooking}
                  className="flex items-center space-x-2 px-5 py-2 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-md shadow-blue-500/20 hover:shadow-blue-500/35 hover:-translate-y-0.5 transition-all"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile Menu Hamburger */}
          <div className="lg:hidden flex items-center space-x-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 px-4 pt-3 pb-6 space-y-3 mt-2 shadow-xl animate-in slide-in-from-top duration-200">
          <nav className="flex flex-col space-y-1.5 text-sm font-medium text-slate-700">
            <Link 
              to="/" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl bg-blue-50 text-blue-600 font-bold flex items-center justify-between"
            >
              <span>Home</span>
              <ChevronRight className="w-4 h-4" />
            </Link>
            <a 
              href="#features" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Features</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a 
              href="#departments" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Departments</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a 
              href="#doctors" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Doctors</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a 
              href="#testimonials" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Reviews</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
            <a 
              href="#contact" 
              onClick={() => setMobileMenuOpen(false)}
              className="px-3.5 py-2.5 rounded-xl hover:bg-slate-100 flex items-center justify-between"
            >
              <span>Contact</span>
              <ChevronRight className="w-4 h-4 text-slate-400" />
            </a>
          </nav>
          
          <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
            {isAuthenticated ? (
              <div className="space-y-2">
                <div className="p-3 bg-blue-50 rounded-xl text-xs font-bold text-slate-800">
                  Logged in as: {user.name} ({user.role.toUpperCase()})
                </div>
                <Link
                  to={getDashboardForRole(user.role)}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-blue-600"
                >
                  <LayoutDashboard className="w-4 h-4" />
                  <span>My Dashboard</span>
                </Link>
                <button
                  onClick={() => { setMobileMenuOpen(false); handleLogout(); }}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl text-sm font-bold text-rose-600 bg-rose-50"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Logout</span>
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <Link 
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200"
                  >
                    <UserCheck className="w-4 h-4 text-blue-600" />
                    <span>Login</span>
                  </Link>

                  <Link 
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center justify-center space-x-1.5 px-4 py-2.5 rounded-xl text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-100 border border-blue-200"
                  >
                    <UserPlus className="w-4 h-4 text-blue-600" />
                    <span>Register</span>
                  </Link>
                </div>

                <button 
                  onClick={() => { setMobileMenuOpen(false); if (onOpenBooking) onOpenBooking(); }}
                  className="w-full flex items-center justify-center space-x-2 px-5 py-3 rounded-xl text-sm font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-md"
                >
                  <Calendar className="w-4 h-4" />
                  <span>Book Appointment Now</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}

    </header>
  );
};

export default Navbar;