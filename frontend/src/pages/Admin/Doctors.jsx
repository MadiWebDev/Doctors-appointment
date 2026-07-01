import React, { useEffect, useState } from 'react';
import { Check, X, Search, ExternalLink, Stethoscope } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import StatusBadge from '../../Components/shared/StatusBadge';
import Modal from '../../Components/shared/Modal';
import Spinner from '../../Components/shared/Spinner';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const TABS = ['pending', 'approved', 'rejected', 'all'];

const TAB_COLORS = {
  pending: 'from-amber-500 to-orange-500',
  approved: 'from-emerald-500 to-green-600',
  rejected: 'from-rose-500 to-red-600',
  all: 'from-violet-600 to-purple-700',
};

const Doctors = () => {
  const dispatch = useDispatch();
  const { list: doctors, loading } = useSelector((state) => state.doctors);
  const [activeTab, setActiveTab] = useState('pending');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedDoctor, setSelectedDoctor] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    const params = activeTab !== 'all' ? { status: activeTab } : {};
    dispatch(fetchDoctors(params));
  }, [dispatch, activeTab]);

  const filteredDoctors = doctors.filter((doctor) => {
    if (!searchTerm) return true;
    const name = `${doctor.firstName || ''} ${doctor.lastName || ''}`.toLowerCase();
    return (
      name.includes(searchTerm.toLowerCase()) ||
      (doctor.specialization || '').toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  const tabCounts = TABS.reduce((acc, tab) => {
    acc[tab] = tab === 'all' ? doctors.length : doctors.filter((d) => d.status === tab).length;
    return acc;
  }, {});

  const handleApprove = async (id) => {
    setActionLoading(true);
    try {
      await api.put(`/v1/admin/doctors/${id}/approve`, { status: 'approved' });
      toast.success('Doctor approved successfully');
      dispatch(fetchDoctors(activeTab !== 'all' ? { status: activeTab } : {}));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to approve doctor');
    } finally {
      setActionLoading(false);
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
    setActionLoading(true);
    try {
      await api.put(`/v1/admin/doctors/${selectedDoctor._id}/reject`, {
        status: 'rejected',
        reason: rejectReason,
      });
      toast.success('Doctor rejected');
      setShowRejectModal(false);
      setRejectReason('');
      setSelectedDoctor(null);
      dispatch(fetchDoctors(activeTab !== 'all' ? { status: activeTab } : {}));
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to reject doctor');
    } finally {
      setActionLoading(false);
    }
  };

  const closeModal = () => {
    setShowRejectModal(false);
    setRejectReason('');
    setSelectedDoctor(null);
  };

  const getDoctorName = (doc) =>
    `${doc?.firstName || ''} ${doc?.lastName || ''}`.trim() || 'Unknown';

  if (loading && doctors.length === 0) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Doctors</h1>
        <p className="text-slate-500 mt-1">Manage doctor registrations and approvals</p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search by name or specialization..."
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
        {filteredDoctors.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
            <div className="w-16 h-16 bg-violet-50 rounded-full flex items-center justify-center mb-4">
              <Stethoscope className="w-8 h-8 text-violet-400" />
            </div>
            <h3 className="font-semibold text-slate-700 mb-1">No doctors found</h3>
            <p className="text-slate-400 text-sm">Try adjusting your search or filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Doctor</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Specialization</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">License</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Applied</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filteredDoctors.map((doctor) => (
                  <tr key={doctor._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar name={getDoctorName(doctor)} src={doctor.profileImage?.url} size="md" />
                        <div>
                          <p className="font-semibold text-slate-900">{getDoctorName(doctor)}</p>
                          <p className="text-xs text-slate-500">{doctor.user?.email || ''}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center px-2.5 py-1 rounded-lg bg-violet-50 text-violet-700 text-xs font-medium">
                        {doctor.specialization}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-700">{doctor.experience} yrs</td>
                    <td className="px-6 py-4">
                      {doctor.licenseDocument ? (
                        <a href={doctor.licenseDocument} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors">
                          View <ExternalLink className="w-3 h-3" />
                        </a>
                      ) : (
                        <span className="text-xs text-slate-400">N/A</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{formatDate(doctor.createdAt)}</td>
                    <td className="px-6 py-4"><StatusBadge status={doctor.status} /></td>
                    <td className="px-6 py-4">
                      <div className="flex gap-2">
                        {doctor.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleApprove(doctor._id)}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition-colors disabled:opacity-50"
                            >
                              <Check className="w-3.5 h-3.5" /> Approve
                            </button>
                            <button
                              onClick={() => handleRejectClick(doctor)}
                              disabled={actionLoading}
                              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-rose-50 text-rose-600 border border-rose-200 rounded-lg hover:bg-rose-100 transition-colors disabled:opacity-50"
                            >
                              <X className="w-3.5 h-3.5" /> Reject
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

      {/* Reject Modal */}
      <Modal isOpen={showRejectModal} onClose={closeModal} title="Reject Doctor Application" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-slate-600">
            Rejecting application from{' '}
            <span className="font-semibold text-slate-900">Dr. {getDoctorName(selectedDoctor || {})}</span>.
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
          <div className="flex gap-3 pt-1">
            <button onClick={closeModal} className="btn btn-secondary flex-1">Cancel</button>
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

export default Doctors;
