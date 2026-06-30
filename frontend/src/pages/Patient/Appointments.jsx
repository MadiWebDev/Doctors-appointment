import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X, Calendar, Clock, User } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchMyAppointments, cancelAppointment } from '../../features/appointments/appointmentSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Modal from '../../Components/shared/Modal';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Appointments = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { list: appointments, loading } = useSelector((state) => state.appointments);
  const [activeTab, setActiveTab] = useState('all');
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [selectedAppointment, setSelectedAppointment] = useState(null);
  const [cancelReason, setCancelReason] = useState('');

  useEffect(() => {
    dispatch(fetchMyAppointments());
  }, [dispatch]);

  const filteredAppointments = appointments.filter((apt) => {
    if (activeTab === 'all') return true;
    return apt.status === activeTab;
  });

  const handleCancelClick = (appointment) => {
    setSelectedAppointment(appointment);
    setShowCancelModal(true);
  };

  const handleCancelConfirm = async () => {
    if (!cancelReason.trim()) {
      toast.error('Please provide a reason for cancellation');
      return;
    }
    try {
      await dispatch(cancelAppointment({
        id: selectedAppointment._id,
        reason: cancelReason,
      })).unwrap();
      toast.success('Appointment cancelled successfully');
      setShowCancelModal(false);
      setCancelReason('');
      setSelectedAppointment(null);
    } catch (error) {
      toast.error(error || 'Failed to cancel appointment');
    }
  };

  const handleReschedule = (appointment) => {
    navigate(`/patient/doctors/${appointment.doctor._id}`);
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Appointments</h1>
        <p className="page-subtitle">Manage your scheduled appointments</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['all', 'upcoming', 'completed', 'cancelled'].map((tab) => (
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
          <div className="text-center py-8 text-slate-500">
            No appointments found
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
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
                      <div className="flex gap-2">
                        {(appointment.status === 'pending' || appointment.status === 'confirmed') && (
                          <>
                            <button
                              onClick={() => handleCancelClick(appointment)}
                              className="btn btn-sm btn-danger"
                            >
                              Cancel
                            </button>
                            <button
                              onClick={() => handleReschedule(appointment)}
                              className="btn btn-sm btn-secondary"
                            >
                              Reschedule
                            </button>
                          </>
                        )}
                        {appointment.status === 'completed' && appointment.medicalNotes && (
                          <button className="btn btn-sm btn-secondary">
                            View Notes
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

      {/* Cancel Modal */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => {
          setShowCancelModal(false);
          setCancelReason('');
          setSelectedAppointment(null);
        }}
        title="Cancel Appointment"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to cancel your appointment with{' '}
            <span className="font-medium">{selectedAppointment?.doctor?.name}</span>?
          </p>
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
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowCancelModal(false);
                setCancelReason('');
                setSelectedAppointment(null);
              }}
              className="btn btn-secondary flex-1"
            >
              No, Keep it
            </button>
            <button onClick={handleCancelConfirm} className="btn btn-danger flex-1">
              Yes, Cancel
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Appointments;
