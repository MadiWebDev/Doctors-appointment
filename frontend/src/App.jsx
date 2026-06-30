import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { initializeAuth } from './features/auth/authSlice';
import { useAuth } from './hooks/useAuth';
import ProtectedRoute from './Components/shared/ProtectedRoute';
import Spinner from './Components/shared/Spinner';
import DashboardLayout from './layouts/DashboardLayout';

// Auth Pages
import Login from './pages/Auth/Login';
import PatientRegister from './pages/Auth/PatientRegister';
import DoctorRegister from './pages/Auth/DoctorRegister';
import ForgotPassword from './pages/Auth/ForgotPassword';
import ResetPassword from './pages/Auth/ResetPassword';

// Patient Pages
import PatientDashboard from './pages/Patient/Dashboard';
import FindDoctors from './pages/Patient/FindDoctors';
import DoctorProfile from './pages/Patient/DoctorProfile';
import BookAppointment from './pages/Patient/BookAppointment';
import PatientAppointments from './pages/Patient/Appointments';
import PatientNotifications from './pages/Patient/Notifications';

// Doctor Pages
import DoctorDashboard from './pages/Doctor/Dashboard';
import DoctorAppointments from './pages/Doctor/Appointments';
import Availability from './pages/Doctor/Availability';
import DoctorProfilePage from './pages/Doctor/Profile';
import DoctorNotifications from './pages/Doctor/Notifications';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import AdminDoctors from './pages/Admin/Doctors';
import AdminPatients from './pages/Admin/Patients';
import AdminAppointments from './pages/Admin/Appointments';
import Analytics from './pages/Admin/Analytics';
import Specializations from './pages/Admin/Specializations';

// NotFound
import NotFound from './pages/NotFound';

function App() {
  const dispatch = useDispatch();
  const { initialized, loading } = useAuth();

  React.useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  if (!initialized || loading) {
    return <Spinner fullPage />;
  }

  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<PatientRegister />} />
        <Route path="/doctor-register" element={<DoctorRegister />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Patient Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles="patient" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/patient/dashboard" element={<PatientDashboard />} />
            <Route path="/patient/doctors" element={<FindDoctors />} />
            <Route path="/patient/doctors/:id" element={<DoctorProfile />} />
            <Route path="/patient/book/:id" element={<BookAppointment />} />
            <Route path="/patient/appointments" element={<PatientAppointments />} />
            <Route path="/patient/notifications" element={<PatientNotifications />} />
          </Route>
        </Route>

        {/* Doctor Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles="doctor" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/doctor/dashboard" element={<DoctorDashboard />} />
            <Route path="/doctor/appointments" element={<DoctorAppointments />} />
            <Route path="/doctor/availability" element={<Availability />} />
            <Route path="/doctor/profile" element={<DoctorProfilePage />} />
            <Route path="/doctor/notifications" element={<DoctorNotifications />} />
          </Route>
        </Route>

        {/* Admin Protected Routes */}
        <Route element={<ProtectedRoute allowedRoles="admin" />}>
          <Route element={<DashboardLayout />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/doctors" element={<AdminDoctors />} />
            <Route path="/admin/patients" element={<AdminPatients />} />
            <Route path="/admin/appointments" element={<AdminAppointments />} />
            <Route path="/admin/analytics" element={<Analytics />} />
            <Route path="/admin/specializations" element={<Specializations />} />
          </Route>
        </Route>

        {/* Default redirect */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </Router>
  );
}

export default App;