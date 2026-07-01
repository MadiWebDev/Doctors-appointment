import React, { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  AreaChart, Area, PieChart, Pie, Cell,
} from 'recharts';
import { Calendar, DollarSign, Users, TrendingUp, Stethoscope } from 'lucide-react';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import Avatar from '../../Components/shared/Avatar';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const COLORS = ['#22c55e', '#eab308', '#0284c7', '#ef4444', '#64748b'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl shadow-lg px-4 py-3">
        <p className="text-sm font-semibold text-slate-800 dark:text-white mb-1">{label}</p>
        {payload.map((p, i) => (
          <p key={i} className="text-sm font-medium" style={{ color: p.color }}>
            {p.name}:{' '}
            {p.name.toLowerCase().includes('revenue')
              ? formatCurrency(p.value)
              : p.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);
  const [timeRange, setTimeRange] = useState('7d');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/admin/analytics', { params: { timeRange } });
      setAnalytics(response.data);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <Spinner />;

  // ── Map backend response fields ────────────────────────────────────────────
  // Backend returns: { revenue, appointments, doctors, users, appointmentStatus, revenueChart, topDoctors }
  const totalRevenue      = analytics?.revenue?.total ?? 0;
  const revenueChange     = analytics?.revenue?.change ?? 0;
  const totalAppointments = analytics?.appointments?.total ?? 0;
  const apptChange        = analytics?.appointments?.change ?? 0;
  const activeDoctors     = analytics?.doctors?.active ?? 0;
  const doctorsChange     = analytics?.doctors?.change ?? 0;
  const totalUsers        = analytics?.users?.total ?? 0;
  const usersChange       = analytics?.users?.change ?? 0;

  // revenueChart: [{ date, revenue, appointments }]
  const revenueChart = analytics?.revenueChart || [];

  // appointmentStatus: [{ name, value, color }]
  const statusData = analytics?.appointmentStatus || [];

  // topDoctors: [{ name, appointments, revenue, rating }]
  const topDoctors = analytics?.topDoctors || [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Platform performance insights and trends</p>
        </div>
        {/* Time range selector */}
        <div className="flex gap-2">
          {[
            { label: '7 days', value: '7d' },
            { label: '30 days', value: '30d' },
            { label: '90 days', value: '90d' },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setTimeRange(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                timeRange === opt.value
                  ? 'bg-gradient-to-r from-violet-600 to-purple-700 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Calendar}
          label="Appointments"
          value={totalAppointments}
          color="primary"
          trend={Number(apptChange)}
          trendLabel="vs prev period"
        />
        <StatCard
          icon={DollarSign}
          label="Revenue"
          value={formatCurrency(totalRevenue)}
          color="teal"
          trend={Number(revenueChange)}
          trendLabel="vs prev period"
        />
        <StatCard
          icon={Stethoscope}
          label="Active Doctors"
          value={activeDoctors}
          color="violet"
          trend={Number(doctorsChange)}
          trendLabel="vs prev period"
        />
        <StatCard
          icon={Users}
          label="Total Patients"
          value={totalUsers}
          color="green"
          trend={Number(usersChange)}
          trendLabel="vs prev period"
        />
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue + Appointments area chart */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="mb-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Revenue &amp; Appointments</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">Daily trend for selected period</p>
          </div>
          {revenueChart.length === 0 ? (
            <div className="flex items-center justify-center h-48 text-slate-400 text-sm">No data for this period</div>
          ) : (
            <ResponsiveContainer width="100%" height={240}>
              <AreaChart data={revenueChart}>
                <defs>
                  <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="apptGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d9488" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#0d9488" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="revenue" stroke="#7c3aed" strokeWidth={2} fill="url(#revenueGrad)" name="Revenue" dot={false} activeDot={{ r: 5 }} />
                <Area type="monotone" dataKey="appointments" stroke="#0d9488" strokeWidth={2} fill="url(#apptGrad)" name="Appointments" dot={false} activeDot={{ r: 5 }} />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Appointment Status Pie */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm p-6">
          <div className="mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Appointment Status</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">All-time breakdown</p>
          </div>
          {statusData.every((s) => s.value === 0) ? (
            <div className="flex items-center justify-center h-40 text-slate-400 text-sm">No appointments yet</div>
          ) : (
            <>
              <ResponsiveContainer width="100%" height={160}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={45}
                    outerRadius={70}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2 mt-3">
                {statusData.map((item, index) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }} />
                    <span className="text-slate-600 dark:text-slate-400 flex-1 capitalize">{item.name}</span>
                    <span className="font-semibold text-slate-900 dark:text-white">{item.value}</span>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      </div>

      {/* Top Doctors */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Top Performing Doctors</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">By completed appointments in this period</p>
        </div>
        {topDoctors.length === 0 ? (
          <div className="flex items-center justify-center py-12 text-slate-400 text-sm">No data available</div>
        ) : (
          <div className="divide-y divide-slate-50 dark:divide-slate-800">
            {topDoctors.map((doctor, index) => (
              <div key={index} className="flex items-center gap-4 px-6 py-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                <div className="w-7 h-7 rounded-full bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-300 flex items-center justify-center text-xs font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <Avatar name={doctor.name} size="md" />
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-slate-900 dark:text-white truncate text-sm">{doctor.name}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    ⭐ {doctor.rating?.toFixed(1) || '—'} · {doctor.appointments} appointments
                  </p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{formatCurrency(doctor.revenue || 0)}</p>
                  <p className="text-xs text-slate-400">revenue</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Analytics;
