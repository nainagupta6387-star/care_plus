import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Stethoscope,
  Calendar,
  Clock,
  UserCheck,
  Pill,
  FileText,
  CheckCircle2,
  LogOut,
  Search,
  Plus,
  Menu,
  ShieldCheck,
  AlertCircle,
  Edit3,
  X,
  User,
  Heart,
  Thermometer,
  Zap,
  RefreshCw,
  Eye,
  Sparkles,
  Phone,
  Mail,
  ChevronRight
} from 'lucide-react';
import {
  useAllAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  usePrescriptionsQuery,
  usePatientPrescriptionsQuery,
  useCreatePrescriptionMutation,
  useUpdateProfileMutation,
} from '../hooks';
import { logoutUser } from '../api';

const fallbackAppointments = [
  {
    _id: 'mem-apt-1082',
    id: 'APT-1082',
    tokenNumber: 'OPD-1082',
    patientId: 'PT-9801',
    patientName: 'Alexander Wright',
    patientEmail: 'patient@careplus-hms.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    time: '10:30 AM',
    timeSlot: '10:30 AM',
    date: new Date().toISOString().split('T')[0],
    type: 'Cardiology Follow-up',
    status: 'In Consultation',
    priority: 'High',
    age: 34,
    gender: 'Male',
    vitals: {
      bloodPressure: '120 / 80 mmHg',
      heartRate: '72 BPM',
      spo2: '99% SpO2',
      temperature: '98.4 °F'
    },
    reason: 'Follow-up on hyperlipidemia & mild hypertension'
  },
  {
    _id: 'mem-apt-1090',
    id: 'APT-1090',
    tokenNumber: 'OPD-1090',
    patientId: 'PT-9802',
    patientName: 'Maria Garcia',
    patientEmail: 'maria.garcia@gmail.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    time: '11:15 AM',
    timeSlot: '11:15 AM',
    date: new Date().toISOString().split('T')[0],
    type: 'Chest Pain Evaluation',
    status: 'Waiting',
    priority: 'Emergency',
    age: 42,
    gender: 'Female',
    vitals: {
      bloodPressure: '135 / 88 mmHg',
      heartRate: '88 BPM',
      spo2: '97% SpO2',
      temperature: '99.1 °F'
    },
    reason: 'Acute retrosternal discomfort after exertion'
  },
  {
    _id: 'mem-apt-1104',
    id: 'APT-1104',
    tokenNumber: 'OPD-1104',
    patientId: 'PT-9803',
    patientName: 'David Thorne',
    patientEmail: 'david.thorne@yahoo.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    time: '02:00 PM',
    timeSlot: '02:00 PM',
    date: new Date().toISOString().split('T')[0],
    type: 'Routine ECG Check',
    status: 'Upcoming',
    priority: 'Routine',
    age: 58,
    gender: 'Male',
    vitals: {
      bloodPressure: '118 / 76 mmHg',
      heartRate: '68 BPM',
      spo2: '98% SpO2',
      temperature: '98.6 °F'
    },
    reason: 'Annual preventive cardiovascular checkup'
  }
];

const DoctorDashboard = () => {
  const navigate = useNavigate();

  // Load authenticated Doctor session
  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const loggedDoctor = useMemo(() => {
    try {
      return storedUserJson ? JSON.parse(storedUserJson) : null;
    } catch {
      return null;
    }
  }, [storedUserJson]);

  const doctorName = loggedDoctor?.name || 'Dr. Sarah Jenkins, MD';
  const doctorSpecialty = loggedDoctor?.specialty || 'Chief of Cardiology';
  const doctorDepartment = loggedDoctor?.department || 'Cardiology & Heart Care';
  const doctorEmail = loggedDoctor?.email || 'dr.jenkins@careplus-hms.com';
  const doctorPhone = loggedDoctor?.phone || '+1 (555) 345-6789';
  const doctorRoom = loggedDoctor?.roomNumber || 'OPD-102';

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [queueFilter, setQueueFilter] = useState('All'); // 'All', 'Waiting', 'In Consultation', 'Completed'
  const [selectedPatientId, setSelectedPatientId] = useState(null);

  // E-Prescription Form State
  const [rxDrug, setRxDrug] = useState('');
  const [rxDosage, setRxDosage] = useState('');
  const [rxDuration, setRxDuration] = useState('30 Days');
  const [rxNotes, setRxNotes] = useState('');
  const [rxIssued, setRxIssued] = useState(false);
  const [rxSuccessMsg, setRxSuccessMsg] = useState('');
  const [rxErrorMsg, setRxErrorMsg] = useState('');

  // Status and Feedback
  const [statusFeedback, setStatusFeedback] = useState('');

  // Vitals Edit Modal State
  const [vitalsModalOpen, setVitalsModalOpen] = useState(false);
  const [editBp, setEditBp] = useState('120 / 80 mmHg');
  const [editHr, setEditHr] = useState('72 BPM');
  const [editSpo2, setEditSpo2] = useState('99% SpO2');
  const [editTemp, setEditTemp] = useState('98.6 °F');

  // Doctor Profile Modal State
  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [profName, setProfName] = useState(doctorName);
  const [profPhone, setProfPhone] = useState(doctorPhone);
  const [profSpecialty, setProfSpecialty] = useState(doctorSpecialty);
  const [profDept, setProfDept] = useState(doctorDepartment);
  const [profRoom, setProfRoom] = useState(doctorRoom);
  const [profileSaveSuccess, setProfileSaveSuccess] = useState('');

  // Queries & Mutations
  const { data: fetchedAppointments, isLoading: isAptsLoading } = useAllAppointmentsQuery();
  const updateStatusMutation = useUpdateAppointmentStatusMutation();
  const createRxMutation = useCreatePrescriptionMutation();
  const updateProfileMutation = useUpdateProfileMutation();

  // Unified appointments list with fallback
  const appointments = useMemo(() => {
    if (Array.isArray(fetchedAppointments) && fetchedAppointments.length > 0) {
      return fetchedAppointments;
    }
    return fallbackAppointments;
  }, [fetchedAppointments]);

  // Filtered queue
  const filteredAppointments = useMemo(() => {
    return appointments.filter((apt) => {
      const pName = (apt.patientName || '').toLowerCase();
      const token = (apt.tokenNumber || apt.id || '').toLowerCase();
      const type = (apt.type || '').toLowerCase();
      const q = searchQuery.toLowerCase();

      const matchesSearch = pName.includes(q) || token.includes(q) || type.includes(q);

      if (!matchesSearch) return false;

      if (queueFilter === 'All') return true;
      if (queueFilter === 'Waiting') return apt.status === 'Waiting' || apt.status === 'Upcoming' || apt.status === 'Confirmed';
      if (queueFilter === 'In Consultation') return apt.status === 'In Consultation';
      if (queueFilter === 'Completed') return apt.status === 'Completed';

      return true;
    });
  }, [appointments, searchQuery, queueFilter]);

  // Active Patient calculation
  const activePatient = useMemo(() => {
    if (selectedPatientId) {
      const found = appointments.find(
        (a) => (a._id && a._id === selectedPatientId) ||
               (a.tokenNumber && a.tokenNumber === selectedPatientId) ||
               (a.id && a.id === selectedPatientId)
      );
      if (found) return found;
    }
    // Default to first active appointment (preferably In Consultation or Waiting)
    const inConsult = appointments.find((a) => a.status === 'In Consultation');
    if (inConsult) return inConsult;
    return appointments[0] || fallbackAppointments[0];
  }, [appointments, selectedPatientId]);

  // Sync vitals edit state whenever active patient changes
  useEffect(() => {
    if (activePatient?.vitals) {
      setEditBp(activePatient.vitals.bloodPressure || '120 / 80 mmHg');
      setEditHr(activePatient.vitals.heartRate || '72 BPM');
      setEditSpo2(activePatient.vitals.spo2 || '99% SpO2');
      setEditTemp(activePatient.vitals.temperature || '98.6 °F');
    }
  }, [activePatient]);

  // Fetch real Prescription History for active patient
  const { data: patientPrescriptions, isLoading: isRxLoading } = usePatientPrescriptionsQuery(
    activePatient?.patientId || activePatient?.patientEmail || activePatient?.patientName
  );

  // Status Change Handler
  const handleStatusChange = async (newStatus) => {
    if (!activePatient) return;
    setStatusFeedback('');
    const targetId = activePatient._id || activePatient.tokenNumber || activePatient.id;

    try {
      await updateStatusMutation.mutateAsync({
        id: targetId,
        status: newStatus
      });
      setStatusFeedback(`Status updated to "${newStatus}"`);
      setTimeout(() => setStatusFeedback(''), 3000);
    } catch (err) {
      setStatusFeedback(`Error updating status: ${err.message}`);
    }
  };

  // Vitals Save Handler
  const handleSaveVitals = async (e) => {
    e.preventDefault();
    if (!activePatient) return;
    const targetId = activePatient._id || activePatient.tokenNumber || activePatient.id;

    try {
      await updateStatusMutation.mutateAsync({
        id: targetId,
        vitals: {
          bloodPressure: editBp,
          heartRate: editHr,
          spo2: editSpo2,
          temperature: editTemp
        }
      });
      setVitalsModalOpen(false);
      setStatusFeedback('Vitals recorded successfully!');
      setTimeout(() => setStatusFeedback(''), 3000);
    } catch (err) {
      alert('Failed to update vitals: ' + err.message);
    }
  };

  // E-Prescription Submission Handler
  const handleIssueRx = async (e) => {
    e.preventDefault();
    setRxErrorMsg('');
    setRxSuccessMsg('');

    if (!rxDrug.trim() || !rxDosage.trim()) {
      setRxErrorMsg('Please fill in Medication Name and Dosage Frequency.');
      return;
    }

    setRxIssued(true);

    try {
      const res = await createRxMutation.mutateAsync({
        appointmentId: activePatient._id || activePatient.id || '',
        tokenNumber: activePatient.tokenNumber || activePatient.id || '',
        patientId: activePatient.patientId || 'PT-9801',
        patientName: activePatient.patientName || 'Alexander Wright',
        patientEmail: activePatient.patientEmail || '',
        doctor: doctorName,
        doctorEmail: doctorEmail,
        department: doctorDepartment,
        medicationName: rxDrug.trim(),
        dosage: rxDosage.trim(),
        frequency: rxDosage.trim(),
        duration: rxDuration || '30 Days',
        notes: rxNotes.trim(),
        diagnosis: activePatient.type || 'Clinical OPD Consultation',
        vitals: activePatient.vitals || {
          bloodPressure: editBp,
          heartRate: editHr,
          spo2: editSpo2,
          temperature: editTemp
        }
      });

      setRxSuccessMsg(`E-Prescription ${res.prescription?.rxNumber || ''} signed & synced with Pharmacy!`);
      setRxDrug('');
      setRxDosage('');
      setRxNotes('');
      setRxDuration('30 Days');

      setTimeout(() => {
        setRxSuccessMsg('');
      }, 5000);
    } catch (err) {
      setRxErrorMsg(err.message || 'Failed to sign prescription. Please try again.');
    } finally {
      setRxIssued(false);
    }
  };

  // Doctor Profile Update Handler
  const handleSaveProfile = async (e) => {
    e.preventDefault();
    setProfileSaveSuccess('');

    try {
      await updateProfileMutation.mutateAsync({
        name: profName,
        phone: profPhone,
        specialty: profSpecialty,
        department: profDept,
        roomNumber: profRoom
      });
      setProfileSaveSuccess('Profile updated successfully!');
      setTimeout(() => {
        setProfileSaveSuccess('');
        setProfileModalOpen(false);
      }, 1200);
    } catch (err) {
      alert('Failed to update profile: ' + err.message);
    }
  };

  // Logout Handler
  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const waitingCount = useMemo(() => {
    return appointments.filter((a) => ['Waiting', 'Upcoming', 'Confirmed'].includes(a.status)).length;
  }, [appointments]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      
      {/* Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500 text-white flex items-center justify-center font-bold shadow-md">
              <Stethoscope className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="font-extrabold text-base tracking-tight">CarePlus <span className="text-sky-400">Doctor Console</span></h2>
              <button 
                onClick={() => setProfileModalOpen(true)}
                className="text-[10px] text-slate-300 hover:text-sky-300 text-left flex items-center space-x-1 transition-colors"
                title="Click to view/edit doctor profile"
              >
                <span>{doctorName} • {doctorSpecialty}</span>
                <Edit3 className="w-2.5 h-2.5 opacity-70" />
              </button>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <button
              onClick={() => setProfileModalOpen(true)}
              className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 transition-all flex items-center space-x-1.5"
            >
              <span>👨‍⚕️ Role: DOCTOR</span>
            </button>
            <button 
              onClick={handleLogout} 
              className="text-slate-300 hover:text-rose-400 text-xs font-bold flex items-center space-x-1.5 transition-colors px-2 py-1 rounded-lg hover:bg-slate-800"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Today's Appointments Queue */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-extrabold text-slate-900">Today's OPD Queue</h3>
            <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-100">
              {waitingCount} Patients Waiting
            </span>
          </div>

          {/* Search & Filter Ribbon */}
          <div className="space-y-2">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search patient name, token # or case..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none placeholder-slate-400 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-[11px] font-bold">
              {['All', 'Waiting', 'In Consultation', 'Completed'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setQueueFilter(tab)}
                  className={`flex-1 py-1 rounded-lg transition-all ${
                    queueFilter === tab
                      ? 'bg-white text-blue-600 shadow-sm font-extrabold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Patient Cards List */}
          <div className="space-y-3 max-h-[calc(100vh-280px)] overflow-y-auto pr-1">
            {filteredAppointments.length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-dashed border-slate-200 text-center text-slate-400 space-y-2">
                <UserCheck className="w-8 h-8 mx-auto text-slate-300" />
                <p className="text-xs font-bold text-slate-600">No appointments found in this view</p>
                <p className="text-[11px]">Adjust your search query or queue filter</p>
              </div>
            ) : (
              filteredAppointments.map((apt) => {
                const isSelected =
                  (activePatient._id && apt._id && activePatient._id === apt._id) ||
                  (activePatient.tokenNumber && apt.tokenNumber && activePatient.tokenNumber === apt.tokenNumber) ||
                  (activePatient.id && apt.id && activePatient.id === apt.id);

                const priorityColor =
                  apt.priority === 'Emergency'
                    ? 'bg-rose-500 text-white'
                    : apt.priority === 'High'
                    ? 'bg-amber-500 text-white'
                    : 'bg-emerald-500 text-white';

                const statusColor =
                  apt.status === 'In Consultation'
                    ? isSelected ? 'bg-blue-500 text-white' : 'bg-blue-100 text-blue-800'
                    : apt.status === 'Completed'
                    ? isSelected ? 'bg-emerald-500 text-white' : 'bg-emerald-100 text-emerald-800'
                    : isSelected ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-700';

                return (
                  <div
                    key={apt._id || apt.tokenNumber || apt.id}
                    onClick={() => setSelectedPatientId(apt._id || apt.tokenNumber || apt.id)}
                    className={`p-5 rounded-3xl border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xl shadow-blue-600/20 ring-2 ring-blue-400/50'
                        : 'bg-white text-slate-800 border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h4 className="font-bold text-base flex items-center space-x-2">
                          <span>{apt.patientName}</span>
                          {apt.status === 'In Consultation' && (
                            <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                          )}
                        </h4>
                        <p className={`text-xs ${isSelected ? 'text-blue-100' : 'text-slate-500'}`}>
                          {apt.age || 34} yrs • {apt.gender || 'Male'} • {apt.type || 'OPD Consultation'}
                        </p>
                      </div>
                      <div className="flex flex-col items-end space-y-1">
                        <span className={`px-2 py-0.5 text-[10px] font-extrabold rounded-md uppercase tracking-wider ${priorityColor}`}>
                          {apt.priority || 'Normal'}
                        </span>
                        <span className={`px-1.5 py-0.5 text-[9px] font-bold rounded ${statusColor}`}>
                          {apt.status || 'Waiting'}
                        </span>
                      </div>
                    </div>

                    <div className={`flex justify-between items-center text-xs pt-2 border-t ${
                      isSelected ? 'border-white/20' : 'border-slate-100'
                    }`}>
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>{apt.timeSlot || apt.time || '10:30 AM'}</span>
                      </span>
                      <span className="font-bold">Token #{apt.tokenNumber || apt.id}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Doctor Consultation Desk, Vitals, E-Prescription & History */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Status Feedback Toast */}
          {statusFeedback && (
            <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center justify-between shadow-sm animate-fade-in">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{statusFeedback}</span>
              </div>
              <button onClick={() => setStatusFeedback('')} className="text-emerald-700 hover:text-emerald-900">
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* Active Patient Details Banner */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-100 gap-3">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-lg shadow-inner">
                  {(activePatient.patientName || 'Patient')
                    .split(' ')
                    .map((n) => n[0])
                    .join('')
                    .toUpperCase()
                    .substring(0, 2)}
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-extrabold text-slate-900 text-lg">{activePatient.patientName}</h3>
                    <span className="text-xs text-slate-400 font-semibold">({activePatient.age || 34} yrs, {activePatient.gender || 'Male'})</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    Patient ID: <span className="font-bold text-slate-700">{activePatient.patientId || 'PT-9801'}</span> • {activePatient.type || 'OPD Consultation'}
                  </p>
                </div>
              </div>

              {/* Consultation Status Action Controls */}
              <div className="flex items-center space-x-2">
                {activePatient.status !== 'In Consultation' ? (
                  <button
                    onClick={() => handleStatusChange('In Consultation')}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <Activity className="w-3.5 h-3.5" />
                    <span>Start Consultation</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStatusChange('Completed')}
                    disabled={updateStatusMutation.isPending}
                    className="px-3.5 py-1.5 rounded-xl text-xs font-extrabold bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm transition-all flex items-center space-x-1.5 disabled:opacity-50"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Complete Consultation</span>
                  </button>
                )}

                <select
                  value={activePatient.status || 'Waiting'}
                  onChange={(e) => handleStatusChange(e.target.value)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Waiting">Waiting</option>
                  <option value="In Consultation">In Consultation</option>
                  <option value="Completed">Completed</option>
                  <option value="Rescheduled">Rescheduled</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Clinical Reason / Chief Complaint if available */}
            {activePatient.reason && (
              <div className="text-xs bg-amber-50/70 border border-amber-100 p-3 rounded-2xl text-amber-900 flex items-start space-x-2">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">Chief Complaint:</span> {activePatient.reason}
                </div>
              </div>
            )}

            {/* Vitals Summary with Live Edit Trigger */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-700 flex items-center space-x-1.5">
                  <Activity className="w-3.5 h-3.5 text-blue-600" />
                  <span>Patient Live Vitals</span>
                </span>
                <button
                  onClick={() => setVitalsModalOpen(true)}
                  className="text-blue-600 hover:text-blue-700 font-bold flex items-center space-x-1 text-[11px] bg-blue-50 hover:bg-blue-100 px-2.5 py-1 rounded-lg transition-colors"
                >
                  <Edit3 className="w-3 h-3" />
                  <span>Update Vitals</span>
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-slate-600 bg-slate-50 p-4 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Blood Pressure</span>
                  <strong className="text-slate-800 text-sm">{activePatient.vitals?.bloodPressure || '120 / 80 mmHg'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Heart Rate</span>
                  <strong className="text-slate-800 text-sm flex items-center space-x-1">
                    <span>{activePatient.vitals?.heartRate || '72 BPM'}</span>
                    <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
                  </strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Blood Oxygen</span>
                  <strong className="text-emerald-600 text-sm">{activePatient.vitals?.spo2 || '99% SpO2'}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold text-[11px]">Temperature</span>
                  <strong className="text-slate-800 text-sm flex items-center space-x-1">
                    <span>{activePatient.vitals?.temperature || '98.6 °F'}</span>
                    <Thermometer className="w-3 h-3 text-amber-500" />
                  </strong>
                </div>
              </div>
            </div>
          </div>

          {/* E-Prescription Form */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between text-slate-900 font-bold text-base">
              <div className="flex items-center space-x-2">
                <Pill className="w-5 h-5 text-blue-600" />
                <span>Issue Digital E-Prescription</span>
              </div>
              <span className="text-xs font-semibold text-slate-400">
                Prescribing for: <strong className="text-slate-700">{activePatient.patientName}</strong>
              </span>
            </div>

            {rxSuccessMsg && (
              <div className="p-3.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2 shadow-sm">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{rxSuccessMsg}</span>
              </div>
            )}

            {rxErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                <span>{rxErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleIssueRx} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Medication Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Atorvastatin 20mg"
                    value={rxDrug}
                    onChange={(e) => setRxDrug(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Dosage Frequency *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 1 Tab daily at bedtime"
                    value={rxDosage}
                    onChange={(e) => setRxDosage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-1">
                  <label className="block text-xs font-bold text-slate-700 mb-1">Duration</label>
                  <select
                    value={rxDuration}
                    onChange={(e) => setRxDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none bg-white transition-all"
                  >
                    <option value="5 Days">5 Days</option>
                    <option value="7 Days">7 Days</option>
                    <option value="15 Days">15 Days</option>
                    <option value="30 Days">30 Days</option>
                    <option value="60 Days">60 Days</option>
                    <option value="90 Days">90 Days</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Instructions & Notes</label>
                <textarea
                  rows="3"
                  placeholder="e.g. Take after dinner with water. Maintain low-sodium diet and review lipid profile after 30 days."
                  value={rxNotes}
                  onChange={(e) => setRxNotes(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none transition-all"
                ></textarea>
              </div>

              <button
                type="submit"
                disabled={rxIssued || createRxMutation.isPending}
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center space-x-2 disabled:opacity-60 cursor-pointer"
              >
                {rxIssued || createRxMutation.isPending ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Signing & Encrypting Digital Rx...</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Sign & Issue Digital E-Prescription</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Patient Prescription History Section */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2 text-slate-900 font-bold text-base">
                <FileText className="w-5 h-5 text-blue-600" />
                <span>Prescription History for {activePatient.patientName}</span>
              </div>
              <span className="text-xs font-bold text-slate-400">
                {patientPrescriptions?.length || 0} Records
              </span>
            </div>

            {isRxLoading ? (
              <div className="py-6 text-center text-xs text-slate-400 flex items-center justify-center space-x-2">
                <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
                <span>Loading prescription history...</span>
              </div>
            ) : !patientPrescriptions || patientPrescriptions.length === 0 ? (
              <div className="py-6 text-center text-xs text-slate-400 space-y-1">
                <Pill className="w-6 h-6 mx-auto text-slate-300" />
                <p className="font-semibold text-slate-600">No previous prescriptions found</p>
                <p className="text-[11px]">Issue the first digital prescription using the form above.</p>
              </div>
            ) : (
              <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
                {patientPrescriptions.map((rx) => (
                  <div
                    key={rx._id || rx.rxNumber}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left space-y-2.5 transition-all hover:border-blue-200"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-lg text-xs font-extrabold bg-blue-100 text-blue-800">
                          {rx.rxNumber}
                        </span>
                        <span className="text-xs font-semibold text-slate-500">
                          {rx.date}
                        </span>
                      </div>
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded bg-emerald-100 text-emerald-800">
                        {rx.status || 'Active'}
                      </span>
                    </div>

                    {/* Medications List */}
                    <div className="space-y-1.5 pt-1">
                      {rx.medications && rx.medications.map((med, mIdx) => (
                        <div key={mIdx} className="text-xs bg-white p-2.5 rounded-xl border border-slate-100 flex justify-between items-center">
                          <span className="font-bold text-slate-800">{med.name}</span>
                          <span className="text-slate-500 text-[11px] font-medium">
                            {med.dosage} • {med.frequency} {med.duration ? `(${med.duration})` : ''}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Doctor Notes */}
                    {rx.notes && (
                      <p className="text-[11px] text-slate-600 bg-blue-50/50 p-2 rounded-lg border border-blue-100/50">
                        <strong className="text-slate-700">Instructions:</strong> {rx.notes}
                      </p>
                    )}

                    <div className="flex justify-between items-center text-[10px] text-slate-400 pt-1 border-t border-slate-200">
                      <span>Signed by: <strong className="text-slate-600">{rx.doctor}</strong></span>
                      <span>Department: {rx.department || 'Cardiology'}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Vitals Update Modal */}
      {vitalsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                  <Activity className="w-4 h-4" />
                </div>
                <h4 className="font-bold text-base text-slate-900">Update Patient Vitals</h4>
              </div>
              <button
                onClick={() => setVitalsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Recording clinical vitals for <strong className="text-slate-800">{activePatient.patientName}</strong> ({activePatient.tokenNumber || activePatient.id})
            </p>

            <form onSubmit={handleSaveVitals} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Blood Pressure (mmHg)</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 120 / 80 mmHg"
                  value={editBp}
                  onChange={(e) => setEditBp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Heart Rate (BPM)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 72 BPM"
                    value={editHr}
                    onChange={(e) => setEditHr(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Blood Oxygen (SpO2)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 99% SpO2"
                    value={editSpo2}
                    onChange={(e) => setEditSpo2(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Temperature</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 98.6 °F"
                  value={editTemp}
                  onChange={(e) => setEditTemp(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setVitalsModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={updateStatusMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Save Vitals</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Doctor Profile Modal */}
      {profileModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold shadow-md">
                  <Stethoscope className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-base text-slate-900">Doctor Profile Credentials</h4>
                  <p className="text-[11px] text-slate-400">Manage your clinical profile and OPD desk</p>
                </div>
              </div>
              <button
                onClick={() => setProfileModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {profileSaveSuccess && (
              <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>{profileSaveSuccess}</span>
              </div>
            )}

            <form onSubmit={handleSaveProfile} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Full Doctor Name</label>
                  <input
                    type="text"
                    required
                    value={profName}
                    onChange={(e) => setProfName(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Contact Phone</label>
                  <input
                    type="text"
                    required
                    value={profPhone}
                    onChange={(e) => setProfPhone(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Clinical Specialty</label>
                  <input
                    type="text"
                    required
                    value={profSpecialty}
                    onChange={(e) => setProfSpecialty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Department</label>
                  <input
                    type="text"
                    required
                    value={profDept}
                    onChange={(e) => setProfDept(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">OPD Consultation Room</label>
                <input
                  type="text"
                  required
                  value={profRoom}
                  onChange={(e) => setProfRoom(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs space-y-1.5 text-slate-500">
                <div className="flex justify-between">
                  <span>Registered Email:</span>
                  <strong className="text-slate-700">{doctorEmail}</strong>
                </div>
                <div className="flex justify-between">
                  <span>Authorized Role:</span>
                  <strong className="text-emerald-600">DOCTOR (Verified)</strong>
                </div>
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-slate-600 bg-slate-100 hover:bg-slate-200 transition-colors"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={updateProfileMutation.isPending}
                  className="flex-1 py-2.5 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all flex items-center justify-center space-x-1.5"
                >
                  {updateProfileMutation.isPending ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  )}
                  <span>Save Profile</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorDashboard;
