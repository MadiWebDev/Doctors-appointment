import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Clock, CheckCircle, XCircle, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments } from '../../features/appointments/appointmentSlice';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';

const PatientDashboard = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchMyAppointments({ limit: 3 }));
  }, [dispatch]);

  const stats = {
    total: appointments.length,
    upcoming: appointments.filter((a) => a.status === 'confirmed' || a.status === 'pending').length,
    completed: appointments.filter((a) => a.status === 'completed').length,
    cancelled: appointments.filter((a) => a.status === 'cancelled').length,
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, {user?.name}!</h1>
        <p className="page-subtitle">Here's an overview of your appointments</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Total Bookings"
          value={stats.total}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Upcoming"
          value={stats.upcoming}
          color="teal"
        />
        <StatCard
          icon={CheckCircle}
          label="Completed"
          value={stats.completed}
          color="green"
        />
        <StatCard
          icon={XCircle}
          label="Cancelled"
          value={stats.cancelled}
          color="red"
        />
      </div>

      {/* Quick Action */}
      <div className="mb-8">
        <Link to="/patient/doctors" className="btn btn-primary">
          <Search className="w-4 h-4 mr-2" />
          Find Doctors
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">My Upcoming Appointments</h2>
        {appointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            No upcoming appointments
          </div>
        ) : (
          <div className="space-y-4">
            {appointments.slice(0, 3).map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center">
                    <Calendar className="w-6 h-6 text-primary-600" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900">{appointment.doctor?.name}</p>
                    <p className="text-sm text-slate-600">
                      {formatDate(appointment.date)} at {formatTime(appointment.time)}
                    </p>
                  </div>
                </div>
                <span className={`badge badge-${appointment.status === 'confirmed' ? 'confirmed' : appointment.status === 'pending' ? 'pending' : 'cancelled'}`}>
                  {appointment.status}
                </span>
              </div>
            ))}
          </div>
        )}
        {appointments.length > 0 && (
          <div className="mt-4">
            <Link to="/patient/appointments" className="btn btn-secondary btn-sm">
              View All
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default PatientDashboard;
