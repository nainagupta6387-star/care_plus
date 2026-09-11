import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, Lock, User, Phone, CheckCircle2, AlertCircle, ArrowRight, HeartPulse, Calendar } from 'lucide-react';
import { useRegisterMutation } from '../hooks';

const RegisterPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || location.state?.from;

  const registerMutation = useRegisterMutation();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState('Male');
  const [bloodType, setBloodType] = useState('O+');
  const [role, setRole] = useState('patient'); // Default selected role: Patient

  const [showPassword, setShowPassword] = useState(false);
  const [agreed, setAgreed] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your input.');
      return;
    }

    try {
      // Send all registration fields to Express Backend API via TanStack Query mutation
      const res = await registerMutation.mutateAsync({
        name,
        email,
        phone,
        password,
        age: age ? Number(age) : 30,
        gender,
        bloodType,
        role,
      });

      const userRole = res.patient?.role || role;
      setSuccessMsg(`Account created successfully for ${res.patient?.name || name}! Redirecting...`);
      
      setTimeout(() => {
        if (redirectTarget) {
          navigate(decodeURIComponent(redirectTarget));
        } else if (userRole === 'patient') navigate('/patient-dashboard');
        else if (userRole === 'doctor') navigate('/doctor-dashboard');
        else if (userRole === 'admin') navigate('/admin-dashboard');
        else if (userRole === 'receptionist') navigate('/receptionist-dashboard');
        else navigate('/patient-dashboard');
      }, 1000);
    } catch (err) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-blue-950 via-slate-900 to-teal-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">CarePlus HMS</span>
            </Link>

            <div className="space-y-2 pt-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-teal-400 bg-teal-950/80 border border-teal-800 px-3 py-1 rounded-full">
                Multi-Role User Registration
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Create Your Account
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Register with your complete health demographics and role privilege (Patient, Doctor, or Receptionist).
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3 relative z-10">
            <div className="flex items-center space-x-2 text-teal-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>JWT Authentication & bcrypt Encryption</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">User Registration</h3>
                <p className="text-xs text-slate-500 mt-1">Fill out the fields below to create your HMS account</p>
              </div>
              <Link 
                to="/login" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Sign In
              </Link>
            </div>

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5">
              
              {/* 1. Name */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="text"
                    required
                    placeholder="e.g. Alexander Wright"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

              {/* 2. Email & 3. Phone */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="email"
                      required
                      placeholder="user@careplus.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type="tel"
                      required
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Age, 5. Gender & 6. Blood Type */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Age *</label>
                  <input 
                    type="number"
                    required
                    min="1"
                    max="120"
                    placeholder="e.g. 28"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Gender *</label>
                  <select
                    value={gender}
                    onChange={(e) => setGender(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Type *</label>
                  <select
                    value={bloodType}
                    onChange={(e) => setBloodType(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                  >
                    <option value="O+">O+</option>
                    <option value="O-">O-</option>
                    <option value="A+">A+</option>
                    <option value="A-">A-</option>
                    <option value="B+">B+</option>
                    <option value="B-">B-</option>
                    <option value="AB+">AB+</option>
                    <option value="AB-">AB-</option>
                  </select>
                </div>
              </div>

              {/* 7. Role Selection (Default: Patient) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Account Role *</label>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="patient">Patient (Default)</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>

              {/* 8. Password & Confirm Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Confirm Password *</label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                    <input 
                      type={showPassword ? 'text' : 'password'}
                      required
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                    />
                  </div>
                </div>
              </div>

              {/* Terms checkbox */}
              <div className="flex items-center space-x-2 pt-1">
                <input 
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <label htmlFor="terms" className="text-xs text-slate-600 cursor-pointer">
                  I agree to the CarePlus Terms of Service and Privacy Policy.
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={registerMutation.isPending || !agreed}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
              >
                {registerMutation.isPending ? (
                  <span>Registering Account...</span>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

            </form>
          </div>

          <div className="mt-6 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Already registered?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;
