import React, { useEffect } from 'react';
import { Calendar, Users, Clock, DollarSign, TrendingUp, ArrowRight, Stethoscope } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorAppointments } from '../../features/appointments/appointmentSlice';
import { fetchDoctorDashboard } from '../../features/doctors/doctorSlice';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { Link } from 'react-router-dom';

const getPatientName = (patient) => {
  if (!patient) return 'Unknown Patient';
  return patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown';
};

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-teal-600 font-medium">{payload[0].value} appointments</p>
      </div>
    );
  }
  return null;
};

const DoctorDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { dashboard } = useSelector((state) => state.doctors);
  const { list: appointments, loading } = useSelector((state) => state.appointments);

  useEffect(() => {
    dispatch(fetchDoctorAppointments({ limit: 20 }));
    dispatch(fetchDoctorDashboard());
  }, [dispatch]);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayAppointments = appointments.filter((apt) => {
    if (!apt.appointmentDate) return false;
    return new Date(apt.appointmentDate).toISOString().split('T')[0] === todayStr;
  });

  const weeklyData = (() => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const counts = Array(7).fill(0);
    appointments.forEach((apt) => {
      if (!apt.appointmentDate) return;
      const d = new Date(apt.appointmentDate);
      const diff = Math.floor((Date.now() - d.getTime()) / 86400000);
      if (diff >= 0 && diff < 7) {
        counts[d.getDay()] += 1;
      }
    });
    return days.map((day, i) => ({ day, appointments: counts[i] }));
  })();

  if (loading && appointments.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative bg-gradient-to-r from-teal-600 via-emerald-600 to-cyan-600 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 10% 50%, white 0%, transparent 50%), radial-gradient(circle at 90% 20%, white 0%, transparent 40%)'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Stethoscope className="w-4 h-4 text-teal-200" />
              <span className="text-teal-100 text-sm font-medium">Doctor Portal</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Dr. {user?.name}
            </h1>
            <p className="text-teal-100">Here's an overview of your practice today.</p>
          </div>
          <Link
            to="/doctor/appointments"
            className="inline-flex items-center gap-2 bg-white text-teal-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-teal-50 transition-colors shadow-lg self-start sm:self-auto"
          >
            Manage Appointments
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Today's Appointments"
          value={todayAppointments.length}
          color="teal"
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={dashboard?.totalAppointments || appointments.length}
          color="primary"
        />
        <StatCard
          icon={Clock}
          label="Pending Requests"
          value={appointments.filter((a) => a.status === 'pending').length}
          color="yellow"
        />
        <StatCard
          icon={DollarSign}
          label="Consultation Fee"
          value={formatCurrency(dashboard?.consultationFee || 0)}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Weekly Chart */}
        <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Weekly Activity</h2>
              <p className="text-sm text-slate-500">Appointments in the last 7 days</p>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-teal-600 bg-teal-50 px-3 py-1.5 rounded-lg font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              This week
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={weeklyData} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f0fdf4', radius: 8 }} />
              <Bar dataKey="appointments" fill="url(#tealGrad)" radius={[6, 6, 0, 0]} name="Appointments" />
              <defs>
                <linearGradient id="tealGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#0d9488" />
                  <stop offset="100%" stopColor="#14b8a6" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Today's Quick Stats */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="bg-gradient-to-br from-teal-50 to-emerald-50 border border-teal-100 rounded-2xl p-5">
            <p className="text-sm font-medium text-teal-700 mb-1">Confirmed today</p>
            <p className="text-4xl font-bold text-teal-800">
              {todayAppointments.filter((a) => a.status === 'confirmed').length}
            </p>
            <p className="text-xs text-teal-600 mt-1">out of {todayAppointments.length} total</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-orange-50 border border-amber-100 rounded-2xl p-5">
            <p className="text-sm font-medium text-amber-700 mb-1">Awaiting confirmation</p>
            <p className="text-4xl font-bold text-amber-800">
              {appointments.filter((a) => a.status === 'pending').length}
            </p>
            <p className="text-xs text-amber-600 mt-1">pending requests</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100 rounded-2xl p-5">
            <p className="text-sm font-medium text-emerald-700 mb-1">Completed all time</p>
            <p className="text-4xl font-bold text-emerald-800">
              {appointments.filter((a) => a.status === 'completed').length}
            </p>
            <p className="text-xs text-emerald-600 mt-1">total consultations</p>
          </div>
        </div>
      </div>

      {/* Today's Queue */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Today's Queue</h2>
            <p className="text-sm text-slate-500">
              {todayAppointments.length === 0 ? 'No appointments today' : `${todayAppointments.length} patient${todayAppointments.length > 1 ? 's' : ''} scheduled`}
            </p>
          </div>
          <Link
            to="/doctor/appointments"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-teal-600 hover:text-teal-700 transition-colors"
          >
            Manage
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {todayAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-teal-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-teal-400" />
            </div>
            <h3 className="font-semibold text-slate-800 mb-1">No appointments today</h3>
            <p className="text-slate-500 text-sm">Enjoy your free day!</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {todayAppointments.map((appointment, idx) => (
              <div key={appointment._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-700 text-sm font-bold flex items-center justify-center flex-shrink-0">
                  {idx + 1}
                </div>
                <Avatar name={getPatientName(appointment.patient)} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {getPatientName(appointment.patient)}
                  </p>
                  <p className="text-sm text-slate-500">{formatTime(appointment.appointmentTime)}</p>
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
