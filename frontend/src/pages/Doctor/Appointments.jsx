import React, { useEffect, useState } from 'react';
import { Check, X, FileText } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorAppointments, confirmAppointment, completeAppointment, addMedicalNotes } from '../../features/appointments/appointmentSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Modal from '../../Components/shared/Modal';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';
import { medicalNotesSchema } from '../../utils/validators';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import toast from 'react-hot-toast';

const DoctorAppointments = () => {
  const dispatch = useDispatch();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('pending');
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [rejectReason, setRejectReason] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(medicalNotesSchema),
  });

  useEffect(() => {
    dispatch(fetchDoctorAppointments({ status: activeTab }));
  }, [dispatch, activeTab]);

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'all') return true;
    return apt.status === activeTab;
  });

  const handleConfirm = async (id) => {
    try {
      await dispatch(confirmAppointment(id)).unwrap();
      toast.success('Appointment confirmed');
    } catch (error) {
      toast.error(error || 'Failed to confirm appointment');
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
    try {
      await dispatch(cancelAppointment({
        id: selectedAppointment._id,
        reason: rejectReason,
      })).unwrap();
      toast.success('Appointment rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(error || 'Failed to reject appointment');
    }
  };

  const handleCompleteClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (data) => {
    try {
      await dispatch(completeAppointment({
        id: selectedAppointment._id,
        medicalNotes: data.medicalNotes,
        prescription: data.prescription,
      })).unwrap();
      toast.success('Appointment completed');
      setShowCompleteModal(false);
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(error || 'Failed to complete appointment');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Appointments</h1>
        <p className="page-subtitle">Manage your patient appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'confirmed', 'completed', 'all'].map((tab) => (
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
                  <th>Date</th>
                  <th>Time</th>
                  <th>Reason</th>
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
                    <td>{formatDate(appointment.date)}</td>
                    <td>{formatTime(appointment.time)}</td>
                    <td className="max-w-xs truncate">{appointment.reason}</td>
                    <td>
                      <StatusBadge status={appointment.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {appointment.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleConfirm(appointment._id)}
                              className="btn btn-sm btn-primary"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(appointment)}
                              className="btn btn-sm btn-danger"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        {appointment.status === 'confirmed' && (
                          <button
                            onClick={() => handleCompleteClick(appointment)}
                            className="btn btn-sm btn-teal"
                          >
                            Complete
                          </button>
                        )}
                        {appointment.status === 'completed' && appointment.medicalNotes && (
                          <button className="btn btn-sm btn-secondary">
                            <FileText className="w-4 h-4 mr-1" />
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
        onClose={() => {
          setShowCompleteModal(false);
          setSelectedAppointment(null);
        }}
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
            <label className="label">Prescription (optional)</label>
            <textarea
              {...register('prescription')}
              className="input"
              rows={3}
              placeholder="Enter prescription..."
            />
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => {
                setShowCompleteModal(false);
                setSelectedAppointment(null);
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary flex-1">
              Complete
            </button>
          </div>
        </form>
      </Modal>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedAppointment(null);
        }}
        title="Reject Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">Please provide a reason for rejection:</p>
          <textarea
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="input"
            rows={3}
            placeholder="Reason for rejection..."
          />
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedAppointment(null);
              }}
              className="btn btn-secondary flex-1"
            >
              Cancel
            </button>
            <button onClick={handleRejectConfirm} className="btn btn-danger flex-1">
              Reject
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default DoctorAppointments;
