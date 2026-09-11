import React, { useState } from 'react';
import { X, Shield, User, Lock, ArrowRight, UserPlus, UserCheck } from 'lucide-react';

export const DEMO_ROLES = [
  { key: 'admin', title: 'System Admin', email: 'admin@careplus-hms.com', icon: '👑', color: 'bg-purple-100 text-purple-800' },
  { key: 'doctor', title: 'Senior Doctor', email: 'dr.jenkins@careplus-hms.com', icon: '👨‍⚕️', color: 'bg-blue-100 text-blue-800' },
  { key: 'patient', title: 'Patient Account', email: 'patient@careplus-hms.com', icon: '🩺', color: 'bg-emerald-100 text-emerald-800' },
  { key: 'receptionist', title: 'Staff / Reception', email: 'staff@careplus-hms.com', icon: '📋', color: 'bg-amber-100 text-amber-800' }
];

export const AuthModal = ({ isOpen, onClose }) => {
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('patient');
  const [loggedInUser, setLoggedInUser] = useState(null);

  if (!isOpen) return null;

  const handleRoleLogin = (selectedRole) => {
    const r = DEMO_ROLES.find(item => item.key === selectedRole) || DEMO_ROLES[2];
    setLoggedInUser({
      name: r.title,
      email: r.email,
      role: r.key
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoggedInUser({
      name: name || 'CarePlus User',
      email: email || 'user@careplus-hms.com',
      role: role
    });
  };

  const handleReset = () => {
    setLoggedInUser(null);
    setEmail('');
    setPassword('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 relative">
        
        {/* Header */}
        <div className="bg-slate-900 p-6 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center shadow-lg shadow-blue-500/30">
              <Shield className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="text-lg font-bold">CarePlus HMS Portal</h3>
              <p className="text-xs text-slate-400">Authentication & Security</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {loggedInUser ? (
            <div className="text-center py-6 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <UserCheck className="w-10 h-10" />
              </div>
              <div>
                <span className="text-xs font-extrabold uppercase tracking-wider px-3 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Authentication Successful
                </span>
                <h4 className="text-xl font-bold text-slate-900 mt-3">{loggedInUser.name}</h4>
                <p className="text-xs text-slate-500">{loggedInUser.email}</p>
                <p className="text-xs font-bold text-blue-600 uppercase mt-1">Role: {loggedInUser.role}</p>
              </div>
              <button
                onClick={handleReset}
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
              >
                Continue to Dashboard
              </button>
            </div>
          ) : (
            <div className="space-y-5">
              
              {/* Tab Switcher */}
              <div className="flex border-b border-slate-200 bg-slate-50 rounded-xl p-1 text-xs font-bold text-slate-600">
                <button
                  onClick={() => setMode('login')}
                  className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                    mode === 'login' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  Account Login
                </button>
                <button
                  onClick={() => setMode('register')}
                  className={`flex-1 py-2 text-center rounded-lg transition-colors ${
                    mode === 'register' ? 'bg-white text-blue-600 shadow-sm' : 'hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {/* 1-Click Role Login Shortcuts */}
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">⚡ 1-Click Demo Login Roles</p>
                <div className="grid grid-cols-2 gap-2">
                  {DEMO_ROLES.map((r) => (
                    <button
                      key={r.key}
                      onClick={() => handleRoleLogin(r.key)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-blue-500 bg-slate-50 hover:bg-blue-50/50 flex items-center space-x-2 text-left transition-all"
                    >
                      <span className="text-lg">{r.icon}</span>
                      <div>
                        <p className="text-xs font-bold text-slate-900">{r.title}</p>
                        <span className={`text-[9px] font-extrabold uppercase px-1.5 py-0.2 rounded ${r.color}`}>
                          {r.key}
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-3 text-slate-400 text-[11px] font-semibold">Or enter details</span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-3">
                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text"
                      required
                      placeholder="e.g. Jane Doe"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Email Address</label>
                  <input 
                    type="email"
                    required
                    placeholder="user@careplus-hms.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Password</label>
                  <input 
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {mode === 'register' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Account Role</label>
                    <select
                      value={role}
                      onChange={(e) => setRole(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="patient">Patient Account</option>
                      <option value="doctor">Doctor / Physician</option>
                      <option value="receptionist">Receptionist / Staff</option>
                      <option value="admin">System Administrator</option>
                    </select>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full py-3 mt-2 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                >
                  {mode === 'login' ? 'Sign In to Portal' : 'Create Account'}
                </button>
              </form>

            </div>
          )}
        </div>

      </div>
    </div>
  );
};
