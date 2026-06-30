import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminAppointments } from '../../features/appointments/appointmentSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';

const AdminAppointments = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchAdminAppointments({ status: activeTab }));
  }, [dispatch, activeTab]);

  const filteredAppointments = appointments.filter((apt) => {
    if (!searchTerm) return true;
    return (
      apt.doctor?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.patient?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">All Appointments</h1>
        <p className="page-subtitle">View all appointments across the platform</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by doctor or patient name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'pending', 'confirmed', 'completed', 'cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg font-medium capitalize ${
              activeTab === tab
                ? 'bg-primary-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments Table */}
      <div className="card">
        {filteredAppointments.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No appointments found</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Doctor</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={appointment.patient?.name} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{appointment.patient?.name}</p>
                          <p className="text-sm text-slate-600">{appointment.patient?.phone}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={appointment.doctor?.name} src={appointment.doctor?.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{appointment.doctor?.name}</p>
                          <p className="text-sm text-slate-600">{appointment.doctor?.specialization}</p>
                        </div>
                      </div>
                    </td>
                    <td>{formatDate(appointment.date)}</td>
                    <td>{formatTime(appointment.time)}</td>
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td>
                      <button className="btn btn-sm btn-secondary">View Details</button>
                    </td>
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
