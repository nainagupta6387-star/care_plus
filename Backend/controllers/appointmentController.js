import Appointment from '../models/Appointment.js';

// Pre-seeded Memory Store for appointments when MongoDB is offline
export const memoryAppointments = [
  {
    _id: 'mem-apt-1082',
    tokenNumber: 'OPD-1082',
    patientId: 'PT-9801',
    patientName: 'Alexander Wright',
    patientEmail: 'patient@careplus-hms.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '10:30 AM',
    status: 'In Consultation',
    type: 'Cardiology Follow-up',
    priority: 'High',
    age: 34,
    gender: 'Male',
    vitals: {
      bloodPressure: '120 / 80 mmHg',
      heartRate: '72 BPM',
      spo2: '99% SpO2',
      temperature: '98.4 °F'
    },
    reason: 'Follow-up on hyperlipidemia & mild hypertension',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-apt-1090',
    tokenNumber: 'OPD-1090',
    patientId: 'PT-9802',
    patientName: 'Maria Garcia',
    patientEmail: 'maria.garcia@gmail.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '11:15 AM',
    status: 'Waiting',
    type: 'Chest Pain Evaluation',
    priority: 'Emergency',
    age: 42,
    gender: 'Female',
    vitals: {
      bloodPressure: '135 / 88 mmHg',
      heartRate: '88 BPM',
      spo2: '97% SpO2',
      temperature: '99.1 °F'
    },
    reason: 'Acute retrosternal discomfort after exertion',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-apt-1104',
    tokenNumber: 'OPD-1104',
    patientId: 'PT-9803',
    patientName: 'David Thorne',
    patientEmail: 'david.thorne@yahoo.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    date: new Date().toISOString().split('T')[0],
    timeSlot: '02:00 PM',
    status: 'Upcoming',
    type: 'Routine ECG Check',
    priority: 'Routine',
    age: 58,
    gender: 'Male',
    vitals: {
      bloodPressure: '118 / 76 mmHg',
      heartRate: '68 BPM',
      spo2: '98% SpO2',
      temperature: '98.6 °F'
    },
    reason: 'Annual preventive cardiovascular checkup',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-apt-0980',
    tokenNumber: 'OPD-0980',
    patientId: 'PT-9804',
    patientName: 'Eleanor Vance',
    patientEmail: 'eleanor.vance@gmail.com',
    doctor: 'Dr. Sarah Jenkins, MD',
    department: 'Cardiology & Heart Care',
    date: '2026-08-20',
    timeSlot: '11:00 AM',
    status: 'Completed',
    type: 'Post-Op Cardiac Followup',
    priority: 'Normal',
    age: 61,
    gender: 'Female',
    vitals: {
      bloodPressure: '122 / 82 mmHg',
      heartRate: '70 BPM',
      spo2: '99% SpO2',
      temperature: '98.5 °F'
    },
    reason: 'Post-CABG 30-day evaluation',
    createdAt: new Date().toISOString()
  }
];

// Helper to calculate statistics
const calculateStats = (aptList) => {
  const total = aptList.length;
  const upcoming = aptList.filter(a => ['Upcoming', 'Confirmed', 'In Consultation', 'Rescheduled'].includes(a.status)).length;
  const completed = aptList.filter(a => a.status === 'Completed').length;
  const cancelled = aptList.filter(a => a.status === 'Cancelled').length;

  return { total, upcoming, completed, cancelled };
};

// @desc    Create a new appointment
// @route   POST /api/appointments
// @access  Private (Patient / Receptionist)
export const createAppointment = async (req, res, next) => {
  try {
    const { doctor, department, date, timeSlot, type, reason, patientName, patientEmail, status } = req.body;

    const isStaff = ['receptionist', 'admin'].includes(req.user?.role);
    const email = isStaff ? (patientEmail || 'patient@careplus-hms.com') : (req.user?.email || patientEmail || 'patient@careplus-hms.com');
    const name = isStaff ? (patientName || 'Patient') : (req.user?.name || patientName || 'Patient');
    const pId = isStaff ? (req.body.patientId || 'PT-' + Math.floor(1000 + Math.random() * 9000)) : (req.user?.patientId || req.user?._id || 'PT-9801');
    const tokenNumber = 'OPD-' + Math.floor(1000 + Math.random() * 9000);
    const appointmentStatus = isStaff && status ? status : 'Upcoming';

    try {
      const appointment = await Appointment.create({
        patient: req.user?._id || null,
        patientId: pId,
        patientName: name,
        patientEmail: email,
        doctor,
        department,
        date,
        timeSlot,
        tokenNumber,
        type: type || 'OPD Consultation',
        reason: reason || '',
        status: appointmentStatus
      });

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully',
        appointment
      });
    } catch (dbErr) {
      // Memory Fallback
      const newMemApt = {
        _id: 'mem-apt-' + Math.floor(1000 + Math.random() * 9000),
        tokenNumber,
        patientId: pId,
        patientName: name,
        patientEmail: email.toLowerCase(),
        doctor,
        department,
        date,
        timeSlot,
        type: type || 'OPD Consultation',
        reason: reason || '',
        status: appointmentStatus,
        createdAt: new Date().toISOString()
      };
      memoryAppointments.unshift(newMemApt);

      return res.status(201).json({
        success: true,
        message: 'Appointment booked successfully (Local Memory)',
        appointment: newMemApt
      });
    }
  } catch (error) {
    next(error);
  }
};

// @desc    Get appointments & real-time stats for logged-in patient
// @route   GET /api/appointments/my-appointments
// @access  Private (Patient)
export const getMyAppointments = async (req, res, next) => {
  try {
    const userEmail = (req.user?.email || '').toLowerCase();
    const userId = req.user?._id?.toString() || '';

    let userAppointments = [];

    try {
      // Query MongoDB
      const dbAppointments = await Appointment.find({
        $or: [
          { patient: req.user?._id },
          { patientEmail: userEmail },
          { patientId: req.user?.patientId }
        ]
      }).sort({ createdAt: -1 });

      if (dbAppointments && dbAppointments.length > 0) {
        userAppointments = dbAppointments;
      }
    } catch (dbErr) {
      // Fallback
    }

    // Merge memory appointments if user matches
    const memList = memoryAppointments.filter(a => 
      a.patientEmail.toLowerCase() === userEmail ||
      a.patientId === req.user?.patientId ||
      userEmail === 'patient@careplus-hms.com'
    );

    // Combine avoiding duplicates
    const combinedMap = new Map();
    [...userAppointments, ...memList].forEach(item => {
      const key = item._id ? item._id.toString() : item.tokenNumber;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    });

    const finalAppointments = Array.from(combinedMap.values());
    const statistics = calculateStats(finalAppointments);

    return res.json({
      success: true,
      statistics,
      appointments: finalAppointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all appointments (For Receptionist & Admin)
// @route   GET /api/appointments/all
// @access  Private (Receptionist / Admin)
export const getAllAppointments = async (req, res, next) => {
  try {
    let dbAppointments = [];
    try {
      dbAppointments = await Appointment.find().sort({ createdAt: -1 });
    } catch (dbErr) {}

    const combinedMap = new Map();
    [...dbAppointments, ...memoryAppointments].forEach(item => {
      const key = item._id ? item._id.toString() : item.tokenNumber;
      if (!combinedMap.has(key)) {
        combinedMap.set(key, item);
      }
    });

    const finalAppointments = Array.from(combinedMap.values());
    const statistics = calculateStats(finalAppointments);

    return res.json({
      success: true,
      statistics,
      appointments: finalAppointments
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update appointment status
// @route   PUT /api/appointments/:id/status
// @access  Private (Receptionist / Patient / Doctor)
export const updateAppointmentStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, date, timeSlot, vitals, priority, reason } = req.body;

    // DB Update
    try {
      let appointment = null;
      try {
        appointment = await Appointment.findById(id);
      } catch (err) {
        appointment = await Appointment.findOne({ tokenNumber: id });
      }

      if (appointment) {
        if (status) appointment.status = status;
        if (date) appointment.date = date;
        if (timeSlot) appointment.timeSlot = timeSlot;
        if (vitals) appointment.vitals = { ...appointment.vitals, ...vitals };
        if (priority) appointment.priority = priority;
        if (reason) appointment.reason = reason;

        const updated = await appointment.save();

        // Also sync memory store if present
        const memIndex = memoryAppointments.findIndex(a => a._id === id || a.tokenNumber === id || a.id === id);
        if (memIndex !== -1) {
          if (status) memoryAppointments[memIndex].status = status;
          if (date) memoryAppointments[memIndex].date = date;
          if (timeSlot) memoryAppointments[memIndex].timeSlot = timeSlot;
          if (vitals) memoryAppointments[memIndex].vitals = { ...memoryAppointments[memIndex].vitals, ...vitals };
          if (priority) memoryAppointments[memIndex].priority = priority;
          if (reason) memoryAppointments[memIndex].reason = reason;
        }

        return res.json({
          success: true,
          message: 'Appointment status updated successfully',
          appointment: updated
        });
      }
    } catch (dbErr) {}

    // Memory Store Update
    const memIndex = memoryAppointments.findIndex(a => a._id === id || a.tokenNumber === id || a.id === id);
    if (memIndex !== -1) {
      if (status) memoryAppointments[memIndex].status = status;
      if (date) memoryAppointments[memIndex].date = date;
      if (timeSlot) memoryAppointments[memIndex].timeSlot = timeSlot;
      if (vitals) memoryAppointments[memIndex].vitals = { ...memoryAppointments[memIndex].vitals, ...vitals };
      if (priority) memoryAppointments[memIndex].priority = priority;
      if (reason) memoryAppointments[memIndex].reason = reason;

      return res.json({
        success: true,
        message: 'Appointment status updated successfully',
        appointment: memoryAppointments[memIndex]
      });
    }

    return res.status(404).json({ success: false, message: 'Appointment not found' });
  } catch (error) {
    next(error);
  }
};
