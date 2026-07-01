import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchMyAppointments,
  cancelAppointment,
} from '../../features/appointments/appointmentSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Modal from '../../Components/shared/Modal';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const getDoctorName = (doctor) => {
  if (!doctor) return 'Unknown Doctor';
  if (doctor.firstName || doctor.lastName)
    return `Dr. ${doctor.firstName || ''} ${doctor.lastName || ''}`.trim();
  return doctor.name || 'Unknown Doctor';
};

const TABS = ['all', 'pending', 'confirmed', 'completed', 'cancelled'];

const TAB_COLORS = {
  all: 'from-slate-600 to-slate-700',
  pending: 'from-amber-500 to-orange-500',
  confirmed: 'from-blue-500 to-indigo-600',
  completed: 'from-emerald-500 to-green-600',
  cancelled: 'from-rose-500 to-red-600',
};

const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  const filteredAppointments =
    activeTab === 'all'
      ? appointments
      : appointments.filter((apt) => apt.status === activeTab);

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? appointments.length : appointments.filter((a) => a.status === tab).length;
    return acc;
  }, {});

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    setCancelling(true);
    try {
      await dispatch(
        cancelAppointment({ id: selectedAppointment._id, reason: cancelReason })
      ).unwrap();
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to cancel appointment');
    } finally {
      setCancelling(false);
    }
  };

  const closeModal = () => {
    setShowCancelModal(false);
    setCancelReason('');
    setSelectedAppointment(null);
  };

  if (loading && appointments.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">My Appointments</h1>
        <p className="text-slate-500 mt-1">Track and manage your scheduled consultations</p>
      </div>

      {/* Tab Pills */}
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

      {/* Appointments List */}
      <div className="bg-card rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No {activeTab !== 'all' ? activeTab : ''} appointments</h3>
            <p className="text-slate-400 text-sm">You don't have any {activeTab !== 'all' ? activeTab : ''} appointments yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredAppointments.map((appointment) => (
                  <tr key={appointment._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar
                          name={getDoctorName(appointment.doctor)}
                          src={appointment.doctor?.profileImage?.url}
                          size="md"
                        />
                        <div>
                          <p className="font-semibold text-slate-900">
                            {getDoctorName(appointment.doctor)}
                          </p>
                          <p className="text-sm text-slate-500">
                            {appointment.doctor?.specialization}
                          </p>
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
                    <td className="px-6 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => handleCancelClick(appointment)}
                              className="px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => navigate(`/patient/doctors/${appointment.doctor?._id}`)}
                              className="px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Cancel Modal */}
      <Modal isOpen={showCancelModal} onClose={closeModal} title="Cancel Appointment" size="sm">
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">
              Are you sure you want to cancel your appointment with{' '}
              <span className="font-semibold">{getDoctorName(selectedAppointment?.doctor)}</span>?
            </p>
          </div>
          <div>
            <label className="label">Reason for cancellation</label>
            <textarea
              value={cancelReason}
              onChange={(e) => setCancelReason(e.target.value)}
              className="input"
              rows={3}
              placeholder="Please provide a reason..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={closeModal} className="btn btn-secondary flex-1">
              Keep it
            </button>
            <button
              onClick={handleCancelConfirm}
              disabled={cancelling}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all font-medium disabled:opacity-50"
            >
              {cancelling ? 'Cancelling...' : 'Cancel Appointment'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
