import React, { useEffect, useState } from 'react';
import { Users, Stethoscope, Calendar, TrendingUp, ArrowRight, Shield, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAppointments } from '../../features/appointments/appointmentSlice';
import { fetchDoctors } from '../../features/doctors/doctorSlice';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444'];

const CustomBarTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm font-semibold text-slate-800">{label}</p>
        <p className="text-sm text-violet-600 font-medium">{payload[0].value} appointments</p>
      </div>
    );
  }
  return null;
};

const CustomPieLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, name, percent }) => {
  const RADIAN = Math.PI / 180;
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);
  if (percent < 0.05) return null;
  return (
    <text x={x} y={y} fill="white" textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={600}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { list: appointments } = useSelector((state) => state.appointments);
  const { list: doctors } = useSelector((state) => state.doctors);
  const [loading, setLoading] = React.useState(true);
  const [analyticsStats, setAnalyticsStats] = React.useState(null);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(fetchAdminAppointments({ limit: 100 })),
        dispatch(fetchDoctors({ status: 'all', limit: 100 })),
      ]);
      // Also pull the quick analytics stats for accurate revenue + today counts
      try {
        const res = await api.get('/v1/admin/analytics', { params: { timeRange: '7d' } });
        setAnalyticsStats(res.data);
      } catch (_) { /* non-fatal */ }
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const pendingDoctors = doctors.filter((d) => d.status === 'pending');

  const stats = {
    totalDoctors: doctors.filter((d) => d.status === 'approved').length,
    totalAppointments: analyticsStats?.appointments?.total ?? appointments.length,
    pendingApprovals: pendingDoctors.length,
    totalRevenue: analyticsStats?.revenue?.total ?? 0,
  };

  const chartData = [
    { name: 'Pending',   value: appointments.filter((a) => a.status === 'pending').length },
    { name: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length },
    { name: 'Completed', value: appointments.filter((a) => a.status === 'completed').length },
    { name: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length },
  ];

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Welcome Hero */}
      <div className="relative bg-gradient-to-r from-violet-600 via-purple-600 to-indigo-600 rounded-2xl p-6 overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{backgroundImage: 'radial-gradient(circle at 15% 50%, white 0%, transparent 50%), radial-gradient(circle at 85% 20%, white 0%, transparent 40%)'}} />
        <div className="relative flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-4 h-4 text-violet-200" />
              <span className="text-violet-100 text-sm font-medium">Admin Panel</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white mb-1">Platform Overview</h1>
            <p className="text-violet-100">Monitor activity and manage the platform.</p>
          </div>
          {pendingDoctors.length > 0 && (
            <Link
              to="/admin/doctors"
              className="inline-flex items-center gap-2 bg-white text-violet-600 px-5 py-2.5 rounded-xl font-semibold text-sm hover:bg-violet-50 transition-colors shadow-lg self-start sm:self-auto"
            >
              {pendingDoctors.length} Pending Approval{pendingDoctors.length > 1 ? 's' : ''}
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Stethoscope}
          label="Active Doctors"
          value={stats.totalDoctors}
          color="primary"
        />
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={stats.totalAppointments}
          color="teal"
        />
        <StatCard
          icon={Users}
          label="Pending Approvals"
          value={stats.pendingApprovals}
          color="yellow"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue (7d)"
          value={formatCurrency(stats.totalRevenue)}
          color="green"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue / Appointments chart from analytics */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Activity (Last 7 Days)</h2>
              <p className="text-sm text-slate-500">Appointments per day</p>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={analyticsStats?.revenueChart || []} barSize={32}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
              <Tooltip content={<CustomBarTooltip />} cursor={{ fill: '#f5f3ff', radius: 8 }} />
              <Bar dataKey="appointments" fill="url(#violetGrad)" radius={[6, 6, 0, 0]} />
              <defs>
                <linearGradient id="violetGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#7c3aed" />
                  <stop offset="100%" stopColor="#a78bfa" stopOpacity={0.6} />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Pie Chart */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900">Appointment Status</h2>
            <p className="text-sm text-slate-500">Current distribution</p>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={<CustomPieLabel />}
                outerRadius={80}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value, name) => [value, name]} />
            </PieChart>
          </ResponsiveContainer>
          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-4">
            {chartData.map((item, index) => (
              <div key={item.name} className="flex items-center gap-2">
                <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[index] }} />
                <span className="text-xs text-slate-600 truncate">{item.name}</span>
                <span className="text-xs font-semibold text-slate-900 ml-auto">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Pending Approvals */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Pending Doctor Approvals</h2>
            <p className="text-sm text-slate-500">
              {pendingDoctors.length === 0 ? 'All doctors reviewed' : `${pendingDoctors.length} application${pendingDoctors.length > 1 ? 's' : ''} awaiting review`}
            </p>
          </div>
          <Link
            to="/admin/doctors"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-violet-600 hover:text-violet-700 transition-colors"
          >
            Manage all
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {pendingDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
            <div className="w-12 h-12 bg-emerald-50 rounded-full flex items-center justify-center mb-3">
              <Stethoscope className="w-6 h-6 text-emerald-500" />
            </div>
            <p className="font-semibold text-slate-700 text-sm">No pending approvals</p>
            <p className="text-slate-400 text-xs mt-1">All doctor applications have been reviewed</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-50">
            {pendingDoctors.slice(0, 5).map((doctor) => (
              <div key={doctor._id} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 transition-colors">
                <Avatar
                  name={`${doctor.firstName || ''} ${doctor.lastName || ''}`.trim()}
                  src={doctor.profileImage?.url}
                  size="md"
                />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    Dr. {doctor.firstName} {doctor.lastName}
                  </p>
                  <p className="text-sm text-slate-500">{doctor.specialization}</p>
                </div>
                <StatusBadge status={doctor.status} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
