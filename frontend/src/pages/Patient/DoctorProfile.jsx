import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Star, MapPin, Award, Calendar, Clock, DollarSign } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorById, fetchDoctorSlots } from '../../features/doctors/doctorSlice';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';

const DoctorProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { selected: doctor, slots, loading, slotsLoading } = useSelector((state) => state.doctors);
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState(null);

  useEffect(() => {
    dispatch(fetchDoctorById(id));
  }, [dispatch, id]);

  useEffect(() => {
    if (selectedDate) {
      dispatch(fetchDoctorSlots({ id, date: selectedDate }));
    }
  }, [dispatch, id, selectedDate]);

  const handleDateChange = (e) => {
    setSelectedDate(e.target.value);
    setSelectedSlot(null);
  };

  const handleSlotSelect = (slotId) => {
    setSelectedSlot(slotId);
  };

  const handleBook = () => {
    if (selectedSlot) {
      navigate(`/patient/book/${id}?slot=${selectedSlot}&date=${selectedDate}`);
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const maxDate = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

  if (loading) {
    return <Spinner />;
  }

  if (!doctor) {
    return <div className="text-center py-8 text-slate-500">Doctor not found</div>;
  }

  return (
    <div>
      <Link to="/patient/doctors" className="text-slate-600 hover:text-slate-900 mb-6 inline-block">
        ← Back to doctors
      </Link>

      {/* Doctor Header */}
      <div className="card p-6 mb-6">
        <div className="flex flex-col md:flex-row gap-6">
          <Avatar name={doctor.name} src={doctor.avatar} size="xl" />
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 mb-2">{doctor.name}</h1>
            <p className="text-lg text-slate-600 mb-4">{doctor.specialization}</p>
            
            <div className="flex flex-wrap gap-4 mb-4">
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">{doctor.hospitalAffiliation}</span>
              </div>
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">{doctor.experience} years experience</span>
              </div>
              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-yellow-400 fill-current" />
                <span className="text-slate-600">{doctor.rating || 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-slate-400" />
                <span className="text-slate-600">{formatCurrency(doctor.consultationFee)}</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {doctor.qualifications?.split(',').map((qual, index) => (
                <span key={index} className="badge bg-slate-100 text-slate-700">
                  {qual.trim()}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bio Section */}
      <div className="card p-6 mb-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">About</h2>
        <p className="text-slate-600">{doctor.bio}</p>
      </div>

      {/* Booking Section */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Book an Appointment</h2>
        
        <div className="mb-6">
          <label className="label">Select Date</label>
          <input
            type="date"
            value={selectedDate}
            onChange={handleDateChange}
            min={today}
            max={maxDate}
            className="input"
          />
        </div>

        {selectedDate && (
          <>
            {slotsLoading ? (
              <Spinner />
            ) : slots.length === 0 ? (
              <p className="text-slate-500">No available slots for this date</p>
            ) : (
              <>
                <h3 className="font-medium text-slate-900 mb-4">Available Time Slots</h3>
                <div className="grid grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 mb-6">
                  {slots.map((slot) => (
                    <button
                      key={slot._id}
                      onClick={() => handleSlotSelect(slot._id)}
                      disabled={!slot.available}
                      className={`btn btn-sm ${
                        selectedSlot === slot._id
                          ? 'btn-primary'
                          : slot.available
                          ? 'btn-secondary'
                          : 'btn-ghost opacity-50 cursor-not-allowed'
                      }`}
                    >
                      {formatTime(slot.time)}
                    </button>
                  ))}
                </div>

                {selectedSlot && (
                  <button onClick={handleBook} className="btn btn-primary">
                    <Calendar className="w-4 h-4 mr-2" />
                    Book This Slot
                  </button>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
