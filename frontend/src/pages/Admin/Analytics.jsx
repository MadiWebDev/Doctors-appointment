import React, { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { Calendar, DollarSign, Users, TrendingUp } from 'lucide-react';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import api from '../../services/api';
import { formatCurrency } from '../../utils/helpers';

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState(null);

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const fetchAnalytics = async () => {
    try {
      const response = await api.get('/admin/analytics');
      setAnalytics(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return <Spinner />;
  }

  const monthlyData = analytics?.monthlyAppointments || [
    { month: 'Jan', appointments: 120, revenue: 120000 },
    { month: 'Feb', appointments: 145, revenue: 145000 },
    { month: 'Mar', appointments: 180, revenue: 180000 },
    { month: 'Apr', appointments: 165, revenue: 165000 },
    { month: 'May', appointments: 200, revenue: 200000 },
    { month: 'Jun', appointments: 220, revenue: 220000 },
  ];

  const specializationData = analytics?.specializationStats || [
    { name: 'Cardiology', value: 25 },
    { name: 'Dermatology', value: 18 },
    { name: 'General Practice', value: 30 },
    { name: 'Pediatrics', value: 15 },
    { name: 'Orthopedics', value: 12 },
  ];

  const COLORS = ['#1a408a', '#184946', '#10b981', '#f59e0b', '#ef4444'];

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">Platform performance and insights</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Calendar}
          label="Total Appointments"
          value={analytics?.totalAppointments || 0}
          color="primary"
        />
        <StatCard
          icon={DollarSign}
          label="Total Revenue"
          value={formatCurrency(analytics?.totalRevenue || 0)}
          color="teal"
        />
        <StatCard
          icon={Users}
          label="Active Users"
          value={analytics?.activeUsers || 0}
          color="green"
        />
        <StatCard
          icon={TrendingUp}
          label="Growth Rate"
          value={`${analytics?.growthRate || 0}%`}
          color="yellow"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Appointments & Revenue */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Monthly Trends</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#1a408a" name="Appointments" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Revenue Trend */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Revenue Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line type="monotone" dataKey="revenue" stroke="#184946" strokeWidth={2} name="Revenue" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Specialization Distribution */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Specialization Distribution</h2>
        <ResponsiveContainer width="100%" height={400}>
          <PieChart>
            <Pie
              data={specializationData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              outerRadius={120}
              fill="#8884d8"
              dataKey="value"
            >
              {specializationData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default Analytics;
