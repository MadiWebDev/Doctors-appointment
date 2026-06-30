import React, { useEffect } from 'react';
import { Users, Stethoscope, Calendar, TrendingUp } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAppointments } from '../../features/appointments/appointmentSlice';
import { fetchDoctors } from '../../features/doctors/doctorSlice';
import StatCard from '../../Components/shared/StatCard';
import Spinner from '../../Components/shared/Spinner';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { list: appointments } = useSelector((state) => state.appointments);
  const { list: doctors } = useSelector((state) => state.doctors);
  const [loading, setLoading] = React.useState(true);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(fetchAdminAppointments({ limit: 100 })),
        dispatch(fetchDoctors({ limit: 100 })),
      ]);
      setLoading(false);
    };
    fetchData();
  }, [dispatch]);

  const stats = {
    totalDoctors: doctors.length,
    totalAppointments: appointments.length,
    pendingApprovals: doctors.filter((d) => d.status === 'pending').length,
    todayAppointments: appointments.filter((apt) => {
      const today = new Date().toISOString().split('T')[0];
      return apt.date === today;
    }).length,
  };

  const chartData = [
    { name: 'Pending', value: appointments.filter((a) => a.status === 'pending').length },
    { name: 'Confirmed', value: appointments.filter((a) => a.status === 'confirmed').length },
    { name: 'Completed', value: appointments.filter((a) => a.status === 'completed').length },
    { name: 'Cancelled', value: appointments.filter((a) => a.status === 'cancelled').length },
  ];

  const COLORS = ['#f59e0b', '#1a408a', '#10b981', '#ef4444'];

  const weeklyData = [
    { day: 'Mon', appointments: 12 },
    { day: 'Tue', appointments: 18 },
    { day: 'Wed', appointments: 24 },
    { day: 'Thu', appointments: 15 },
    { day: 'Fri', appointments: 21 },
    { day: 'Sat', count: 9 },
    { day: 'Sun', count: 6 },
  ];

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Dashboard</h1>
        <p className="page-subtitle">Overview of platform activity</p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={Stethoscope}
          label="Total Doctors"
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
          icon={TrendingUp}
          label="Today's Appointments"
          value={stats.todayAppointments}
          color="green"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Weekly Appointments Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Weekly Appointments</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={weeklyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="day" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="appointments" fill="#1a408a" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Appointment Status Pie Chart */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Appointment Status</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Recent Pending Approvals</h2>
        {doctors.filter((d) => d.status === 'pending').length === 0 ? (
          <p className="text-slate-500 text-center py-4">No pending approvals</p>
        ) : (
          <div className="space-y-4">
            {doctors.filter((d) => d.status === 'pending').slice(0, 5).map((doctor) => (
              <div key={doctor._id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg">
                <div>
                  <p className="font-medium text-slate-900">{doctor.name}</p>
                  <p className="text-sm text-slate-600">{doctor.specialization}</p>
                </div>
                <span className="badge badge-pending">Pending</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
