/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/layout/Navbar';
import { Footer } from './components/layout/Footer';
import { DashboardLayout } from './components/layout/DashboardLayout';

// Public Pages
import Home from './pages/public/Home';
import About from './pages/public/About';
import Doctors from './pages/public/Doctors';
import DoctorProfile from './pages/public/DoctorProfile';
import BookAppointment from './pages/public/BookAppointment';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import ForgotPassword from './pages/auth/ForgotPassword';

// Patient Pages
import PatientDashboard from './pages/patient/Dashboard';
import PatientAppointments from './pages/patient/Appointments';
import PatientRecords from './pages/patient/Records';
import PatientBilling from './pages/patient/Billing';
import PatientMessages from './pages/patient/Messages';
import PatientSettings from './pages/patient/Settings';

// Doctor Pages
import DoctorDashboard from './pages/doctor/Dashboard';
import DoctorPatients from './pages/doctor/Patients';
import DoctorPatientProfile from './pages/doctor/PatientProfile';
import DoctorAppointments from './pages/doctor/Appointments';
import DoctorSchedule from './pages/doctor/Schedule';
import DoctorMessages from './pages/doctor/Messages';
import DoctorSettings from './pages/doctor/Settings';

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard';
import AdminDoctors from './pages/admin/Doctors';
import AdminPatients from './pages/admin/Patients';
import AdminAppointments from './pages/admin/Appointments';
import AdminDepartments from './pages/admin/Departments';
import AdminReports from './pages/admin/Reports';
import AdminSettings from './pages/admin/Settings';

export default function App() {
  return (
    <AppProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<><Navbar /><Home /><Footer /></>} />
          <Route path="/about" element={<><Navbar /><About /><Footer /></>} />
          <Route path="/doctors" element={<><Navbar /><Doctors /><Footer /></>} />
          <Route path="/doctors/:id" element={<><Navbar /><DoctorProfile /><Footer /></>} />
          <Route path="/book-appointment" element={<><Navbar /><BookAppointment /><Footer /></>} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<><Navbar /><Login /><Footer /></>} />
          <Route path="/register" element={<><Navbar /><Register /><Footer /></>} />
          <Route path="/forgot-password" element={<><Navbar /><ForgotPassword /><Footer /></>} />

          {/* Patient Portal */}
          <Route path="/patient" element={<DashboardLayout allowedRoles={['patient']} />}>
            <Route index element={<PatientDashboard />} />
            <Route path="appointments" element={<PatientAppointments />} />
            <Route path="records" element={<PatientRecords />} />
            <Route path="billing" element={<PatientBilling />} />
            <Route path="messages" element={<PatientMessages />} />
            <Route path="settings" element={<PatientSettings />} />
            <Route path="*" element={<Navigate to="/patient" replace />} />
          </Route>

          {/* Doctor Portal */}
          <Route path="/doctor" element={<DashboardLayout allowedRoles={['doctor']} />}>
            <Route index element={<DoctorDashboard />} />
            <Route path="patients" element={<DoctorPatients />} />
            <Route path="patients/:id" element={<DoctorPatientProfile />} />
            <Route path="appointments" element={<DoctorAppointments />} />
            <Route path="schedule" element={<DoctorSchedule />} />
            <Route path="messages" element={<DoctorMessages />} />
            <Route path="settings" element={<DoctorSettings />} />
            <Route path="*" element={<Navigate to="/doctor" replace />} />
          </Route>

          {/* Admin Portal */}
          <Route path="/admin" element={<DashboardLayout allowedRoles={['admin']} />}>
            <Route index element={<AdminDashboard />} />
            <Route path="doctors" element={<AdminDoctors />} />
            <Route path="patients" element={<AdminPatients />} />
            <Route path="appointments" element={<AdminAppointments />} />
            <Route path="departments" element={<AdminDepartments />} />
            <Route path="reports" element={<AdminReports />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="*" element={<Navigate to="/admin" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AppProvider>
  );
}
