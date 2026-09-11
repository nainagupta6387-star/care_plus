import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { Activity, ShieldCheck, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle2, AlertCircle, Calendar } from 'lucide-react';
import { useLoginMutation } from '../hooks';

const DEMO_ACCOUNTS = [
  { role: 'Patient', email: 'patient@careplus-hms.com', key: 'patient', icon: '🩺', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100' },
  { role: 'Doctor', email: 'dr.jenkins@careplus-hms.com', key: 'doctor', icon: '👨‍⚕️', color: 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100' },
  { role: 'Receptionist', email: 'staff@careplus-hms.com', key: 'receptionist', icon: '📋', color: 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' }
];

const LoginPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const redirectTarget = searchParams.get('redirect') || location.state?.from;

  const loginMutation = useLoginMutation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState('patient');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleDemoSelect = (acc) => {
    setEmail(acc.email);
    setPassword('demo12345');
    setSelectedRole(acc.key);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    try {
      // Call TanStack Query Mutation connecting to Express JWT Backend with email, password, and selected role
      const res = await loginMutation.mutateAsync({ email, password, role: selectedRole });
      
      const authenticatedRole = res.patient?.role || selectedRole;
      setSuccessMsg(`Welcome back, ${res.patient?.name || 'User'}! Logged in as ${authenticatedRole.toUpperCase()}.`);
      
      setTimeout(() => {
        if (redirectTarget) {
          navigate(decodeURIComponent(redirectTarget));
        } else if (authenticatedRole === 'patient') {
          navigate('/patient-dashboard');
        } else if (authenticatedRole === 'doctor') {
          navigate('/doctor-dashboard');
        } else if (authenticatedRole === 'receptionist') {
          navigate('/receptionist-dashboard');
        } else {
          navigate('/patient-dashboard');
        }
      }, 800);
    } catch (err) {
      setErrorMsg(err.message || 'Login failed. Please check your credentials and selected role.');
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-50">
      <div className="max-w-4xl w-full bg-white rounded-3xl shadow-2xl border border-slate-200/80 overflow-hidden grid grid-cols-1 lg:grid-cols-12">
        
        {/* Left Banner */}
        <div className="lg:col-span-5 bg-gradient-to-br from-slate-900 via-slate-800 to-blue-950 p-8 sm:p-10 text-white flex flex-col justify-between relative overflow-hidden">
          <div className="space-y-6 relative z-10">
            <Link to="/" className="inline-flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-500 to-teal-500 flex items-center justify-center text-white shadow-lg">
                <Activity className="w-6 h-6 stroke-[2.5]" />
              </div>
              <span className="text-xl font-extrabold tracking-tight">CarePlus HMS</span>
            </Link>

            <div className="space-y-2 pt-4">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-cyan-400 bg-cyan-950/80 border border-cyan-800 px-3 py-1 rounded-full">
                Role-Based Authentication
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Role-Protected System Access
              </h2>
              <p className="text-slate-300 text-xs leading-relaxed">
                Backend-verified role authentication with JWT session tokens for Patient, Doctor, and Receptionist portals.
              </p>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-slate-800 space-y-3 relative z-10">
            <div className="flex items-center space-x-2 text-emerald-400 text-xs font-bold">
              <ShieldCheck className="w-4 h-4" />
              <span>JWT Session & Role Validation</span>
            </div>
          </div>
        </div>

        {/* Right Form */}
        <div className="lg:col-span-7 p-8 sm:p-10 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <h3 className="text-2xl font-extrabold text-slate-900">Sign In to Your Account</h3>
                <p className="text-xs text-slate-500 mt-1">Select your account role and enter credentials</p>
              </div>
              <Link 
                to="/register" 
                className="text-xs font-bold text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors"
              >
                Register
              </Link>
            </div>

            {redirectTarget && (
              <div className="mb-5 p-4 rounded-2xl bg-blue-50 border border-blue-200 text-blue-900 text-xs font-semibold flex items-center space-x-3 shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center shrink-0 font-bold">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-bold text-slate-900">Sign in to complete appointment booking</p>
                  <p className="text-[11px] text-blue-700">Once logged in, you will be automatically redirected to continue booking.</p>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Demo Account Fill Buttons */}
            <div className="mb-6 space-y-2">
              <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                ⚡ 1-Click Demo Roles (Instant Fill)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.key}
                    type="button"
                    onClick={() => handleDemoSelect(acc)}
                    className={`p-2.5 rounded-xl border text-left flex items-center space-x-2.5 transition-all shadow-sm ${acc.color} ${
                      selectedRole === acc.key ? 'ring-2 ring-blue-500 font-bold' : ''
                    }`}
                  >
                    <span className="text-lg">{acc.icon}</span>
                    <div className="truncate">
                      <p className="text-xs font-bold leading-tight">{acc.role}</p>
                      <p className="text-[10px] opacity-75 truncate">{acc.email}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              
              {/* Select Login Role Dropdown */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Select Login Role *</label>
                <select
                  value={selectedRole}
                  onChange={(e) => setSelectedRole(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white font-semibold text-slate-800"
                >
                  <option value="patient">Patient (Default)</option>
                  <option value="doctor">Doctor</option>
                  <option value="receptionist">Receptionist</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                  <input 
                    type="email"
                    required
                    placeholder="patient@careplus-hms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                </div>
              </div>

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
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-slate-50/50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginMutation.isPending}
                className="w-full py-3.5 mt-2 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center justify-center space-x-2"
              >
                {loginMutation.isPending ? (
                  <span>Verifying Credentials & Role...</span>
                ) : (
                  <>
                    <span>Sign In via Express Backend</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          </div>

          <div className="mt-8 pt-4 border-t border-slate-100 text-center text-xs text-slate-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Register New Patient
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default LoginPage;
