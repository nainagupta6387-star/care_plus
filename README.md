# 🏥 CarePlus HMS - Hospital Management System

A modern, high-performance, full-stack Hospital Management System built with **React 19**, **Vite**, **Tailwind CSS v4**, **TanStack Query v5**, **Node.js**, **Express**, **MongoDB**, and **JWT Authentication**.

---

## 🌟 Key Features

### 🔐 1. Authentication & Role Security
- **Role-Based Login System**: Role selection dropdown (`Patient`, `Doctor`, `Receptionist`) with **strict backend JWT role enforcement**.
- **Backend Role Verification**: Prevents unauthorized login attempts (e.g. logging in as Doctor with a Patient account returns an explicit backend role mismatch error).
- **JWT Protection**: Tokens auto-attached to all protected backend requests via centralized headers.
- **BCrypt Encryption**: Passwords securely hashed with `bcryptjs`.
- **Public & Protected Route Guards**: Logged-in users are restricted from re-accessing login/register pages until logout; protected dashboards require authentication.

### 📋 2. Real-Time Receptionist Console & Patient Queue
- **Live Patient Queue**: Real-time queue organized by doctor and appointment time slot.
- **Instant Status Updates**: Receptionist can update appointment statuses (`Confirmed`, `In Consultation`, `Completed`, `Rescheduled`, `Cancelled`) with zero page refreshes.
- **Real-Time Patient Sync**: Status changes automatically reflect on the Patient Dashboard in real time via **TanStack Query** polling.
- **Doctor-Wise Queue View**: Filter and inspect queue cards grouped by attending physician.
- **Rapid Walk-in OPD Check-in**: Generates immediate OPD consultation token codes for emergency/walk-in patients.

### 🩺 3. Patient Portal & Booking Flow
- **Real-Time Statistics**: Live database counts for Total, Upcoming, Completed, and Cancelled appointments.
- **Seamless Appointment Booking**: Booking flow checks authentication status; redirects unauthenticated users to Login and automatically resumes booking post-authentication.
- **E-Prescriptions & Diagnostic Reports**: View medication charts and diagnostic laboratory results.

### 💳 4. Billing & Invoice Management
- **Invoice Creation**: Receptionist can issue itemized receipts for consultations, lab tests, and hospital care.
- **Payment Collection Statuses**: Instant status toggles (`Pending` ➔ `Paid`) and billing history receipts.

### 🌐 5. Centralized API Architecture
- **Centralized API Service (`frontend/src/api/apiService.js`)**: Single source of truth for all HTTP API calls.
- **TanStack Query Integration (`frontend/src/hooks/useApiQueries.js`)**: Automatic caching, background refetching, and instant mutation invalidations.
- **Multi-Port Failover**: Automatic connection fallback across backend ports (`5000`, `5001`).

---

## 🛠️ Tech Stack

| Domain | Technology |
|---|---|
| **Frontend Framework** | React 19, Vite |
| **Styling & UI** | Tailwind CSS v4, Lucide React Icons |
| **State & Data Fetching** | TanStack Query v5 (`@tanstack/react-query`) |
| **Routing** | React Router DOM v7 |
| **Backend Runtime** | Node.js, Express.js |
| **Database** | MongoDB, Mongoose ODM |
| **Security & Auth** | JSON Web Tokens (`jsonwebtoken`), `bcryptjs`, CORS |

---

## 📁 Repository Structure

```
CARE_PLUS/
├── Backend/
│   ├── config/             # Database connection setup
│   ├── controllers/        # Patient, Appointment, and Billing controllers
│   ├── middleware/         # JWT auth middleware & error handlers
│   ├── models/             # Mongoose schemas (Patient, Appointment, Billing)
│   ├── routes/             # Express API routes
│   └── server.js           # Server entry point
├── frontend/
│   ├── src/
│   │   ├── api/            # Centralized API Service (apiService.js)
│   │   ├── components/     # Navbar, Footer, and Common UI components
│   │   ├── hooks/          # Centralized TanStack Query hooks (useApiQueries.js)
│   │   ├── layouts/        # Main App Layout
│   │   └── pages/          # Patient, Receptionist, Doctor, Login, Register pages
│   └── index.html
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher
- **MongoDB**: Local MongoDB instance or MongoDB Atlas Connection URI

### 2. Clone the Repository
```bash
git clone https://github.com/kunalgupta78612/CARE_PLUS.git
cd CARE_PLUS
```

### 3. Setup & Run Backend Server
```bash
cd Backend
npm install
npm run dev
```
*The Express backend server will start on `http://localhost:5000`.*

### 4. Setup & Run Frontend Client
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*The Vite development server will start on `http://localhost:5173`.*

---

## 🔑 Demo Login Credentials

You can use the 1-click demo buttons on the Login page or use the credentials below:

| Role | Email | Password | Access Level |
|---|---|---|---|
| **Patient** | `patient@careplus-hms.com` | `demo12345` | Patient Dashboard, Appointment Booking |
| **Doctor** | `dr.jenkins@careplus-hms.com` | `demo12345` | Doctor Queue & Patient Consultations |
| **Receptionist** | `staff@careplus-hms.com` | `demo12345` | Real-time Queue, Rescheduling, Billing |

---

## 🔌 API Endpoints Overview

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `POST` | `/api/patient/register` | Register new account | Public |
| `POST` | `/api/patient/login` | Login with email, password & role check | Public |
| `GET` | `/api/patient/profile` | Get logged-in user profile | `Bearer JWT` |
| `GET` | `/api/appointments/my-appointments` | Get patient appointments & statistics | `Bearer JWT` |
| `GET` | `/api/appointments/all` | Get all patient queue records | `Bearer JWT` |
| `POST` | `/api/appointments` | Book new OPD appointment token | `Bearer JWT` |
| `PUT` | `/api/appointments/:id/status` | Update status or reschedule appointment | `Bearer JWT` |
| `GET` | `/api/billing` | Get all invoices | `Bearer JWT` |
| `POST` | `/api/billing` | Create new billing invoice | `Bearer JWT` |
| `PUT` | `/api/billing/:id/status` | Update invoice payment status | `Bearer JWT` |

---

## 📄 License

This project is open-source and available for educational and college minor project purposes.
