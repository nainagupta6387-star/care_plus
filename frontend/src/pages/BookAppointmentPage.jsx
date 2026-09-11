import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Stethoscope, 
  CheckCircle2, 
  ArrowLeft, 
  Activity, 
  ShieldCheck,
  FileText,
  AlertCircle
} from 'lucide-react';
import { departments, topDoctors } from '../data/hmsData';
import { useProfileQuery, useCreateAppointmentMutation } from '../hooks';

const BookAppointmentPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const { data: profileData } = useProfileQuery();
  const createAptMutation = useCreateAppointmentMutation();

  const storedUserJson = localStorage.getItem('careplus_patient_user');
  const storedUser = storedUserJson ? JSON.parse(storedUserJson) : null;

  const currentPatient = {
    name: profileData?.name || storedUser?.name || '',
    email: profileData?.email || storedUser?.email || '',
    phone: profileData?.phone || storedUser?.phone || '',
    patientId: profileData?.patientId || storedUser?.patientId || storedUser?.id || 'PT-9801',
    role: profileData?.role || storedUser?.role || 'patient'
  };

  const initialDept = location.state?.dept || 'Cardiology & Heart Care';
  const initialDoctor = location.state?.doctor || 'Dr. Sarah Jenkins, MD';

  const [department, setDepartment] = useState(initialDept);
  const [doctor, setDoctor] = useState(initialDoctor);
  const [patientName, setPatientName] = useState(currentPatient.name);
  const [phone, setPhone] = useState(currentPatient.phone || '+1 (555) 234-5678');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [timeSlot, setTimeSlot] = useState('10:30 AM');
  const [consultationType, setConsultationType] = useState('OPD Consultation');
  const [reason, setReason] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  useEffect(() => {
    if (currentPatient.name && !patientName) {
      setPatientName(currentPatient.name);
    }
  }, [currentPatient.name]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const res = await createAptMutation.mutateAsync({
        patientName: patientName || currentPatient.name || 'Patient',
        patientEmail: currentPatient.email || 'patient@careplus-hms.com',
        doctor,
        department,
        date,
        timeSlot,
        type: consultationType,
        reason
      });

      setSubmitting(false);
      setConfirmedBooking(res.appointment || {
        patientName: patientName || currentPatient.name,
        patientId: currentPatient.patientId,
        department,
        doctor,
        date,
        timeSlot,
        consultationType,
        tokenNumber: 'OPD-' + Math.floor(1000 + Math.random() * 9000)
      });
    } catch (err) {
      setSubmitting(false);
      console.error(err);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto space-y-6">
        
        {/* Header Breadcrumb */}
        <div className="flex items-center justify-between">
          <button 
            onClick={() => navigate(-1)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-600 hover:text-blue-600 transition-colors bg-white px-3.5 py-2 rounded-xl border border-slate-200 shadow-sm"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Go Back</span>
          </button>

          <div className="flex items-center space-x-2">
            <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
              🔒 Authenticated Session ({currentPatient.name || 'Logged In'})
            </span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/90 overflow-hidden">
          
          {/* Top Banner */}
          <div className="bg-gradient-to-r from-blue-600 via-teal-600 to-indigo-600 p-8 text-white">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center text-white">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-100 bg-white/20 px-2.5 py-0.5 rounded-full">
                  HMS OPD Scheduling
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold mt-1">Book an OPD Appointment</h1>
                <p className="text-xs text-blue-100 mt-1">Instant digital token generation with priority doctor queueing</p>
              </div>
            </div>
          </div>

          {/* Form / Confirmation View */}
          <div className="p-6 sm:p-8">
            {confirmedBooking ? (
              <div className="text-center py-6 space-y-6 animate-in zoom-in-95 duration-200">
                <div className="w-20 h-20 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-inner ring-8 ring-emerald-50">
                  <CheckCircle2 className="w-12 h-12 stroke-[2.5]" />
                </div>

                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                    Appointment Successfully Confirmed!
                  </span>
                  <h2 className="text-3xl font-extrabold text-slate-900 mt-3">OPD Token #{confirmedBooking.tokenNumber}</h2>
                  <p className="text-xs text-slate-500 mt-1">Present this token code at the hospital reception or OPD desk</p>
                </div>

                {/* Receipt Box */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-200 text-left space-y-3 text-xs max-w-lg mx-auto">
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Patient Name:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.patientName}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Patient ID:</span>
                    <span className="font-bold text-blue-600">{confirmedBooking.patientId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Department:</span>
                    <span className="font-bold text-slate-900">{confirmedBooking.department}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Attending Doctor:</span>
                    <span className="font-bold text-blue-600">{confirmedBooking.doctor}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-200">
                    <span className="text-slate-500 font-semibold">Consultation Date & Time:</span>
                    <span className="font-bold text-emerald-600">{confirmedBooking.date} at {confirmedBooking.timeSlot}</span>
                  </div>
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500 font-semibold">Status:</span>
                    <span className="font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Confirmed</span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  <Link
                    to="/patient-dashboard"
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-white bg-blue-600 hover:bg-blue-700 transition-all shadow-md"
                  >
                    View in Patient Dashboard
                  </Link>
                  <button
                    onClick={() => setConfirmedBooking(null)}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-all"
                  >
                    Book Another Appointment
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                
                {/* User Info Bar */}
                <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-100 flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold flex items-center justify-center text-xs">
                      {currentPatient.name ? currentPatient.name[0].toUpperCase() : 'P'}
                    </div>
                    <div>
                      <p className="font-bold text-slate-900">Booking as: {currentPatient.name || 'Patient User'}</p>
                      <p className="text-slate-500">{currentPatient.email}</p>
                    </div>
                  </div>
                  <span className="text-[10px] font-extrabold uppercase bg-blue-100 text-blue-800 px-2.5 py-1 rounded-md">
                    Verified Patient
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Patient Full Name *</label>
                    <div className="relative">
                      <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input 
                        type="text"
                        required
                        value={patientName}
                        onChange={(e) => setPatientName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Contact Phone Number *</label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input 
                        type="tel"
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 000-0000"
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Medical Department *</label>
                    <div className="relative">
                      <Stethoscope className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <select
                        value={department}
                        onChange={(e) => setDepartment(e.target.value)}
                        className="w-full pl-10 pr-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                      >
                        {departments.map((d) => (
                          <option key={d.id} value={d.name}>{d.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Preferred Specialist / Doctor *</label>
                    <select
                      value={doctor}
                      onChange={(e) => setDoctor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      {topDoctors.map((doc) => (
                        <option key={doc.id} value={doc.name}>{doc.name} ({doc.specialty})</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Appointment Date *</label>
                    <input 
                      type="date"
                      required
                      value={date}
                      onChange={(e) => setDate(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">Time Slot *</label>
                    <select
                      value={timeSlot}
                      onChange={(e) => setTimeSlot(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                      <option value="09:00 AM">09:00 AM</option>
                      <option value="10:30 AM">10:30 AM</option>
                      <option value="11:30 AM">11:30 AM</option>
                      <option value="02:30 PM">02:30 PM</option>
                      <option value="04:00 PM">04:00 PM</option>
                    </select>
                  </div>

                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">Reason for Visit / Symptoms (Optional)</label>
                  <textarea
                    rows="3"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Briefly describe your symptoms or reason for consultation..."
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  ></textarea>
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/35 transition-all flex items-center justify-center space-x-2"
                >
                  {submitting ? (
                    <span>Processing Appointment Token...</span>
                  ) : (
                    <>
                      <CheckCircle2 className="w-5 h-5" />
                      <span>Confirm & Issue OPD Appointment Token</span>
                    </>
                  )}
                </button>

              </form>
            )}
          </div>

        </div>

      </div>
    </div>
  );
};

export default BookAppointmentPage;
