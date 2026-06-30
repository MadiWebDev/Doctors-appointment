import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, calculateAge } from '../../utils/helpers';
import api from '../../services/api';

const Patients = () => {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    fetchPatients();
  }, [page]);

  const fetchPatients = async () => {
    try {
      const response = await api.get('/admin/patients', { params: { page } });
      setPatients(response.data.patients || []);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch patients:', error);
      setLoading(false);
    }
  };

  const filteredPatients = patients.filter((patient) => {
    if (!searchTerm) return true;
    return (
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  if (loading) {
    return <Spinner />;
  }

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
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Patient</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Age</th>
                  <th>Joined Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.map((patient) => (
                  <tr key={patient._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <Avatar name={patient.name} src={patient.avatar} size="sm" />
                        <p className="font-medium text-slate-900">{patient.name}</p>
                      </div>
                    </td>
                    <td>{patient.email}</td>
                    <td>{patient.phone}</td>
                    <td>{calculateAge(patient.dateOfBirth)}</td>
                    <td>{formatDate(patient.createdAt)}</td>
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

export default Patients;
