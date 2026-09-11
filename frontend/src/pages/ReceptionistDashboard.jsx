import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  FileText,
  DollarSign,
  Filter,
  User,
  ShieldCheck,
  Stethoscope,
  X,
  ChevronRight,
  AlertCircle,
  Zap,
  RefreshCw,
} from "lucide-react";
import { logoutUser } from "../api";
import {
  useAllAppointmentsQuery,
  useUpdateAppointmentStatusMutation,
  useInvoicesQuery,
  useCreateInvoiceMutation,
  useUpdateInvoiceStatusMutation,
  useCreateAppointmentMutation,
} from "../hooks";

const DOCTOR_LIST = [
  "All Doctors",
  "Dr. Sarah Jenkins, MD",
  "Dr. Michael Chen, MD",
  "Dr. Emily Rodriguez, MD",
  "Dr. Marcus Vance, MD",
];

const STATUS_OPTIONS = [
  "Confirmed",
  "In Consultation",
  "Completed",
  "Rescheduled",
  "Cancelled",
];

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

  // Walk-in Token state
  const [walkinName, setWalkinName] = useState("");
  const [walkinDept, setWalkinDept] = useState("Cardiology & Heart Care");
  const [walkinDoc, setWalkinDoc] = useState("Dr. Sarah Jenkins, MD");
  const [generatedToken, setGeneratedToken] = useState(null);

  // TanStack Query Hooks for Real-Time Backend Sync & Cache Management
  const { data: fetchedAppointments, isLoading: isAptsLoading } =
    useAllAppointmentsQuery();
  const { data: fetchedInvoices, isLoading: isInvoicesLoading } =
    useInvoicesQuery();
  const updateStatusMutation = useUpdateAppointmentStatusMutation();
  const createInvoiceMutation = useCreateInvoiceMutation();
  const updateInvoiceStatusMutation = useUpdateInvoiceStatusMutation();
  const createAppointmentMutation = useCreateAppointmentMutation();

  const appointments = fetchedAppointments || [];
  const invoices = fetchedInvoices || [];

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
    } catch (err) {
      console.error("Status update failed:", err);
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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkPaid = async (invId) => {
    try {
      await updateInvoiceStatusMutation.mutateAsync({
        id: invId,
        status: "Paid",
        method: "Cash / Card",
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Walk-in Token Generator
  const handleGenerateWalkinToken = async (e) => {
    e.preventDefault();
    const newToken = "OPD-" + Math.floor(1000 + Math.random() * 9000);
    try {
      const res = await createAppointmentMutation.mutateAsync({
        patientName: walkinName || "Walk-in Patient",
        doctor: walkinDoc,
        department: walkinDept,
        date: new Date().toISOString().split("T")[0],
        timeSlot: "10:00 AM",
        status: "Confirmed",
        type: "Walk-in OPD Triage",
      });
      setGeneratedToken(
        res.appointment || { tokenNumber: newToken, patientName: walkinName },
      );
      setWalkinName("");
    } catch (err) {
      console.error(err);
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
          a.patientName.toLowerCase().includes(q) ||
          a.doctor.toLowerCase().includes(q) ||
          (a.tokenNumber && a.tokenNumber.toLowerCase().includes(q)),
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

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800">
      {/* Top Header */}
      <header className="bg-slate-900 text-white sticky top-0 z-40 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md">
              📋
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight flex items-center gap-2">
                <span>CarePlus</span>
                <span className="text-amber-400">Reception Console</span>
              </h1>
              <p className="text-[10px] text-slate-400">
                Real-time Patient Queue, Doctor Schedules & Billing
              </p>
            </div>
          </div>

          {/* User Session Info & Logout */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center space-x-2.5 px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-xs">
              <div className="w-7 h-7 rounded-full bg-amber-500 text-white font-bold flex items-center justify-center text-xs">
                {receptionistName[0].toUpperCase()}
              </div>
              <div className="text-left">
                <p className="font-bold text-slate-100 leading-tight">
                  👋 {receptionistName}
                </p>
                <span className="text-[9px] font-extrabold uppercase text-amber-400">
                  RECEPTIONIST
                </span>
              </div>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-500/20 text-rose-300 hover:bg-rose-600 hover:text-white border border-rose-500/30 text-xs font-bold transition-all"
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
        {/* Real-Time Status Notification Banner */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl p-4 text-white shadow-md flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
            </span>
            <div>
              <p className="font-extrabold text-sm leading-tight">
                ⚡ Real-Time Patient Queue Active
              </p>
              <p className="text-xs text-amber-100 mt-0.5">
                Newly booked appointments & status changes update automatically
                without page refresh.
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center space-x-2 text-xs font-extrabold bg-white/20 px-3 py-1.5 rounded-xl backdrop-blur-md">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Auto-Synced Queue ({appointments.length} Total)</span>
          </div>
        </div>

        {/* Navigation Tabs Header */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab("queue")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "queue"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>Real-time Queue ({queueList.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("doctorQueue")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "doctorQueue"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Stethoscope className="w-4 h-4" />
            <span>Doctor-wise Queue</span>
          </button>

          <button
            onClick={() => setActiveTab("billing")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "billing"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <CreditCard className="w-4 h-4" />
            <span>Billing & Invoices ({invoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab("walkin")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "walkin"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Plus className="w-4 h-4" />
            <span>Rapid Walk-in Check-in</span>
          </button>

          <button
            onClick={() => setActiveTab("profile")}
            className={`flex items-center space-x-2 px-5 py-2.5 rounded-xl font-bold text-xs transition-all ${
              activeTab === "profile"
                ? "bg-amber-500 text-white shadow-md shadow-amber-500/20"
                : "text-slate-600 hover:bg-slate-100"
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
            <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative w-full md:w-80">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  placeholder="Search by Patient, Doctor, or Token..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>

              <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
                <div className="flex items-center space-x-2">
                  <Filter className="w-4 h-4 text-slate-400" />
                  <span className="text-xs font-bold text-slate-600">
                    Filter Doctor:
                  </span>
                  <select
                    value={selectedDoctorFilter}
                    onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    {DOCTOR_LIST.map((doc, idx) => (
                      <option key={idx} value={doc}>
                        {doc}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold text-slate-600">
                    Filter Status:
                  </span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-slate-200 text-xs bg-white font-semibold focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="All">All Statuses</option>
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
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-extrabold text-slate-900">
                    Live Patient Queue (Organized by Doctor & Time)
                  </h2>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Status changes reflect immediately in real time across the
                    portal
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setActiveTab("walkin")}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md"
                  >
                    + Add Walk-in Patient
                  </button>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 border-b border-slate-200 font-bold text-slate-700 uppercase tracking-wider">
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
                    {queueList.length > 0 ? (
                      queueList.map((apt) => (
                        <tr
                          key={apt.id || apt.tokenNumber}
                          className="hover:bg-amber-50/40 transition-colors"
                        >
                          {/* Token */}
                          <td className="p-4 font-extrabold text-amber-600">
                            <span className="px-2.5 py-1 rounded-lg bg-amber-50 border border-amber-200">
                              {apt.tokenNumber || apt.id}
                            </span>
                          </td>

                          {/* Patient */}
                          <td className="p-4">
                            <p className="font-bold text-slate-900">
                              {apt.patientName}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {apt.patientId || "PT-9801"} •{" "}
                              {apt.consultationType || "OPD Checkup"}
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
                            <div className="flex items-center space-x-1 text-amber-600 font-bold mt-0.5">
                              <Clock className="w-3.5 h-3.5" />
                              <span>{apt.timeSlot}</span>
                            </div>
                          </td>

                          {/* Status Badge */}
                          <td className="p-4">
                            <span
                              className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase ${
                                apt.status === "Confirmed"
                                  ? "bg-emerald-100 text-emerald-800"
                                  : apt.status === "In Consultation"
                                    ? "bg-purple-100 text-purple-800 animate-pulse"
                                    : apt.status === "Completed"
                                      ? "bg-blue-100 text-blue-800"
                                      : apt.status === "Rescheduled"
                                        ? "bg-amber-100 text-amber-800"
                                        : "bg-rose-100 text-rose-800"
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
                              className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-800 hover:border-amber-500 focus:ring-2 focus:ring-amber-500 shadow-sm"
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
                                setEditTime(apt.timeSlot);
                              }}
                              className="inline-flex items-center space-x-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-amber-500 hover:text-white text-slate-700 font-bold transition-all text-xs"
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
                          className="p-10 text-center text-slate-400"
                        >
                          No patient queue records found matching the current
                          filters.
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
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
              <div>
                <h2 className="text-xl font-extrabold text-slate-900">
                  Doctor-Wise Patient Queues
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Real-time patient check-ins grouped by attending doctor and
                  sorted by appointment time
                </p>
              </div>

              <div className="flex items-center space-x-3 w-full md:w-auto">
                <Stethoscope className="w-5 h-5 text-amber-500" />
                <select
                  value={selectedDoctorFilter}
                  onChange={(e) => setSelectedDoctorFilter(e.target.value)}
                  className="px-4 py-2.5 rounded-xl border border-slate-200 text-sm font-bold bg-slate-50 focus:ring-2 focus:ring-amber-500"
                >
                  {DOCTOR_LIST.map((doc, idx) => (
                    <option key={idx} value={doc}>
                      {doc}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Doctor Groups */}
            {Object.keys(groupedByDoctor).map((docName, idx) => (
              <div
                key={idx}
                className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-4"
              >
                <div className="flex justify-between items-center pb-3 border-b border-slate-100">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 font-bold flex items-center justify-center">
                      👨‍⚕️
                    </div>
                    <div>
                      <h3 className="font-extrabold text-slate-900 text-base">
                        {docName}
                      </h3>
                      <p className="text-xs text-slate-500">
                        {groupedByDoctor[docName].length} Patients Scheduled
                      </p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-full border border-amber-200">
                    Live Queue Active
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {groupedByDoctor[docName].map((apt) => (
                    <div
                      key={apt.id || apt.tokenNumber}
                      className="p-4 rounded-2xl border border-slate-200 bg-slate-50/60 space-y-3 hover:border-amber-400 transition-all"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-extrabold text-amber-700 bg-amber-100 px-2 py-0.5 rounded">
                            {apt.tokenNumber || apt.id}
                          </span>
                          <h4 className="font-extrabold text-slate-900 text-sm mt-1">
                            {apt.patientName}
                          </h4>
                          <p className="text-[11px] text-slate-500">
                            {apt.consultationType || "OPD Checkup"}
                          </p>
                        </div>
                        <span
                          className={`px-2 py-0.5 text-[9px] font-extrabold rounded uppercase ${
                            apt.status === "Confirmed"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-purple-100 text-purple-800"
                          }`}
                        >
                          {apt.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-center text-xs text-slate-600 pt-1 border-t border-slate-200/60">
                        <span className="font-semibold">{apt.date}</span>
                        <strong className="text-amber-600">
                          {apt.timeSlot}
                        </strong>
                      </div>

                      {/* Instant Status Change Select */}
                      <div className="pt-1">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">
                          Instant Status Update:
                        </label>
                        <select
                          value={apt.status}
                          onChange={(e) =>
                            handleStatusChange(apt, e.target.value)
                          }
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold bg-white"
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
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Patient Billing & Invoices
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Create patient billing receipts and manage payment collection
                  statuses
                </p>
              </div>

              <button
                onClick={() => setBillModalOpen(true)}
                className="flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-amber-500 hover:bg-amber-600 transition-all shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Create New Patient Invoice</span>
              </button>
            </div>

            {/* Invoices List */}
            <div className="space-y-4">
              {invoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-bold text-slate-900 text-base">
                        {inv.id}
                      </span>
                      <span
                        className={`px-2.5 py-0.5 text-[10px] font-extrabold rounded-full uppercase ${
                          inv.status === "Paid"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-amber-100 text-amber-800"
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
                      ${inv.amount.toFixed(2)}
                    </span>

                    {inv.status === "Pending" ? (
                      <button
                        onClick={() => handleMarkPaid(inv.id)}
                        className="px-4 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 transition-colors shadow-sm"
                      >
                        Mark as Paid
                      </button>
                    ) : (
                      <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200">
                        ✓ Payment Settled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 4: RAPID WALK-IN CHECK-IN */}
        {activeTab === "walkin" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div>
                <h2 className="text-2xl font-extrabold text-slate-900">
                  Rapid Walk-in Patient OPD Triage
                </h2>
                <p className="text-xs text-slate-500 mt-1">
                  Generate immediate OPD consultation tokens for emergency or
                  walk-in patients
                </p>
              </div>

              {generatedToken && (
                <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-center space-y-2 animate-in zoom-in-95">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-white px-3 py-1 rounded-full border border-emerald-200">
                    Live Token Issued & Added to Real-Time Queue
                  </span>
                  <h3 className="text-3xl font-extrabold text-emerald-700">
                    Token #{generatedToken.tokenNumber}
                  </h3>
                  <p className="text-xs font-bold text-slate-800">
                    Patient: {generatedToken.patientName}
                  </p>
                  <p className="text-xs text-slate-600">
                    Assigned: {generatedToken.doctor} (
                    {generatedToken.department})
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Department *
                  </label>
                  <select
                    value={walkinDept}
                    onChange={(e) => setWalkinDept(e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-amber-500"
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
                    className="w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm bg-white focus:ring-2 focus:ring-amber-500"
                  >
                    <option value="Dr. Sarah Jenkins, MD">
                      Dr. Sarah Jenkins, MD
                    </option>
                    <option value="Dr. Michael Chen, MD">
                      Dr. Michael Chen, MD
                    </option>
                    <option value="Dr. Emily Rodriguez, MD">
                      Dr. Emily Rodriguez, MD
                    </option>
                    <option value="Dr. Marcus Vance, MD">
                      Dr. Marcus Vance, MD
                    </option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-4 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 shadow-lg shadow-amber-500/20 transition-all flex items-center justify-center space-x-2"
                >
                  <Plus className="w-5 h-5" />
                  <span>Issue Live OPD Token Code</span>
                </button>
              </form>
            </div>
          </div>
        )}

        {/* TAB 5: RECEPTIONIST PROFILE */}
        {activeTab === "profile" && (
          <div className="max-w-2xl mx-auto space-y-6 animate-in fade-in duration-200">
            <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
              <div className="flex items-center space-x-6 pb-6 border-b border-slate-100">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-r from-amber-500 to-orange-500 text-white font-extrabold text-3xl flex items-center justify-center shadow-lg ring-4 ring-amber-100">
                  {receptionistName[0].toUpperCase()}
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-slate-900">
                    {receptionistName}
                  </h2>
                  <p className="text-xs font-bold text-amber-600">
                    Employee ID: REC-4091
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">
                    {receptionistEmail}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Role / Designation
                  </label>
                  <p className="font-bold text-slate-900 text-sm">
                    Hospital Receptionist
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Desk Location
                  </label>
                  <p className="font-bold text-slate-900 text-sm">
                    Main OPD Entrance - Counter 2
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Current Shift
                  </label>
                  <p className="font-bold text-emerald-600 text-sm">
                    Morning Shift (08:00 AM - 04:00 PM)
                  </p>
                </div>

                <div>
                  <label className="block font-bold text-slate-400 uppercase tracking-wider mb-1">
                    System Authorization
                  </label>
                  <span className="inline-block px-2.5 py-1 rounded-md bg-emerald-100 text-emerald-800 font-bold">
                    JWT Session Verified
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* RESCHEDULE APPOINTMENT MODAL */}
      {editingApt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-extrabold text-slate-900 text-lg">
                  Reschedule Appointment Date/Time
                </h3>
                <p className="text-xs text-slate-500">
                  Patient: {editingApt.patientName}
                </p>
              </div>
              <button
                onClick={() => setEditingApt(null)}
                className="text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Time Slot
                </label>
                <select
                  value={editTime}
                  onChange={(e) => setEditTime(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="09:00 AM">09:00 AM</option>
                  <option value="10:30 AM">10:30 AM</option>
                  <option value="11:15 AM">11:15 AM</option>
                  <option value="02:00 PM">02:00 PM</option>
                  <option value="04:00 PM">04:00 PM</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md"
              >
                Save Rescheduled Date & Time
              </button>
            </form>
          </div>
        </div>
      )}

      {/* CREATE NEW BILL MODAL */}
      {billModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl border border-slate-100">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="font-extrabold text-slate-900 text-lg">
                Create Patient Billing Invoice
              </h3>
              <button
                onClick={() => setBillModalOpen(false)}
                className="text-slate-400 hover:text-slate-600"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
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
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Payment Status
                  </label>
                  <select
                    value={newBillStatus}
                    onChange={(e) => setNewBillStatus(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
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
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-sm bg-white"
                >
                  <option value="Cash / Reception">Cash / Reception</option>
                  <option value="Credit Card">Credit Card</option>
                  <option value="Insurance Claim">Insurance Claim</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl font-bold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-colors shadow-md"
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
