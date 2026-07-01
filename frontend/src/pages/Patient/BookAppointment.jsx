import React, { useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Calendar, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDoctorById } from '../../features/doctors/doctorSlice';
import { bookAppointment } from '../../features/appointments/appointmentSlice';
import { bookAppointmentSchema } from '../../utils/validators';
import Avatar from '../../Components/shared/Avatar';
import Spinner from '../../Components/shared/Spinner';
import { formatDate, formatTime, formatCurrency } from '../../utils/helpers';
import toast from 'react-hot-toast';

const BookAppointment = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchParams] = useSearchParams();

  // URL: /patient/book/:id?slotId=X&date=YYYY-MM-DD&time=HH:MM
  const slotId = searchParams.get('slotId');
  const date = searchParams.get('date');
  const time = searchParams.get('time'); // decoded startTime from DoctorProfile

  const { selected: doctor, loading } = useSelector((state) => state.doctors);
  const { loading: bookingLoading } = useSelector((state) => state.appointments);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(bookAppointmentSchema),
  });

  useEffect(() => {
    if (!slotId || !date) {
      navigate(`/patient/doctors/${id}`);
      return;
    }
    dispatch(fetchDoctorById(id));
  }, [dispatch, id, slotId, date, navigate]);

  const onSubmit = async (data) => {
    try {
      await dispatch(
        bookAppointment({
          doctor: id,
          slotId,
          appointmentDate: date,
          appointmentTime: time,
          reason: data.reason,
        })
      ).unwrap();
      toast.success('Appointment booked successfully');
      navigate('/patient/appointments');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to book appointment');
    }
  };

  if (loading) return <Spinner />;
  if (!doctor)
    return <div className="text-center py-8 text-slate-500">Doctor not found</div>;

  return (
    <div className="max-w-2xl mx-auto">
      <button
        onClick={() => navigate(`/patient/doctors/${id}`)}
        className="text-slate-600 hover:text-slate-900 mb-6 inline-flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to doctor profile
      </button>

      <div className="card p-6">
        <h1 className="text-2xl font-bold text-slate-900 mb-6">Confirm Booking</h1>

        {/* Doctor Info */}
        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-lg mb-6">
          <Avatar
            name={`${doctor.firstName || ''} ${doctor.lastName || ''}`}
            src={doctor.profileImage?.url}
            size="lg"
          />
          <div>
            <h2 className="font-semibold text-slate-900">
              Dr. {doctor.firstName} {doctor.lastName}
            </h2>
            <p className="text-sm text-slate-600">{doctor.specialization}</p>
          </div>
        </div>

        {/* Appointment Details */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-3">
            <Calendar className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Date</p>
              <p className="font-medium text-slate-900">{formatDate(date)}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Clock className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Time</p>
              <p className="font-medium text-slate-900">
                {time ? formatTime(time) : '—'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <DollarSign className="w-5 h-5 text-slate-400" />
            <div>
              <p className="text-sm text-slate-500">Consultation Fee</p>
              <p className="font-medium text-slate-900">
                {formatCurrency(doctor.consultationFee)}
              </p>
            </div>
          </div>
        </div>

        {/* Reason Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="label">Reason for Visit</label>
            <textarea
              {...register('reason')}
              className={`input ${errors.reason ? 'input-error' : ''}`}
              rows={4}
              placeholder="Please describe your symptoms or reason for visit..."
            />
            {errors.reason && (
              <p className="error-msg">{errors.reason.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting || bookingLoading}
            className="btn btn-primary w-full"
          >
            {isSubmitting || bookingLoading ? 'Booking...' : 'Confirm Booking'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default BookAppointment;
