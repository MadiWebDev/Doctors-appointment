import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import StatusBadge from '../../Components/shared/StatusBadge';
import { formatDate } from '../../utils/helpers';
import api from '../../services/api';
import toast from 'react-hot-toast';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const LIMIT = 10;

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const fetchPatients = async () => {
    setLoading(true);
    try {
      const response = await api.get('/v1/admin/users', {
        params: { role: 'patient', page, limit: LIMIT },
      });
      setPatients(response.data.users || []);
      setTotal(response.data.pagination?.total || 0);
    } catch (error) {
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const handleDeactivate = async (userId) => {
    try {
      await api.put(`/v1/admin/users/${userId}/role`, { role: 'patient' });
      toast.success('Action completed');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    return (
      (patient.name || '').toLowerCase().includes(term) ||
      (patient.email || '').toLowerCase().includes(term)
    );
  });

  const totalPages = Math.ceil(total / LIMIT);

  if (loading && patients.length === 0) return <Spinner />;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Patients</h1>
        <p className="page-subtitle">View and manage patient accounts</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input pl-10"
          />
        </div>
      </div>

      {/* Patients Table */}
      <div className="card">
        {filteredPatients.length === 0 ? (
          <div className="text-center py-8 text-slate-500">No patients found</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 border-b">
                <tr>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Patient</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Phone</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Status</th>
                  <th className="px-4 py-3 text-sm font-medium text-slate-600">Joined</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPatients.map((patient) => (
                  <tr key={patient._id} className="hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <Avatar name={patient.name} size="sm" />
                        <p className="font-medium text-slate-900">{patient.name}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{patient.email}</td>
                    <td className="px-4 py-3 text-slate-600">{patient.phone || '—'}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`px-2 py-1 rounded-full text-xs font-medium ${
                          patient.isActive
                            ? 'bg-green-100 text-green-700'
                            : 'bg-red-100 text-red-700'
                        }`}
                      >
                        {patient.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      {formatDate(patient.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center gap-2 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            Previous
          </button>
          <span className="px-4 py-2 text-slate-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default Patients;
