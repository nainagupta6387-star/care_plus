import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import patientRoutes from './routes/patientRoutes.js';
import appointmentRoutes from './routes/appointmentRoutes.js';
import billingRoutes from './routes/billingRoutes.js';
import prescriptionRoutes from './routes/prescriptionRoutes.js';
import admissionRoutes from './routes/admissionRoutes.js';
import { errorHandler } from './middleware/errorMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load Environment Variables
dotenv.config();

const app = express();

// Permissive CORS for local development
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve Static Assets & Control Center UI matching Frontend Design
app.use(express.static(path.join(__dirname, 'public')));

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'Healthy',
    service: 'CarePlus HMS Backend Authentication API',
    timestamp: new Date().toISOString(),
  });
});

// Web UI Routes for Backend Command Center
app.get(['/', '/admin', '/docs', '/dashboard', '/api-explorer'], (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// API Routes
app.use('/api/patient', patientRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/prescriptions', prescriptionRoutes);
app.use('/api/admissions', admissionRoutes);

// Global Error Handler
app.use(errorHandler);

const DEFAULT_PORT = parseInt(process.env.PORT || '5000', 10);

const startServer = (port) => {
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`🚀 CarePlus HMS Backend Server listening on http://localhost:${port}`);
    console.log(`🔒 Patient Auth Endpoint: http://localhost:${port}/api/patient`);
  });

  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`⚠️ Port ${port} is occupied. Trying port ${port + 1}...`);
      startServer(port + 1);
    } else {
      console.error('Server error:', err);
    }
  });
};

connectDB().finally(() => startServer(DEFAULT_PORT));
