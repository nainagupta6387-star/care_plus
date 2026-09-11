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
    date: '2026-09-06',
    timeSlot: '10:30 AM',
    status: 'Upcoming',
    type: 'Cardiology Follow-up',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-apt-1090',
    tokenNumber: 'OPD-1090',
    patientId: 'PT-9801',
    patientName: 'Alexander Wright',
    patientEmail: 'patient@careplus-hms.com',
    doctor: 'Dr. Michael Chen, MD',
    department: 'Neurology & Brain Sciences',
    date: '2026-09-12',
    timeSlot: '02:00 PM',
    status: 'Upcoming',
    type: 'Follow-up Checkup',
    createdAt: new Date().toISOString()
  },
  {
    _id: 'mem-apt-0980',
    tokenNumber: 'OPD-0980',
    patientId: 'PT-9801',
    patientName: 'Alexander Wright',
    patientEmail: 'patient@careplus-hms.com',
    doctor: 'Dr. Emily Rodriguez, MD',
    department: 'Pediatrics & Child Health',
    date: '2026-08-20',
    timeSlot: '11:00 AM',
    status: 'Completed',
    type: 'Routine Checkup',
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
    const { doctor, department, date, timeSlot, type, reason, patientName, patientEmail, phone } = req.body;

    const email = req.user?.email || patientEmail || 'patient@careplus-hms.com';
    const name = req.user?.name || patientName || 'Patient';
    const pId = req.user?.patientId || req.user?._id || 'PT-9801';
    const tokenNumber = 'OPD-' + Math.floor(1000 + Math.random() * 9000);

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
        status: 'Upcoming'
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
        status: 'Upcoming',
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
    const { status, date, timeSlot } = req.body;

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

        const updated = await appointment.save();

        // Also sync memory store if present
        const memIndex = memoryAppointments.findIndex(a => a._id === id || a.tokenNumber === id || a.id === id);
        if (memIndex !== -1) {
          if (status) memoryAppointments[memIndex].status = status;
          if (date) memoryAppointments[memIndex].date = date;
          if (timeSlot) memoryAppointments[memIndex].timeSlot = timeSlot;
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
