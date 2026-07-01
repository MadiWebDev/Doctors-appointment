import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { Search, SlidersHorizontal, Star, MapPin } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctors } from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import SkeletonRow from '../../Components/shared/SkeletonRow';
import { SPECIALIZATIONS, formatCurrency } from '../../utils/helpers';

const getDoctorName = (doc) =>
  `Dr. ${doc.firstName || ''} ${doc.lastName || ''}`.trim();

const StarRating = ({ rating }) => {
  const stars = Math.round(rating || 0);
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`w-4 h-4 ${i <= stars ? 'text-yellow-400 fill-current' : 'text-slate-300'}`}
        />
      ))}
      <span className="ml-1 text-sm text-slate-600">
        {rating ? rating.toFixed(1) : 'New'}
      </span>
    </div>
  );
};

const FindDoctors = () => {
  const dispatch = useDispatch();
  const { list: doctors, loading } = useSelector((state) => state.doctors);

  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    specialization: '',
    maxFee: '',
    minRating: '',
  });
  const [page, setPage] = useState(1);

  // Debounce search input by 400ms
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchTerm), 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Reset to page 1 whenever filters/search change
  useEffect(() => {
    setPage(1);
  }, [debouncedSearch, filters]);

  // Fetch whenever debounced search, filters, or page changes
  useEffect(() => {
    const params = {
      page,
      limit: 9,
      ...(debouncedSearch ? { search: debouncedSearch } : {}),
      ...(filters.specialization ? { specialization: filters.specialization } : {}),
      ...(filters.maxFee ? { maxFee: filters.maxFee } : {}),
      ...(filters.minRating ? { minRating: filters.minRating } : {}),
    };
    dispatch(fetchDoctors(params));
  }, [dispatch, debouncedSearch, filters, page]);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Find Doctors</h1>
        <p className="page-subtitle">Search and book appointments with verified doctors</p>
      </div>

      {/* Search + Filter Bar */}
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
            className="flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 transition-colors"
          >
            <SlidersHorizontal className="w-4 h-4" />
            Filters
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="label">Specialization</label>
              <select
                value={filters.specialization}
                onChange={(e) =>
                  setFilters({ ...filters, specialization: e.target.value })
                }
                className="input"
              >
                <option value="">All Specializations</option>
                {SPECIALIZATIONS.map((spec) => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Max Fee (PKR)</label>
              <input
                type="number"
                placeholder="e.g. 2000"
                value={filters.maxFee}
                onChange={(e) => setFilters({ ...filters, maxFee: e.target.value })}
                className="input"
              />
            </div>
            <div>
              <label className="label">Minimum Rating</label>
              <select
                value={filters.minRating}
                onChange={(e) => setFilters({ ...filters, minRating: e.target.value })}
                className="input"
              >
                <option value="">Any Rating</option>
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
      ) : doctors.length === 0 ? (
        <div className="card p-8 text-center">
          <p className="text-slate-500">No doctors found matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {doctors.map((doctor) => (
              <div
                key={doctor._id}
                className="card p-6 hover:shadow-md transition-shadow flex flex-col"
              >
                <div className="flex items-start gap-4 mb-4">
                  <Avatar
                    name={getDoctorName(doctor)}
                    src={doctor.profileImage?.url}
                    size="lg"
                  />
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-slate-900 truncate">
                      {getDoctorName(doctor)}
                    </h3>
                    <p className="text-sm text-slate-600">{doctor.specialization}</p>
                    <StarRating rating={doctor.ratings} />
                  </div>
                </div>

                <div className="space-y-2 mb-4 flex-1">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{doctor.hospitalAffiliation}</span>
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
                  className="btn btn-primary w-full text-center"
                >
                  View Profile & Book
                </Link>
              </div>
            ))}
          </div>

          {/* Pagination */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-4 py-2 text-slate-600">Page {page}</span>
            <button
              onClick={() => setPage((p) => p + 1)}
              disabled={doctors.length < 9}
              className="px-4 py-2 bg-slate-100 text-slate-600 rounded-lg hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default FindDoctors;
