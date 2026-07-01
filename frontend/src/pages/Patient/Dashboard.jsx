import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Search, ArrowRight, Sparkles } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments } from '../../features/appointments/appointmentSlice';
import StatCard from '../../Components/shared/StatCard';
import StatusBadge from '../../Components/shared/StatusBadge';
import Spinner from '../../Components/shared/Spinner';
import Avatar from '../../Components/shared/Avatar';
import { formatDate, formatTime } from '../../utils/helpers';

const getDoctorName = (doctor) => {
  if (!doctor) return 'Unknown Doctor';
  if (doctor.firstName || doctor.lastName)
    return `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
  return doctor.name || 'Unknown Doctor';
};

const getGreeting = () => {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
};

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyAppointments({ limit: 10 }));
  }, [dispatch]);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  if (loading && appointments.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 20% 50%, white 0%, transparent 50%), radial-gradient(circle at 80% 20%, white 0%, transparent 40%)'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              <span className="text-blue-100 text-sm font-medium">{getGreeting()}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              {user?.name || 'Patient'}!
            </h1>
            <p className="text-blue-100">Here's a summary of your healthcare journey.</p>
          </div>
          <Link
            to="/patient/doctors"
            className="inline-flex items-center gap-2 bg-white text-blue-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-blue-50 transition-colors shadow-lg self-start sm:self-auto"
          >
            <Search className="w-4 h-4" />
            Find a Doctor
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={Calendar} label="Total Bookings" value={stats.total} color="primary" />
        <StatCard icon={Clock} label="Upcoming" value={stats.upcoming} color="teal" />
        <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
        <StatCard icon={XCircle} label="Cancelled" value={stats.cancelled} color="red" />
      </div>

      {/* Recent Appointments */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Recent Appointments</h2>
            <p className="text-sm text-slate-500">Your last {Math.min(appointments.length, 5)} appointments</p>
          </div>
          {appointments.length > 0 && (
            <Link
              to="/patient/appointments"
              className="inline-flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
            >
              View all
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>

        {appointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-blue-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No appointments yet</h3>
            <p className="text-slate-500 text-sm mb-4">Book your first appointment with a verified doctor.</p>
            <Link to="/patient/doctors" className="btn btn-primary btn-sm">
              Browse Doctors
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {appointments.slice(0, 5).map((appointment) => (
              <div key={appointment._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <Avatar
                  name={getDoctorName(appointment.doctor)}
                  src={appointment.doctor?.profileImage?.url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {getDoctorName(appointment.doctor)}
                  </p>
                  <p className="text-sm text-slate-500">
                    {appointment.doctor?.specialization} &bull;{' '}
                    {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                  </p>
                </div>
                <StatusBadge status={appointment.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
