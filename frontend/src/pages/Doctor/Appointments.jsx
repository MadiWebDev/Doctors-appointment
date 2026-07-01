import React, { useEffect, useState } from 'react';
import { Check, X, FileText, Calendar, Clock, AlertCircle } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchDoctorAppointments,
  confirmAppointment,
  completeAppointment,
  cancelAppointment,
} from '../../features/appointments/appointmentSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Modal from '../../Components/shared/Modal';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';
import { medicalNotesSchema } from '../../utils/validators';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const getPatientName = (patient) => {
  if (!patient) return 'Unknown Patient';
  return patient.name || `${patient.firstName || ''} ${patient.lastName || ''}`.trim() || 'Unknown';
};

const TABS = ['pending', 'confirmed', 'completed', 'all'];

const TAB_COLORS = {
  pending: 'from-amber-500 to-orange-500',
  confirmed: 'from-blue-500 to-indigo-600',
  completed: 'from-emerald-500 to-green-600',
  all: 'from-teal-600 to-emerald-700',
};

const DoctorAppointments = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('pending');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm({ resolver: zodResolver(medicalNotesSchema) });

  useEffect(() => {
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    dispatch(fetchDoctorAppointments(params));
  }, [dispatch, activeTab]);

  const filteredAppointments =
    activeTab === 'all'
      ? appointments
      : appointments.filter((apt) => apt.status === activeTab);

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? appointments.length : appointments.filter((a) => a.status === tab).length;
    return acc;
  }, {});

  const handleConfirm = async (id) => {
    try {
      await dispatch(confirmAppointment(id)).unwrap();
      toast.success('Appointment confirmed');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to confirm appointment');
    }
  };

  const handleRejectClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    setActionLoading(true);
    try {
      await dispatch(cancelAppointment({ id: selectedAppointment._id, reason: rejectReason })).unwrap();
      toast.success('Appointment rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to reject appointment');
    } finally {
      setActionLoading(false);
    }
  };

  const handleCompleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    reset();
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (data) => {
    try {
      await dispatch(
        completeAppointment({
          id: selectedAppointment._id,
          medicalNotes: data.medicalNotes,
          prescription: data.prescription,
        })
      ).unwrap();
      toast.success('Appointment completed');
      setShowCompleteModal(false);
      setSelectedAppointment(null);
      reset();
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to complete appointment');
    }
  };

  if (loading && appointments.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Appointments</h1>
        <p className="text-slate-500 mt-1">Review and manage your patient appointments</p>
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

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
        {filteredAppointments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No {activeTab !== 'all' ? activeTab : ''} appointments</h3>
            <p className="text-slate-400 text-sm">Nothing to show here right now.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Patient</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Reason</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
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
                          <p className="text-xs text-slate-500">{appointment.patient?.phone || appointment.patient?.email || ''}</p>
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
                    <td className="px-6 py-4 max-w-[180px]">
                      <p className="text-sm text-slate-600 truncate">{appointment.reason || '—'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirm(appointment._id)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Confirm
                            </button>
                            <button
                              onClick={() => handleRejectClick(appointment)}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors"
                            >
                              <X className="w-3.5 h-3.5" />
                              Reject
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCompleteClick(appointment)}
                            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 transition-colors"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Complete
                          </button>
                        )}
                        {appointment.status === 'completed' && appointment.doctorNotes && (
                          <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 text-slate-600 border border-slate-200 rounded-lg hover:bg-slate-100 transition-colors">
                            <FileText className="w-3.5 h-3.5" />
                            Notes
                          </button>
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

      {/* Complete Modal */}
      <Modal
        isOpen={showCompleteModal}
        onClose={() => { setShowCompleteModal(false); setSelectedAppointment(null); reset(); }}
        title="Complete Appointment"
        size="md"
      >
        <form onSubmit={handleSubmit(handleCompleteSubmit)} className="space-y-4">
          <div>
            <label className="label">Medical Notes</label>
            <textarea
              {...register('medicalNotes')}
              className={`input ${errors.medicalNotes ? 'input-error' : ''}`}
              rows={4}
              placeholder="Enter medical notes..."
            />
            {errors.medicalNotes && <p className="error-msg">{errors.medicalNotes.message}</p>}
          </div>
          <div>
            <label className="label">Prescription <span className="text-slate-400 font-normal">(optional)</span></label>
            <textarea {...register('prescription')} className="input" rows={3} placeholder="Enter prescription..." />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={() => { setShowCompleteModal(false); setSelectedAppointment(null); reset(); }} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="flex-1 px-4 py-2 bg-gradient-to-r from-teal-500 to-emerald-600 text-white rounded-xl hover:from-teal-600 hover:to-emerald-700 transition-all font-medium disabled:opacity-50">
              {isSubmitting ? 'Saving...' : 'Mark Complete'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => { setShowRejectModal(false); setRejectReason(''); setSelectedAppointment(null); }}
        title="Reject Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-rose-50 border border-rose-100 rounded-xl">
            <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-rose-700">Please provide a reason for rejection.</p>
          </div>
          <div>
            <label className="label">Rejection reason</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input"
              rows={3}
              placeholder="Reason for rejection..."
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button onClick={() => { setShowRejectModal(false); setRejectReason(''); setSelectedAppointment(null); }} className="btn btn-secondary flex-1">
              Cancel
            </button>
            <button
              onClick={handleRejectConfirm}
              disabled={actionLoading}
              className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-red-600 text-white rounded-xl hover:from-rose-600 hover:to-red-700 transition-all font-medium disabled:opacity-50"
            >
              {actionLoading ? 'Rejecting...' : 'Reject'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
