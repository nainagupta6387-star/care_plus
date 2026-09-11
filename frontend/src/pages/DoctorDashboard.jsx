import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, Stethoscope, Calendar, Clock, UserCheck, Pill, FileText, CheckCircle2, LogOut, Search, Plus, Menu } from 'lucide-react';

const mockDoctorAppointments = [
  { id: 'APT-1082', patientName: 'Alexander Wright', age: 34, gender: 'Male', time: '10:30 AM', type: 'Cardiology Follow-up', status: 'In Consultation', priority: 'High' },
  { id: 'APT-1090', patientName: 'Maria Garcia', age: 42, gender: 'Female', time: '11:15 AM', type: 'Chest Pain Evaluation', status: 'Waiting', priority: 'Emergency' },
  { id: 'APT-1104', patientName: 'David Thorne', age: 58, gender: 'Male', time: '02:00 PM', type: 'Routine ECG Check', status: 'Scheduled', priority: 'Routine' }
];

const DoctorDashboard = () => {
  const navigate = useNavigate();
  const [appointments, setAppointments] = useState(mockDoctorAppointments);
  const [activePatient, setActivePatient] = useState(mockDoctorAppointments[0]);
  const [rxDrug, setRxDrug] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxNotes, setRxNotes] = useState('');
  const [rxIssued, setRxIssued] = useState(false);

  const handleIssueRx = (e) => {
    e.preventDefault();
    setRxIssued(true);
    setTimeout(() => {
      setRxIssued(false);
      setRxDrug('');
      setRxDosage('');
      setRxNotes('');
      alert('E-Prescription successfully signed and synced with Pharmacy!');
    }, 1000);
  };

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
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">CarePlus <span className="text-sky-400">Doctor Console</span></h2>
              <p className="text-[10px] text-slate-400">Dr. Sarah Jenkins, MD • Chief of Cardiology</p>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              👨‍⚕️ Role: DOCTOR
            </span>
            <button onClick={handleLogout} className="text-slate-300 hover:text-rose-400 text-xs font-bold flex items-center space-x-1">
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Appointments Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900">Today's OPD Queue</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg">3 Patients Waiting</span>
          </div>

          <div className="space-y-3">
            {appointments.map((apt) => (
              <div 
                key={apt.id}
                onClick={() => setActivePatient(apt)}
                className={`p-5 rounded-3xl border text-left cursor-pointer transition-all ${
                  activePatient.id === apt.id 
                    ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20' 
                    : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300'
                }`}
              >
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-bold text-base">{apt.patientName}</h4>
                    <p className={`text-xs ${activePatient.id === apt.id ? 'text-blue-100' : 'text-slate-500'}`}>
                      {apt.age} yrs • {apt.gender} • {apt.type}
                    </p>
                  </div>
                  <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase ${
                    apt.priority === 'Emergency' ? 'bg-rose-500 text-white' : 'bg-emerald-500 text-white'
                  }`}>
                    {apt.priority}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs pt-2 border-t border-white/20">
                  <span className="flex items-center space-x-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{apt.time}</span>
                  </span>
                  <span className="font-bold">Token #{apt.id}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Doctor Consultation Desk & E-Prescription Creator */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Active Patient Details Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg">
                  {activePatient.patientName.split(' ').map(n=>n[0]).join('')}
                </div>
                <div>
                  <h3 className="font-extrabold text-slate-900 text-lg">{activePatient.patientName}</h3>
                  <p className="text-xs text-slate-500">Patient ID: {activePatient.id} • {activePatient.type}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800">
                In Consultation
              </span>
            </div>

            {/* Vitals Summary */}
            <div className="grid grid-cols-3 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
              <div>
                <span className="text-slate-400 block font-semibold">Blood Pressure</span>
                <strong className="text-slate-800 text-sm">120 / 80 mmHg</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Heart Rate</span>
                <strong className="text-slate-800 text-sm">72 BPM</strong>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold">Blood Oxygen</span>
                <strong className="text-emerald-600 text-sm">99% SpO2</strong>
              </div>
            </div>
          </div>

          {/* E-Prescription Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
              <Pill className="w-5 h-5 text-blue-600" />
              <span>Issue Digital E-Prescription</span>
            </div>

            <form onSubmit={handleIssueRx} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atorvastatin 20mg"
                    value={rxDrug}
                    onChange={(e) => setRxDrug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Frequency *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Tablet once daily"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Take after dinner. Follow up after 15 days."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
                ></textarea>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center space-x-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Sign & Issue Digital E-Prescription</span>
              </button>
            </form>
          </div>

        </div>

      </div>
    </div>
  );
};

export default DoctorDashboard;
