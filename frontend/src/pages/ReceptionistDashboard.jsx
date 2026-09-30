import React, { useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Activity,
  Calendar,
  Clock,
  UserCheck,
  CreditCard,
  LogOut,
  Plus,
  Search,
  CheckCircle2,
  Edit3,
  Filter,
  User,
  ShieldCheck,
  Stethoscope,
  X,
  Zap,
  RefreshCw,
  ClipboardList,
  BedDouble,
} from "lucide-react";
import { logoutUser } from "../api";
import {
  useAllAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useCreateAppointmentMutation,
  useProfileQuery,
  useAdmissionsQuery,
  useIcuBedsQuery,
  useDoctorsQuery,
  useCreateAdmissionMutation,
  useUpdateAdmissionStatusMutation,
  useAssignIcuBedMutation,
} from "../hooks";

const STATUS_OPTIONS = [
  "Waiting",
  "Confirmed",
  "In Consultation",
  "Completed",
  "Rescheduled",
  "Cancelled",
];

const createEmergencyDraft = () => {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return {
    patientName: "",
    unknownPatient: false,
    age: "",
    gender: "",
    contactNumber: "",
    emergencyType: "Accident",
    emergencyDescription: "",
    arrivalAt: now.toISOString().slice(0, 16),
    priority: "Emergency",
    bloodPressure: "",
    heartRate: "",
    temperature: "",
    spo2: "",
    icuRequired: "no",
    doctorId: "",
    icuBed: "",
  };
};

const EMERGENCY_STATUSES = ["Waiting", "Under Treatment", "Stabilized", "ICU", "Admitted", "Completed"];

const ReceptionistDashboard = () => {
  const navigate = useNavigate();

  // Load authenticated Receptionist session
  const storedUserJson = localStorage.getItem("careplus_patient_user");
  const user = storedUserJson ? JSON.parse(storedUserJson) : null;
  const receptionistName = user?.name || "Sarah Davis";
  const receptionistEmail = user?.email || "receptionist@careplus-hms.com";

  const [activeTab, setActiveTab] = useState("queue"); // 'queue', 'doctorQueue', 'billing', 'walkin', 'profile'

  // Filtering & Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDoctorFilter, setSelectedDoctorFilter] =
    useState("All Doctors");
  const [statusFilter, setStatusFilter] = useState("All");

  // Reschedule Modal state
  const [editingApt, setEditingApt] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editTime, setEditTime] = useState("");

  // Create Bill Modal state
  const [billModalOpen, setBillModalOpen] = useState(false);
  const [newBillPatient, setNewBillPatient] = useState("");
  const [newBillDesc, setNewBillDesc] = useState("");
  const [newBillAmount, setNewBillAmount] = useState("");
  const [newBillStatus, setNewBillStatus] = useState("Pending");
  const [newBillMethod, setNewBillMethod] = useState("Cash");
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [feedback, setFeedback] = useState({ type: "", message: "" });

  // Walk-in Token state
  const [walkinName, setWalkinName] = useState("");
  const [walkinDept, setWalkinDept] = useState("Cardiology & Heart Care");
  const [walkinDoc, setWalkinDoc] = useState("Dr. Sarah Jenkins, MD");
  const [generatedToken, setGeneratedToken] = useState(null);
  const [emergencyModalOpen, setEmergencyModalOpen] = useState(false);
  const [emergencyDraft, setEmergencyDraft] = useState(createEmergencyDraft);
  const [selectedIcuBeds, setSelectedIcuBeds] = useState({});

  // TanStack Query Hooks for Real-Time Backend Sync & Cache Management
  const { data: fetchedAppointments, isLoading: isAptsLoading, isError: isAptsError } =
    useAllAppointmentsQuery();
  const { data: fetchedInvoices, isLoading: isInvoicesLoading, isError: isInvoicesError } =
    useInvoicesQuery();
  const { data: profileData, isLoading: isProfileLoading, isError: isProfileError } =
    useProfileQuery();
  const updateStatusMutation = useUpdateAppointmentStatusMutation();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatusMutation();
  const createAppointmentMutation = useCreateAppointmentMutation();
  const { data: admissions = [], isLoading: isAdmissionsLoading, isError: isAdmissionsError } = useAdmissionsQuery();
  const { data: icuBedData, isLoading: isIcuBedsLoading, isError: isIcuBedsError } = useIcuBedsQuery();
  const { data: emergencyDoctors = [], isLoading: isDoctorsLoading } = useDoctorsQuery();
  const createAdmissionMutation = useCreateAdmissionMutation();
  const updateAdmissionStatusMutation = useUpdateAdmissionStatusMutation();
  const assignIcuBedMutation = useAssignIcuBedMutation();

  const icuBeds = icuBedData?.beds || [];
  const availableIcuBeds = icuBeds.filter((bed) => bed.status === "Available");

  const appointments = useMemo(
    () => (Array.isArray(fetchedAppointments) ? fetchedAppointments : []),
    [fetchedAppointments],
  );
  const invoices = useMemo(
    () => (Array.isArray(fetchedInvoices) ? fetchedInvoices : []),
    [fetchedInvoices],
  );
  const doctorList = useMemo(() => {
    const doctors = [...new Set(appointments.map((appointment) => appointment.doctor).filter(Boolean))];
    return ["All Doctors", ...doctors];
  }, [appointments]);
  const actualDoctors = doctorList.filter((doctor) => doctor !== "All Doctors");
  const profile = profileData || user;
  const invoiceId = (invoice) => invoice?._id || invoice?.invoiceId || invoice?.id;
  const showFeedback = (type, message) => setFeedback({ type, message });

  // Logout Handler
  const handleLogout = async () => {
    await logoutUser();
    navigate("/login");
  };

  // Immediate Real-Time Status Change Handler (No Refresh Needed!)
  const handleStatusChange = async (aptTarget, newStatus) => {
    const targetId = aptTarget._id || aptTarget.id || aptTarget.tokenNumber;
    try {
      await updateStatusMutation.mutateAsync({
        id: targetId,
        status: newStatus,
      });
      showFeedback("success", `Appointment updated to ${newStatus}.`);
    } catch (err) {
      showFeedback("error", err.message || "Status update failed.");
    }
  };

  // Reschedule Submission
  const handleSaveReschedule = async (e) => {
    e.preventDefault();
    if (!editingApt) return;
    const targetId = editingApt._id || editingApt.id || editingApt.tokenNumber;

    try {
      await updateStatusMutation.mutateAsync({
        id: targetId,
        status: "Rescheduled",
        date: editDate,
        timeSlot: editTime,
      });
      setEditingApt(null);
      showFeedback("success", "Appointment rescheduled successfully.");
    } catch (err) {
      showFeedback("error", err.message || "Appointment could not be rescheduled.");
    }
  };

  // Create Bill Handler
  const handleCreateBill = async (e) => {
    e.preventDefault();
    try {
      await createInvoiceMutation.mutateAsync({
        patientName: newBillPatient,
        patientId: "PT-" + Math.floor(1000 + Math.random() * 9000),
        description: newBillDesc,
        amount: parseFloat(newBillAmount) || 100.0,
        status: newBillStatus,
        method: newBillMethod,
      });
      setBillModalOpen(false);
      setNewBillPatient("");
      setNewBillDesc("");
      setNewBillAmount("");
      showFeedback("success", "Invoice created successfully.");
    } catch (err) {
      showFeedback("error", err.message || "Invoice could not be created.");
    }
  };

  const handleMarkPaid = async (invId) => {
    try {
      await updateInvoiceStatusMutation.mutateAsync({
        id: invId,
        status: "Paid",
        method: "Cash / Card",
      });
      showFeedback("success", "Invoice marked as paid.");
    } catch (err) {
      showFeedback("error", err.message || "Payment status could not be updated.");
    }
  };

  // Walk-in Token Generator
  const handleGenerateWalkinToken = async (e) => {
    e.preventDefault();
    try {
      const res = await createAppointmentMutation.mutateAsync({
        patientName: walkinName.trim(),
        doctor: walkinDoc,
        department: walkinDept,
        date: new Date().toISOString().split("T")[0],
        timeSlot: "10:00 AM",
        status: "Waiting",
        type: "Walk-in OPD Triage",
      });
      setGeneratedToken(res.appointment);
      setWalkinName("");
      showFeedback("success", "Walk-in patient added to the queue.");
    } catch (err) {
      showFeedback("error", err.message || "Walk-in check-in failed.");
    }
  };

  const handleEmergencyFieldChange = (event) => {
    const { name, value, type, checked } = event.target;
    setEmergencyDraft((current) => ({
      ...current,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleCreateEmergency = async (event) => {
    event.preventDefault();
    const age = emergencyDraft.age.trim();
    if (!emergencyDraft.unknownPatient && !emergencyDraft.patientName.trim()) {
      showFeedback("error", "Enter a patient name or select Unknown Patient.");
      return;
    }
    if (age && (!/^\d+$/.test(age) || Number(age) > 120)) {
      showFeedback("error", "Age must be a whole number between 0 and 120.");
      return;
    }
    if (emergencyDraft.contactNumber && !/^[+()\-\s\d.]{7,20}$/.test(emergencyDraft.contactNumber.trim())) {
      showFeedback("error", "Enter a valid contact number.");
      return;
    }
    const doctor = emergencyDoctors.find((item) => item.id === emergencyDraft.doctorId);
    if (!doctor) {
      showFeedback("error", "Select an available doctor.");
      return;
    }

    try {
      await createAdmissionMutation.mutateAsync({
        patientName: emergencyDraft.patientName.trim(),
        unknownPatient: emergencyDraft.unknownPatient,
        age: age ? Number(age) : undefined,
        gender: emergencyDraft.gender,
        contactNumber: emergencyDraft.contactNumber.trim(),
        emergencyType: emergencyDraft.emergencyType,
        emergencyDescription: emergencyDraft.emergencyDescription.trim(),
        arrivalAt: new Date(emergencyDraft.arrivalAt).toISOString(),
        priority: emergencyDraft.priority,
        vitals: {
          bloodPressure: emergencyDraft.bloodPressure.trim(),
          heartRate: emergencyDraft.heartRate.trim(),
          temperature: emergencyDraft.temperature.trim(),
          spo2: emergencyDraft.spo2.trim(),
        },
        icuRequired: emergencyDraft.icuRequired === "yes",
        doctorId: doctor.id,
        doctorEmail: doctor.email,
        ...(emergencyDraft.icuRequired === "yes" && emergencyDraft.icuBed
          ? { icuBed: emergencyDraft.icuBed }
          : {}),
      });
      setEmergencyModalOpen(false);
      setEmergencyDraft(createEmergencyDraft());
      showFeedback("success", "Emergency case added to the queue.");
    } catch (err) {
      showFeedback("error", err.message || "Emergency case could not be created.");
    }
  };

  const handleEmergencyStatusChange = async (id, status) => {
    try {
      await updateAdmissionStatusMutation.mutateAsync({ id, status });
      showFeedback("success", "Emergency status updated.");
    } catch (err) {
      showFeedback("error", err.message || "Emergency status could not be updated.");
    }
  };

  const handleAssignIcuBed = async (id) => {
    const bedId = selectedIcuBeds[id];
    if (!bedId) {
      showFeedback("error", "Select an available ICU bed first.");
      return;
    }
    try {
      await assignIcuBedMutation.mutateAsync({ id, bedId });
      setSelectedIcuBeds((current) => ({ ...current, [id]: "" }));
      showFeedback("success", `ICU bed ${bedId} reserved for the patient.`);
    } catch (err) {
      showFeedback("error", err.message || "ICU bed could not be assigned.");
    }
  };

  // Organize Queue by Doctor and Time
  const getOrganizedQueue = () => {
    let list = [...appointments];

    // Filter by search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (a) =>
          (a.patientName || "").toLowerCase().includes(q) ||
          (a.doctor || "").toLowerCase().includes(q) ||
          (a.tokenNumber || a.id || "").toLowerCase().includes(q),
      );
    }

    // Filter by doctor
    if (selectedDoctorFilter !== "All Doctors") {
      list = list.filter((a) => a.doctor === selectedDoctorFilter);
    }

    // Filter by status
    if (statusFilter !== "All") {
      list = list.filter(
        (a) => a.status.toLowerCase() === statusFilter.toLowerCase(),
      );
    }

    // Sort by Doctor Name, then Date, then TimeSlot
    return list.sort((a, b) => {
      if (a.doctor !== b.doctor) {
        return a.doctor.localeCompare(b.doctor);
      }
      const dateA = a.date || "";
      const dateB = b.date || "";
      if (dateA !== dateB) {
        return dateA.localeCompare(dateB);
      }
      return (a.timeSlot || "").localeCompare(b.timeSlot || "");
    });
  };

  const queueList = getOrganizedQueue();

  // Group by Doctor for Doctor-Wise Queue Tab
  const groupedByDoctor = queueList.reduce((acc, apt) => {
    const docName = apt.doctor || "Unassigned Doctor";
    if (!acc[docName]) acc[docName] = [];
    acc[docName].push(apt);
    return acc;
  }, {});

  // Quick statistics
  const confirmedCount = appointments.filter((a) => a.status === "Confirmed").length;
  const inConsultCount = appointments.filter((a) => a.status === "In Consultation").length;
  const completedCount = appointments.filter((a) => a.status === "Completed").length;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header - Modern Dark Navy Bar with Blue & Teal Accents */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 border-b border-slate-800 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-teal-600 text-white flex items-center justify-center font-bold shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Activity className="w-5 h-5 stroke-[2.5]" />
              </div>
              <div>
                <h1 className="font-extrabold text-base sm:text-lg tracking-tight flex items-center gap-2">
                  <span>CarePlus</span>
                  <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-teal-400 font-bold">
                    Reception Console
                  </span>
                </h1>
                <p className="text-[10px] text-slate-400">
                  Real-time Patient Queue, Doctor Schedules & Billing
                </p>
              </div>
            </Link>
          </div>

          {/* User Session Info & Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/80 text-xs">
              <div className="w-7 h-7 rounded-full bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold flex items-center justify-center text-xs shadow-sm ring-2 ring-blue-500/30">
                {receptionistName[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-100 leading-tight">
                  👋 {receptionistName}
                </p>
                <span className="text-[9px] font-extrabold uppercase text-sky-400 tracking-wider">
                  RECEPTIONIST
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl bg-rose-500/15 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold transition-all shadow-xs"
              title="Logout / Sign Out"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full flex-1 space-y-6">
        {feedback.message && (
          <div className={`rounded-xl border px-4 py-3 text-sm font-semibold ${feedback.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
            {feedback.message}
          </div>
        )}

        {/* Real-Time Status Notification Banner - Modern Medical Blue/Teal Gradient */}
        <div className="bg-gradient-to-r from-blue-600 via-sky-600 to-teal-600 rounded-3xl p-5 text-white shadow-lg shadow-blue-600/15 border border-blue-400/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <span className="flex h-3.5 w-3.5 relative shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-white"></span>
            </span>
            <div>
              <p className="font-extrabold text-sm sm:text-base leading-tight flex items-center gap-1.5">
                <span>Real-Time Patient Queue Active</span>
                <span className="text-[10px] font-bold bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-xs">
                  Live OPD Sync
                </span>
              </p>
              <p className="text-xs text-sky-100 mt-0.5 font-medium">
                Newly booked appointments & live patient status changes update automatically across all consoles.
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-xs font-bold bg-white/20 px-3.5 py-2 rounded-xl backdrop-blur-md border border-white/20 shadow-xs self-stretch sm:self-auto justify-center">
            <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
            <span>Auto-Synced ({appointments.length} Total Patients)</span>
          </div>
        </div>

        {/* Quick Vitals / Counter Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total in Queue</p>
              <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">{appointments.length}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <ClipboardList className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Confirmed</p>
              <h3 className="text-xl font-extrabold text-emerald-600 mt-0.5">{confirmedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">In Consultation</p>
              <h3 className="text-xl font-extrabold text-sky-600 mt-0.5">{inConsultCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold">
              <Stethoscope className="w-5 h-5" />
            </div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Completed</p>
              <h3 className="text-xl font-extrabold text-purple-600 mt-0.5">{completedCount}</h3>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Navigation Tabs Header - Clean Pill Style with Blue Accent */}
        <div className="bg-white p-2 rounded-2xl sm:rounded-3xl border border-slate-200/80 shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "queue"
                ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Real-time Queue ({queueList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("doctorQueue")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "doctorQueue"
                ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor-wise Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "billing"
                ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("walkin")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "walkin"
                ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Rapid Walk-in Check-in</span>
          </button>

          <button
            onClick={() => setActiveTab("emergency")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "emergency"
                ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>Emergency &amp; Critical Patient ({admissions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "profile"
                ? "bg-gradient-to-r from-blue-600 to-teal-600 text-white shadow-md shadow-blue-500/20"
                : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
            }`}
          >
            <User className="w-4 h-4" />
            <span>Receptionist Profile</span>
          </button>
        </div>

        {/* TAB 1: REAL-TIME PATIENT QUEUE (Organized by Doctor & Time) */}
        {activeTab === "queue" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            {/* Filter & Search Controls */}
            <div className="bg-white p-5 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Patient, Doctor, or Token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all font-medium"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-bold text-slate-600">
                    Doctor:
                  </span>
                  <select
                    value={selectedDoctorFilter}
                    onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {doctorList.map((doc, idx) => (
                      <option key={idx} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">
                    Status:
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Waiting">Waiting</option>
                    <option value="Confirmed">Confirmed</option>
                    <option value="In Consultation">In Consultation</option>
                    <option value="Completed">Completed</option>
                    <option value="Rescheduled">Rescheduled</option>
                    <option value="Cancelled">Cancelled</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Queue Table */}
            <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900 tracking-tight">
                    Live Patient Queue (Organized by Doctor & Time)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status changes reflect immediately in real time across the portal
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab("walkin")}
                    className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Add Walk-in Patient</span>
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/80 border-b border-slate-200/80 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    <tr>
                      <th className="p-4">Token Code</th>
                      <th className="p-4">Patient Details</th>
                      <th className="p-4">Assigned Doctor</th>
                      <th className="p-4">Appt Date & Time</th>
                      <th className="p-4">Current Status</th>
                      <th className="p-4 text-center">
                        Instant Real-Time Status Change
                      </th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {isAptsLoading ? (
                      <tr><td colSpan="7" className="p-12 text-center text-slate-500">Loading patient queue...</td></tr>
                    ) : isAptsError ? (
                      <tr><td colSpan="7" className="p-12 text-center text-rose-600">Unable to load the patient queue. Please check the backend connection.</td></tr>
                    ) : queueList.length > 0 ? (
                      queueList.map((apt) => (
                        <tr
                          key={apt.id || apt.tokenNumber}
                          className="hover:bg-blue-50/40 transition-colors"
                        >
                          {/* Token */}
                          <td className="p-4 font-extrabold">
                            <span className="px-2.5 py-1 rounded-lg bg-blue-50 text-blue-700 border border-blue-200/70 font-mono text-xs">
                              {apt.tokenNumber || apt.id}
                            </span>
                          </td>

                          {/* Patient */}
                          <td className="p-4">
                            <p className="font-bold text-slate-900">
                              {apt.patientName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-normal">
                              {apt.patientId || "PT-9801"} •{" "}
                              {apt.consultationType || apt.type || "OPD Checkup"}
                            </p>
                          </td>

                          {/* Doctor */}
                          <td className="p-4 font-bold text-slate-800">
                            <div className="flex items-center space-x-1.5">
                              <Stethoscope className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                              <span>{apt.doctor}</span>
                            </div>
                            <p className="text-[10px] text-slate-500 font-normal">
                              {apt.department}
                            </p>
                          </td>

                          {/* Date / Time */}
                          <td className="p-4">
                            <div className="flex items-center space-x-1 text-slate-900 font-bold">
                              <Calendar className="w-3.5 h-3.5 text-slate-400" />
                              <span>{apt.date}</span>
                            </div>
                            <div className="flex items-center space-x-1 text-blue-600 font-bold mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{apt.timeSlot || apt.time}</span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span
                              className={`inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase border ${
                                apt.status === "Confirmed"
                                  ? "bg-emerald-50 text-emerald-700 border-emerald-200/80"
                                  : apt.status === "In Consultation"
                                    ? "bg-sky-50 text-sky-700 border-sky-200/80 animate-pulse"
                                    : apt.status === "Completed"
                                      ? "bg-purple-50 text-purple-700 border-purple-200/80"
                                      : apt.status === "Rescheduled"
                                        ? "bg-amber-50 text-amber-700 border-amber-200/80"
                                        : "bg-rose-50 text-rose-700 border-rose-200/80"
                              }`}
                            >
                              {apt.status}
                            </span>
                          </td>

                          {/* Instant Real-Time Status Switcher Dropdown */}
                          <td className="p-4 text-center">
                            <select
                              value={apt.status}
                              onChange={(e) =>
                                handleStatusChange(apt, e.target.value)
                              }
                              className="px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 shadow-xs"
                            >
                              {STATUS_OPTIONS.map((opt, i) => (
                                <option key={i} value={opt}>
                                  {opt}
                                </option>
                              ))}
                            </select>
                          </td>

                          {/* Actions */}
                          <td className="p-4 text-right">
                            <button
                              onClick={() => {
                                setEditingApt(apt);
                                setEditDate(apt.date);
                                setEditTime(apt.timeSlot || apt.time || "10:00 AM");
                              }}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-blue-600 hover:text-white text-slate-700 font-bold transition-all text-xs border border-slate-200/70 shadow-xs"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>Reschedule</span>
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan="7"
                          className="p-12 text-center text-slate-400 font-normal"
                        >
                          <ClipboardList className="w-10 h-10 mx-auto text-slate-300 mb-2" />
                          <p className="font-semibold text-slate-600 text-sm">No patient queue records found</p>
                          <p className="text-xs text-slate-400 mt-0.5">Try changing your search keywords or doctor filter.</p>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: DOCTOR-WISE QUEUE (Grouped by Doctor) */}
        {activeTab === "doctorQueue" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  Doctor-Wise Patient Queues
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time patient check-ins grouped by attending physician and sorted by consultation slot
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <Stethoscope className="w-5 h-5 text-blue-600" />
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-bold bg-slate-50 text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  {doctorList.map((doc, idx) => (
                    <option key={idx} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor Groups */}
            {isAptsLoading ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center text-slate-500">Loading doctor queues...</div>
            ) : Object.keys(groupedByDoctor).length === 0 ? (
              <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center text-slate-500">No doctor queues found.</div>
            ) : Object.keys(groupedByDoctor).map((docName, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm space-y-5"
              >
                <div className="flex justify-between items-center pb-4 border-b border-slate-100">
                  <div className="flex items-center space-x-3.5">
                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-bold flex items-center justify-center shadow-md shadow-blue-500/20">
                      <Stethoscope className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {docName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {groupedByDoctor[docName].length} Patients in Active Queue
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200/70 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Live Queue Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedByDoctor[docName].map((apt) => (
                    <div
                      key={apt.id || apt.tokenNumber}
                      className="p-4 rounded-2xl border border-slate-200/80 bg-slate-50/50 space-y-3 hover:border-blue-300 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-extrabold text-blue-700 bg-blue-100/70 px-2.5 py-0.5 rounded font-mono">
                            {apt.tokenNumber || apt.id}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1.5">
                            {apt.patientName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {apt.consultationType || apt.type || "OPD Checkup"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase border ${
                            apt.status === "Confirmed"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                              : apt.status === "In Consultation"
                              ? "bg-sky-50 text-sky-700 border-sky-200"
                              : "bg-purple-50 text-purple-700 border-purple-200"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-600 pt-2 border-t border-slate-200/60">
                        <span className="font-semibold text-slate-700">{apt.date}</span>
                        <strong className="text-blue-600 font-extrabold">
                          {apt.timeSlot || apt.time}
                        </strong>
                      </div>

                      {/* Instant Status Change Select */}
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                          Instant Status Update:
                        </label>
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            handleStatusChange(apt, e.target.value)
                          }
                          className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          {STATUS_OPTIONS.map((opt, i) => (
                            <option key={i} value={opt}>
                              {opt}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* TAB 3: BILLING & INVOICES */}
        {activeTab === "billing" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                  Patient Billing & Invoices
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create patient billing receipts and manage payment collection statuses
                </p>
              </div>

              <button
                onClick={() => setBillModalOpen(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Patient Invoice</span>
              </button>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {isInvoicesLoading ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center text-slate-500">Loading invoices...</div>
              ) : isInvoicesError ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center text-rose-600">Unable to load invoices. Please check the backend connection.</div>
              ) : invoices.length === 0 ? (
                <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm text-center text-slate-500">No invoices found.</div>
              ) : invoices.map((inv) => (
                <div
                  key={invoiceId(inv)}
                  className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:border-blue-200 transition-all"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base font-mono">
                        {inv.invoiceId || inv.id || inv._id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase border ${
                          inv.status === "Paid"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : "bg-amber-50 text-amber-700 border-amber-200"
                        }`}
                      >
                        {inv.status}
                      </span>
                    </div>
                    <h3 className="font-extrabold text-slate-900 text-sm mt-1">
                      {inv.patientName} ({inv.patientId})
                    </h3>
                    <p className="text-xs text-slate-600 mt-0.5">
                      {inv.description}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Billed Date: {inv.date} • Method: {inv.method}
                    </p>
                  </div>

                  <div className="flex items-center space-x-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-slate-100">
                    <span className="text-xl font-extrabold text-slate-900">
                      ${typeof inv.amount === 'number' ? inv.amount.toFixed(2) : inv.amount}
                    </span>

                    {inv.status === "Pending" ? (
                      <button
                        onClick={() => handleMarkPaid(invoiceId(inv))}
                        disabled={updateInvoiceStatusMutation.isPending}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Payment Settled</span>
                      </span>
                    )}
                    <button
                      onClick={() => setSelectedInvoice(inv)}
                      className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-blue-600 hover:text-white transition-colors"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RAPID WALK-IN CHECK-IN */}
        {activeTab === "walkin" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div>
                <span className="text-[11px] font-extrabold uppercase tracking-widest text-blue-600 bg-blue-50 border border-blue-100 px-3 py-1 rounded-full">
                  Zero-Wait Triage
                </span>
                <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight mt-3">
                  Rapid Walk-in Patient OPD Triage
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Generate immediate OPD consultation tokens for emergency or walk-in patients
                </p>
              </div>

              {generatedToken && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-in zoom-in-95">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
                    ✓ Live Token Issued & Added to Real-Time Queue
                  </span>
                  <h3 className="text-3xl font-extrabold text-emerald-700 font-mono">
                    Token #{generatedToken.tokenNumber}
                  </h3>
                  <p className="text-xs font-bold text-slate-800">
                    Patient: {generatedToken.patientName}
                  </p>
                  <p className="text-xs text-slate-600">
                    Assigned: {generatedToken.doctor} ({generatedToken.department})
                  </p>
                </div>
              )}

              <form onSubmit={handleGenerateWalkinToken} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Patient Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Smith"
                    value={walkinName}
                    onChange={(e) => setWalkinName(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-medium"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={walkinDept}
                    onChange={(e) => setWalkinDept(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  >
                    <option value="Cardiology & Heart Care">
                      Cardiology & Heart Care
                    </option>
                    <option value="Neurology & Brain Sciences">
                      Neurology & Brain Sciences
                    </option>
                    <option value="Pediatrics & Child Health">
                      Pediatrics & Child Health
                    </option>
                    <option value="Orthopedics & Joint Care">
                      Orthopedics & Joint Care
                    </option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Attending Doctor *
                  </label>
                  <select
                    value={walkinDoc}
                    onChange={(e) => setWalkinDoc(e.target.value)}
                    disabled={actualDoctors.length === 0 || createAppointmentMutation.isPending}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
                  >
                    {actualDoctors.map((doctor) => (
                      <option key={doctor} value={doctor}>{doctor}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 shadow-lg shadow-blue-500/25 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Issue Live OPD Token Code</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* EMERGENCY & CRITICAL PATIENT QUEUE */}
        {activeTab === "emergency" && (
          <div className="space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Emergency Queue</h2>
                <p className="text-xs text-slate-500 mt-1">Emergency cases and ICU assignments sync with the doctor console.</p>
              </div>
              <button
                type="button"
                onClick={() => setEmergencyModalOpen(true)}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Create Emergency Case
              </button>
            </div>

            {isAdmissionsError && (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700">
                Emergency queue could not be loaded. Check the backend connection and try again.
              </div>
            )}

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                <h3 className="font-extrabold text-sm text-slate-900">Active and recent cases</h3>
                <span className="text-[11px] text-slate-500">{admissions.length} cases</span>
              </div>
              {isAdmissionsLoading ? (
                <div className="p-8 text-center text-sm text-slate-500">Loading emergency cases...</div>
              ) : admissions.length === 0 ? (
                <div className="p-10 text-center">
                  <Activity className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-semibold text-slate-700">No emergency cases yet</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[1050px] text-left text-xs">
                    <thead className="bg-slate-50 text-[10px] uppercase text-slate-500">
                      <tr>
                        <th className="px-4 py-3 font-bold">Patient / Type</th>
                        <th className="px-4 py-3 font-bold">Priority</th>
                        <th className="px-4 py-3 font-bold">Arrival</th>
                        <th className="px-4 py-3 font-bold">Doctor</th>
                        <th className="px-4 py-3 font-bold">ICU</th>
                        <th className="px-4 py-3 font-bold">Status</th>
                        <th className="px-4 py-3 font-bold">Bed Assignment</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {admissions.map((admission) => (
                        <tr key={admission._id} className="align-top hover:bg-slate-50/70">
                          <td className="px-4 py-3">
                            <p className="font-bold text-slate-900">{admission.unknownPatient ? "Unknown Patient" : admission.patientName}</p>
                            <p className="text-[11px] text-slate-500 mt-1">{admission.emergencyType}</p>
                            <p className="text-[11px] text-slate-500 mt-1 max-w-xs">{admission.emergencyDescription}</p>
                          </td>
                          <td className="px-4 py-3">
                            <span className={`inline-flex rounded-md px-2 py-1 text-[10px] font-extrabold ${
                              admission.priority === "Emergency" ? "bg-rose-100 text-rose-700" : admission.priority === "High" ? "bg-amber-100 text-amber-800" : "bg-slate-100 text-slate-700"
                            }`}>{admission.priority}</span>
                          </td>
                          <td className="px-4 py-3 text-slate-600">{new Date(admission.arrivalAt).toLocaleString()}</td>
                          <td className="px-4 py-3 font-semibold text-slate-700">{admission.doctorName}</td>
                          <td className="px-4 py-3 text-slate-600">
                            {admission.icuRequired ? `Yes${admission.icuBed ? ` · ${admission.icuBed} (${admission.icuStatus})` : " · Bed needed"}` : "No"}
                          </td>
                          <td className="px-4 py-3">
                            <select
                              aria-label={`Status for ${admission.patientName}`}
                              value={admission.status}
                              onChange={(event) => handleEmergencyStatusChange(admission._id, event.target.value)}
                              disabled={updateAdmissionStatusMutation.isPending}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                              {EMERGENCY_STATUSES.map((status) => <option key={status} value={status}>{status}</option>)}
                            </select>
                          </td>
                          <td className="px-4 py-3">
                            {admission.icuRequired && !admission.icuBed ? (
                              <div className="flex min-w-52 items-center gap-2">
                                <select
                                  aria-label={`ICU bed for ${admission.patientName}`}
                                  value={selectedIcuBeds[admission._id] || ""}
                                  onChange={(event) => setSelectedIcuBeds((current) => ({ ...current, [admission._id]: event.target.value }))}
                                  className="min-w-0 flex-1 rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                  <option value="">Available bed</option>
                                  {availableIcuBeds.map((bed) => <option key={bed.bedId} value={bed.bedId}>{bed.bedId}</option>)}
                                </select>
                                <button
                                  type="button"
                                  disabled={assignIcuBedMutation.isPending || availableIcuBeds.length === 0}
                                  onClick={() => handleAssignIcuBed(admission._id)}
                                  className="rounded-lg bg-blue-600 px-2.5 py-1.5 text-[10px] font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50"
                                >Assign</button>
                              </div>
                            ) : admission.icuBed ? (
                              <span className="font-semibold text-slate-700">{admission.icuBed} · {admission.icuStatus}</span>
                            ) : <span className="text-slate-400">Not required</span>}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-extrabold text-sm text-slate-900">ICU Bed Status</h3>
                  <p className="text-[11px] text-slate-500 mt-1">{icuBedData?.demo ? "Configurable demo beds · set ICU_BED_IDS on the backend to use your configured bed identifiers." : "Configured bed identifiers and current assignments."}</p>
                </div>
                {isIcuBedsLoading && <RefreshCw className="w-4 h-4 animate-spin text-slate-400" />}
              </div>
              {isIcuBedsError ? (
                <p className="p-5 text-sm text-rose-700">ICU bed status could not be loaded.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3 p-4">
                  {icuBeds.map((bed) => (
                    <div key={bed.bedId} className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 p-4">
                      <div className="flex items-start gap-3">
                        <BedDouble className="w-4 h-4 mt-0.5 text-blue-600" />
                        <div>
                          <p className="text-sm font-bold text-slate-900">{bed.bedId}</p>
                          {bed.patientName && <p className="text-xs text-slate-500 mt-1">{bed.patientName} · {bed.doctorName}</p>}
                        </div>
                      </div>
                      <span className={`rounded-md px-2 py-1 text-[10px] font-bold ${bed.status === "Available" ? "bg-emerald-100 text-emerald-700" : bed.status === "Reserved" ? "bg-amber-100 text-amber-800" : "bg-blue-100 text-blue-800"}`}>{bed.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB: RECEPTIONIST PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl border border-slate-200/80 shadow-sm space-y-6">
              <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-blue-600 to-teal-600 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg shadow-blue-500/25 ring-4 ring-blue-50">
                  {(profile?.name || receptionistName)[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight">
                    {profile?.name || receptionistName}
                  </h2>
                  <p className="text-xs font-bold text-blue-600 mt-0.5">
                    Employee ID: {profile?.patientId || "Not available"}
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {profile?.email || receptionistEmail}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    Role / Designation
                  </label>
                  <p className="font-bold text-slate-900 text-sm">
                    {profile?.role || "receptionist"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    Desk Location
                  </label>
                  <p className="font-bold text-slate-900 text-sm">
                    {profile?.department || "Not available"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    Current Shift
                  </label>
                  <p className="font-bold text-emerald-600 text-sm flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    {profile?.phone || "Phone not available"}
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1 text-[10px]">
                    System Authorization
                  </label>
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 font-bold border border-emerald-200">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    {isProfileLoading ? "Loading profile..." : isProfileError ? "Profile unavailable" : "JWT Session Active"}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {emergencyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 p-4 backdrop-blur-sm">
          <form onSubmit={handleCreateEmergency} className="max-h-[92vh] w-full max-w-3xl space-y-5 overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 shadow-2xl sm:p-7">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h2 className="text-lg font-extrabold text-slate-900">Create Emergency Case</h2>
                <p className="mt-1 text-xs text-slate-500">Record only the information currently available.</p>
              </div>
              <button type="button" onClick={() => setEmergencyModalOpen(false)} aria-label="Close emergency form" className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800">
                <X className="h-4 w-4" />
              </button>
            </div>

            {feedback.message && (
              <div role="alert" className={`rounded-xl border px-3 py-2.5 text-xs font-semibold ${feedback.type === "error" ? "border-rose-200 bg-rose-50 text-rose-700" : "border-emerald-200 bg-emerald-50 text-emerald-700"}`}>
                {feedback.message}
              </div>
            )}

            <label className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5 text-xs font-semibold text-slate-700">
              <input type="checkbox" name="unknownPatient" checked={emergencyDraft.unknownPatient} onChange={handleEmergencyFieldChange} className="h-4 w-4 accent-blue-600" />
              Unknown Patient
            </label>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="emergency-patient-name" className="mb-1.5 block text-[11px] font-bold text-slate-600">Patient Name</label>
                <input id="emergency-patient-name" name="patientName" value={emergencyDraft.patientName} onChange={handleEmergencyFieldChange} disabled={emergencyDraft.unknownPatient} required={!emergencyDraft.unknownPatient} placeholder={emergencyDraft.unknownPatient ? "Recorded as Unknown Patient" : "Full name"} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs disabled:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="emergency-age" className="mb-1.5 block text-[11px] font-bold text-slate-600">Age</label>
                <input id="emergency-age" name="age" type="number" min="0" max="120" step="1" value={emergencyDraft.age} onChange={handleEmergencyFieldChange} placeholder="Optional" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="emergency-gender" className="mb-1.5 block text-[11px] font-bold text-slate-600">Gender</label>
                <select id="emergency-gender" name="gender" value={emergencyDraft.gender} onChange={handleEmergencyFieldChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="">Not provided</option><option>Female</option><option>Male</option><option>Other</option><option>Not Specified</option>
                </select>
              </div>
              <div>
                <label htmlFor="emergency-contact" className="mb-1.5 block text-[11px] font-bold text-slate-600">Contact Number</label>
                <input id="emergency-contact" name="contactNumber" type="tel" pattern="[+()\-\s\d.]{7,20}" value={emergencyDraft.contactNumber} onChange={handleEmergencyFieldChange} placeholder="Optional" className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="emergency-type" className="mb-1.5 block text-[11px] font-bold text-slate-600">Emergency Type</label>
                <select id="emergency-type" name="emergencyType" required value={emergencyDraft.emergencyType} onChange={handleEmergencyFieldChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Accident</option><option>Critical Emergency</option><option>Other Emergency</option>
                </select>
              </div>
              <div>
                <label htmlFor="emergency-arrival" className="mb-1.5 block text-[11px] font-bold text-slate-600">Arrival Date &amp; Time</label>
                <input id="emergency-arrival" name="arrivalAt" type="datetime-local" required value={emergencyDraft.arrivalAt} onChange={handleEmergencyFieldChange} className="w-full rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label htmlFor="emergency-priority" className="mb-1.5 block text-[11px] font-bold text-slate-600">Priority</label>
                <select id="emergency-priority" name="priority" required value={emergencyDraft.priority} onChange={handleEmergencyFieldChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option>Emergency</option><option>High</option><option>Normal</option>
                </select>
              </div>
              <div>
                <label htmlFor="emergency-doctor" className="mb-1.5 block text-[11px] font-bold text-slate-600">Assign Doctor</label>
                <select id="emergency-doctor" name="doctorId" required value={emergencyDraft.doctorId} onChange={handleEmergencyFieldChange} disabled={isDoctorsLoading || emergencyDoctors.length === 0} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-slate-100">
                  <option value="">{isDoctorsLoading ? "Loading doctors..." : "Select doctor"}</option>
                  {emergencyDoctors.map((doctor) => <option key={doctor.id} value={doctor.id}>{doctor.name}{doctor.department ? ` · ${doctor.department}` : ""}</option>)}
                </select>
                {!isDoctorsLoading && emergencyDoctors.length === 0 && <p className="mt-1 text-[11px] text-rose-600">No doctor accounts are available to assign.</p>}
              </div>
              <div>
                <label htmlFor="emergency-icu" className="mb-1.5 block text-[11px] font-bold text-slate-600">ICU Required</label>
                <select id="emergency-icu" name="icuRequired" value={emergencyDraft.icuRequired} onChange={handleEmergencyFieldChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                  <option value="no">No</option><option value="yes">Yes</option>
                </select>
              </div>
              {emergencyDraft.icuRequired === "yes" && (
                <div>
                  <label htmlFor="emergency-icu-bed" className="mb-1.5 block text-[11px] font-bold text-slate-600">Reserve Available ICU Bed (Optional)</label>
                  <select id="emergency-icu-bed" name="icuBed" value={emergencyDraft.icuBed} onChange={handleEmergencyFieldChange} className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500">
                    <option value="">Assign later from queue</option>
                    {availableIcuBeds.map((bed) => <option key={bed.bedId} value={bed.bedId}>{bed.bedId}</option>)}
                  </select>
                  {availableIcuBeds.length === 0 && <p className="mt-1 text-[11px] text-slate-500">No beds are currently available; create the case and assign a bed when one becomes available.</p>}
                </div>
              )}
            </div>

            <div>
              <label htmlFor="emergency-description" className="mb-1.5 block text-[11px] font-bold text-slate-600">Emergency Description / Reason</label>
              <textarea id="emergency-description" name="emergencyDescription" required rows="3" value={emergencyDraft.emergencyDescription} onChange={handleEmergencyFieldChange} className="w-full resize-y rounded-xl border border-slate-200 px-3 py-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Describe the information provided at intake" />
            </div>

            <fieldset className="space-y-3 rounded-xl border border-slate-200 p-4">
              <legend className="px-1 text-[11px] font-bold text-slate-600">Vitals (optional)</legend>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[["bloodPressure", "BP", "e.g. 120/80"], ["heartRate", "Heart Rate", "e.g. 72 bpm"], ["temperature", "Temperature", "e.g. 37 °C"], ["spo2", "SpO2", "e.g. 98%"]].map(([name, label, placeholder]) => (
                  <div key={name}>
                    <label htmlFor={`emergency-${name}`} className="mb-1 block text-[10px] font-semibold text-slate-500">{label}</label>
                    <input id={`emergency-${name}`} name={name} value={emergencyDraft[name]} onChange={handleEmergencyFieldChange} placeholder={placeholder} className="w-full rounded-lg border border-slate-200 px-2.5 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500" />
                  </div>
                ))}
              </div>
            </fieldset>

            <div className="flex flex-col-reverse gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-end">
              <button type="button" onClick={() => setEmergencyModalOpen(false)} className="rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200">Cancel</button>
              <button type="submit" disabled={createAdmissionMutation.isPending || isDoctorsLoading || emergencyDoctors.length === 0} className="inline-flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                {createAdmissionMutation.isPending && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
                Add to Emergency Queue
              </button>
            </div>
          </form>
        </div>
      )}

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                  Reschedule Appointment
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: <span className="font-bold text-slate-700">{editingApt.patientName}</span>
                </p>
              </div>
              <button
                onClick={() => setEditingApt(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reschedule Date
                </label>
                <input
                  type="date"
                  required
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:00 AM">10:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
              >
                Save Rescheduled Date & Time
              </button>
            </form>
          </div>
        </div>
      )}

      {/* INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">Invoice Details</h3>
              <button onClick={() => setSelectedInvoice(null)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-3 text-sm">
              <p><span className="font-bold text-slate-500">Invoice:</span> {selectedInvoice.invoiceId || selectedInvoice.id || selectedInvoice._id}</p>
              <p><span className="font-bold text-slate-500">Patient:</span> {selectedInvoice.patientName} ({selectedInvoice.patientId})</p>
              <p><span className="font-bold text-slate-500">Description:</span> {selectedInvoice.description}</p>
              <p><span className="font-bold text-slate-500">Amount:</span> ${Number(selectedInvoice.amount).toFixed(2)}</p>
              <p><span className="font-bold text-slate-500">Status:</span> {selectedInvoice.status}</p>
              <p><span className="font-bold text-slate-500">Payment Method:</span> {selectedInvoice.method}</p>
              <p><span className="font-bold text-slate-500">Billed Date:</span> {selectedInvoice.date}</p>
            </div>
          </div>
        </div>
      )}

      {/* CREATE NEW BILL MODAL */}
      {billModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg tracking-tight">
                Create Patient Billing Invoice
              </h3>
              <button
                onClick={() => setBillModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateBill} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Patient Full Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={newBillPatient}
                  onChange={(e) => setNewBillPatient(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Service Description *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Consultation & Blood Panel"
                  value={newBillDesc}
                  onChange={(e) => setNewBillDesc(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Amount ($) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    placeholder="150.00"
                    value={newBillAmount}
                    onChange={(e) => setNewBillAmount(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newBillStatus}
                    onChange={(e) => setNewBillStatus(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="Pending">Pending</option>
                    <option value="Paid">Paid</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Payment Method
                </label>
                <select
                  value={newBillMethod}
                  onChange={(e) => setNewBillMethod(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="Cash / Reception">Cash / Reception</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3.5 rounded-xl font-bold text-sm text-white bg-gradient-to-r from-blue-600 to-teal-600 hover:from-blue-700 hover:to-teal-700 transition-all shadow-md shadow-blue-500/20"
              >
                Generate Official Invoice
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceptionistDashboard;
