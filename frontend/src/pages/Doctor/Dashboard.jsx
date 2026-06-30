import React, { useEffect } from 'react';
import { Calendar, Users, Clock, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorAppointments } from '../../features/appointments/appointmentSlice';
import { fetchDoctorDashboard as fetchDocDashboard } from '../../features/doctors/doctorSlice';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboard } = useSelector((state) => state.doctors);
  const { list: appointments, loading } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchDoctorAppointments({ limit: 5 }));
    dispatch(fetchDocDashboard());
  }, [dispatch]);

  const todayAppointments = appointments.filter((apt) => {
    const today = new Date().toISOString().split('T')[0];
    return apt.date === today;
  });

  const chartData = dashboard?.weeklyAppointments || [
    { day: 'Mon', count: 4 },
    { day: 'Tue', count: 6 },
    { day: 'Wed', count: 8 },
    { day: 'Thu', count: 5 },
    { day: 'Fri', count: 7 },
    { day: 'Sat', count: 3 },
    { day: 'Sun', count: 2 },
  ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Welcome back, Dr. {user?.name}!</h1>
        <p className="page-subtitle">Here's an overview of your practice</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={todayAppointments.length}
          color="primary"
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={dashboard?.totalPatients || 0}
          color="teal"
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={appointments.filter((a) => a.status === 'pending').length}
          color="yellow"
        />
        <StatCard
          icon={DollarSign}
          label="Monthly Earnings"
          value={formatCurrency(dashboard?.monthlyEarnings || 0)}
          color="green"
        />
      </div>

      {/* Weekly Appointments Chart */}
      <div className="card p-6 mb-8">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Appointments This Week</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="count" fill="#1a408a" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Today's Queue */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Today's Queue</h2>
        {todayAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No appointments today</div>
        ) : (
          <div className="space-y-4">
            {todayAppointments.map((appointment) => (
              <div key={appointment._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <Avatar name={appointment.patient?.name} size="md" />
                  <div>
                    <p className="font-medium text-slate-900">{appointment.patient?.name}</p>
                    <p className="text-sm text-slate-600">{formatTime(appointment.time)}</p>
                  </div>
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

export default DoctorDashboard;
