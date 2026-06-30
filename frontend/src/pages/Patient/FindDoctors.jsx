import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import SkeletonRow from '../../Components/shared/SkeletonRow';
import { SPECIALIZATIONS, formatCurrency } from '../../utils/helpers';

const FindDoctors = () => {
  const dispatch = useDispatch();
  const { list: doctors, loading } = useSelector((state) => state.doctors);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    specialization: '',
    minFee: 0,
    maxFee: 10000,
    minRating: 0,
  });
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    dispatch(fetchDoctors({ ...filters, search: searchTerm, page }));
  }, [dispatch, filters, searchTerm, page]);

  const filteredDoctors = doctors.filter((doctor) => {
    if (filters.specialization && doctor.specialization !== filters.specialization) return false;
    if (doctor.consultationFee < filters.minFee || doctor.consultationFee > filters.maxFee) return false;
    if (filters.minRating && (doctor.rating || 0) < filters.minRating) return false;
    return true;
  });

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Doctors</h1>
        <p className="page-subtitle">Search and book appointments with verified doctors</p>
      </div>

      {/* Search Bar */}
      <div className="card p-4 mb-6">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
            <input
              type="text"
              placeholder="Search by name or specialization..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input pl-10"
            />
          </div>
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="btn btn-secondary"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Specialization</label>
              <select
                value={filters.specialization}
                onChange={(e) => setFilters({ ...filters, specialization: e.target.value })}
                className="input"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>
                    {spec}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Fee Range (PKR)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  placeholder="Min"
                  value={filters.minFee}
                  onChange={(e) => setFilters({ ...filters, minFee: Number(e.target.value) })}
                  className="input"
                />
                <input
                  type="number"
                  placeholder="Max"
                  value={filters.maxFee}
                  onChange={(e) => setFilters({ ...filters, maxFee: Number(e.target.value) })}
                  className="input"
                />
              </div>
            </div>
            <div>
              <label className="label">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: Number(e.target.value) })}
                className="input"
              >
                <option value="0">Any Rating</option>
                <option value="3">3+ Stars</option>
                <option value="4">4+ Stars</option>
                <option value="4.5">4.5+ Stars</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Doctor Cards */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <SkeletonRow key={i} columns={4} />
          ))}
        </div>
      ) : filteredDoctors.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">No doctors found matching your criteria</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="card p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <Avatar name={doctor.name} src={doctor.avatar} size="lg" />
                <div className="flex-1">
                  <h3 className="font-semibold text-slate-900">{doctor.name}</h3>
                  <p className="text-sm text-slate-600">{doctor.specialization}</p>
                  <div className="flex items-center gap-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-400 fill-current" />
                    <span className="text-sm text-slate-600">{doctor.rating || 'N/A'}</span>
                  </div>
                </div>
              </div>
              
              <div className="space-y-2 mb-4">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="w-4 h-4" />
                  <span>{doctor.hospitalAffiliation}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Experience:</span>
                  <span>{doctor.experience} years</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <span className="font-medium">Fee:</span>
                  <span>{formatCurrency(doctor.consultationFee)}</span>
                </div>
              </div>

              <Link
                to={`/patient/doctors/${doctor._id}`}
                className="btn btn-primary w-full"
              >
                View Profile
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FindDoctors;
