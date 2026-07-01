import React, { useEffect, useState } from 'react';
import { Search, Download, Calendar, Clock } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAppointments } from '../../features/appointments/appointmentSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const TAB_COLORS = {
  all: 'from-violet-600 to-purple-700',
  pending: 'from-amber-500 to-orange-500',
  confirmed: 'from-blue-500 to-indigo-600',
  completed: 'from-emerald-500 to-green-600',
  cancelled: 'from-rose-500 to-red-600',
};

const getDoctorName = (doc) => {
  if (!doc) return '—';
  if (doc.firstName || doc.lastName) return `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim();
  return doc.name || '—';
};

const getPatientName = (patient) => {
  if (!patient) return '—';
  return patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || '—';
};

const AdminAppointments = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    dispatch(fetchAdminAppointments(params));
  }, [dispatch, activeTab]);

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchTerm) return true;
    const doctorName = getDoctorName(apt.doctor).toLowerCase();
    const patientName = getPatientName(apt.patient).toLowerCase();
    const term = searchTerm.toLowerCase();
    return doctorName.includes(term) || patientName.includes(term);
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? appointments.length : appointments.filter((a) => a.status === tab).length;
    return acc;
  }, {});

  const handleExportCSV = () => {
    const headers = ['Patient', 'Doctor', 'Specialization', 'Date', 'Time', 'Status', 'Reason'];
    const rows = filteredAppointments.map((apt) => [
      getPatientName(apt.patient),
      getDoctorName(apt.doctor),
      apt.doctor?.specialization || '',
      formatDate(apt.appointmentDate),
      formatTime(apt.appointmentTime),
      apt.status,
      (apt.reason || '').replace(/,/g, ';'),
    ]);

    const csvContent = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `appointments_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && appointments.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">All Appointments</h1>
          <p className="text-slate-500 mt-1">View and export appointments across the platform</p>
        </div>
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 bg-gradient-to-r from-violet-600 to-purple-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm hover:from-violet-700 hover:to-purple-800 transition-all shadow-sm flex-shrink-0"
        >
          <Download className="w-4 h-4" />
          Export CSV
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by doctor or patient name..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-violet-400 focus:border-transparent shadow-sm"
        />
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-200 ${
              activeTab === tab
                ? `bg-gradient-to-r ${TAB_COLORS[tab]} text-white shadow-sm`
                : 'bg-white border border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'
            }`}
          >
            <span className="capitalize">{tab}</span>
            <span className={`text-xs px-1.5 py-0.5 rounded-md font-semibold ${
              activeTab === tab ? 'bg-white/25 text-white' : 'bg-slate-100 text-slate-500'
            }`}>
              {tabCounts[tab]}
            </span>
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No appointments found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={getPatientName(appointment.patient)} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900">{getPatientName(appointment.patient)}</p>
                          <p className="text-xs text-slate-500">{appointment.patient?.phone || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={getDoctorName(appointment.doctor)} src={appointment.doctor?.profileImage?.url} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900">{getDoctorName(appointment.doctor)}</p>
                          <span className="inline-flex items-center px-2 py-0.5 rounded-md bg-violet-50 text-violet-700 text-xs font-medium">
                            {appointment.doctor?.specialization || ''}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-start gap-2">
                        <Calendar className="w-4 h-4 text-slate-400 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-sm font-medium text-slate-800">{formatDate(appointment.appointmentDate)}</p>
                          <p className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(appointment.appointmentTime)}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4"><StatusBadge status={appointment.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminAppointments;
