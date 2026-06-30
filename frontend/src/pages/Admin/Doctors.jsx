import React, { useEffect, useState } from 'react';
import { Check, X, Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Modal from '../../Components/shared/Modal';
import Spinner from '../../Components/shared/Spinner';
import { formatDate } from '../../utils/helpers';
import toast from 'react-hot-toast';

const Doctors = () => {
  const dispatch = useDispatch();
  const { list: doctors, loading } = useSelector((state) => state.doctors);
  const [activeTab, setActiveTab] = useState('pending');
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    dispatch(fetchDoctors({ status: activeTab }));
  }, [dispatch, activeTab]);

  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchTerm) return true;
    return (
      doctor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const handleApprove = async (id) => {
    try {
      await api.patch(`/admin/doctors/${id}/approve`).unwrap();
      toast.success('Doctor approved successfully');
      dispatch(fetchDoctors({ status: activeTab }));
    } catch (error) {
      toast.error(error || 'Failed to approve doctor');
    }
  };

  const handleRejectClick = (doctor) => {
    setSelectedDoctor(doctor);
    setShowRejectModal(true);
  };

  const handleRejectConfirm = async () => {
    if (!rejectReason.trim()) {
      toast.error('Please provide a reason');
      return;
    }
    try {
      await api.patch(`/admin/doctors/${selectedDoctor._id}/reject`, { reason: rejectReason }).unwrap();
      toast.success('Doctor rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedDoctor(null);
      dispatch(fetchDoctors({ status: activeTab }));
    } catch (error) {
      toast.error(error || 'Failed to reject doctor');
    }
  };

  if (loading) {
    return <Spinner />;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Doctors</h1>
        <p className="page-subtitle">Manage doctor registrations and approvals</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or specialization..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        {['pending', 'approved', 'rejected', 'all'].map((tab) => (
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

      {/* Doctors Table */}
      <div className="card">
        {filteredDoctors.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No doctors found</div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Doctor</th>
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Applied Date</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={doctor.name} src={doctor.avatar} size="sm" />
                        <div>
                          <p className="font-medium text-slate-900">{doctor.name}</p>
                          <p className="text-sm text-slate-600">{doctor.email}</p>
                        </div>
                      </div>
                    </td>
                    <td>{doctor.specialization}</td>
                    <td>{doctor.experience} years</td>
                    <td>{formatDate(doctor.createdAt)}</td>
                    <td>
                      <StatusBadge status={doctor.status} />
                    </td>
                    <td>
                      <div className="flex gap-2">
                        {doctor.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(doctor._id)}
                              className="btn btn-sm btn-primary"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleRejectClick(doctor)}
                              className="btn btn-sm btn-danger"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </>
                        )}
                        <button className="btn btn-sm btn-secondary">View Details</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Reject Modal */}
      <Modal
        isOpen={showRejectModal}
        onClose={() => {
          setShowRejectModal(false);
          setRejectReason('');
          setSelectedDoctor(null);
        }}
        title="Reject Doctor Application"
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-slate-600">
            Are you sure you want to reject{' '}
            <span className="font-medium">{selectedDoctor?.name}</span>'s application?
          </p>
          <div>
            <label className="label">Reason for rejection</label>
            <textarea
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="input"
              rows={3}
              placeholder="Please provide a reason..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => {
                setShowRejectModal(false);
                setRejectReason('');
                setSelectedDoctor(null);
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

export default Doctors;
