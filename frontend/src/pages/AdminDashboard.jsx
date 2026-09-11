import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, ShieldCheck, Users, DollarSign, Bed, Award, LogOut, Search, Plus, Lock } from 'lucide-react';

const mockDoctorsList = [
  { id: 'DOC-101', name: 'Dr. Sarah Jenkins, MD', department: 'Cardiology', status: 'Active', patients: 320, experience: '16 Yrs' },
  { id: 'DOC-102', name: 'Dr. Michael Chen, MD', department: 'Neurology', status: 'Active', patients: 284, experience: '14 Yrs' },
  { id: 'DOC-103', name: 'Dr. Emily Rodriguez, MD', department: 'Pediatrics', status: 'On Leave', patients: 410, experience: '11 Yrs' }
];

const mockAuditLogs = [
  { id: 'LOG-8801', action: 'Patient OPD Token Issued (#OPD-1082)', user: 'receptionist@careplus-hms.com', time: '10 mins ago', status: 'Success' },
  { id: 'LOG-8800', action: 'E-Prescription Signed (RX-7701)', user: 'dr.jenkins@careplus-hms.com', time: '45 mins ago', status: 'Success' },
  { id: 'LOG-8799', action: 'JWT Admin Session Initialized', user: 'admin@careplus-hms.com', time: '1 hour ago', status: 'Success' }
];

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [doctors, setDoctors] = useState(mockDoctorsList);
  const [auditLogs] = useState(mockAuditLogs);

  const handleLogout = () => {
    localStorage.removeItem('careplus_patient_token');
    localStorage.removeItem('careplus_patient_user');
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold shadow-md">
              👑
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">CarePlus <span className="text-purple-400">Admin Command Center</span></h2>
              <p className="text-[10px] text-slate-400">System Administration & Hospital Governance</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
              👑 Role: ADMIN
            </span>
            <button onClick={handleLogout} className="text-slate-300 hover:text-rose-400 text-xs font-bold flex items-center space-x-1">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-8">
        
        {/* System KPIs */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Monthly Revenue</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">$142,850</h3>
              <span className="text-[11px] font-bold text-emerald-600">+14% vs last month</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <DollarSign className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Bed Occupancy</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">82%</h3>
              <span className="text-[11px] font-bold text-purple-600">14 ICU Beds Available</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Bed className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Active Staff</p>
              <h3 className="text-2xl font-extrabold text-slate-900 mt-1">250+</h3>
              <span className="text-[11px] font-bold text-blue-600">35 Departments</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Users className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-slate-500 uppercase">Security Status</p>
              <h3 className="text-2xl font-extrabold text-emerald-600 mt-1">JWT Active</h3>
              <span className="text-[11px] font-bold text-slate-500">256-Bit Encrypted</span>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Doctor Roster Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-xl font-extrabold text-slate-900">Doctor & Specialist Roster</h3>
            <button className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs hover:bg-purple-700 transition-colors">
              + Add New Doctor
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase">
                <tr>
                  <th className="p-3">Doctor ID</th>
                  <th className="p-3">Full Name</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Experience</th>
                  <th className="p-3">Patients Cared For</th>
                  <th className="p-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-medium">
                {doctors.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50">
                    <td className="p-3 font-bold text-purple-600">{d.id}</td>
                    <td className="p-3 font-bold text-slate-900">{d.name}</td>
                    <td className="p-3 text-slate-600">{d.department}</td>
                    <td className="p-3 text-slate-600">{d.experience}</td>
                    <td className="p-3 text-slate-600">{d.patients}+ Patients</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                        d.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Audit Logs Table */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xl font-extrabold text-slate-900">System Security Audit Logs</h3>
          <div className="space-y-2">
            {auditLogs.map((l) => (
              <div key={l.id} className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between text-xs">
                <div>
                  <p className="font-bold text-slate-900">{l.action}</p>
                  <p className="text-[11px] text-slate-500">Triggered by: {l.user}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-extrabold bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded uppercase">
                    {l.status}
                  </span>
                  <p className="text-[10px] text-slate-400 mt-0.5">{l.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;
