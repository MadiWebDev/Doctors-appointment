import React, { useEffect, useState } from 'react';
import { Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateAvailability,
  generateSlots,
  blockSlot,
  fetchMyDoctorProfile,
} from '../../features/doctors/doctorSlice';
import Spinner from '../../Components/shared/Spinner';
import toast from 'react-hot-toast';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const DAY_ABBR = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

const generateTimeOptions = () => {
  const options = [];
  for (let hour = 0; hour < 24; hour++) {
    for (let minute = 0; minute < 60; minute += 30) {
      options.push(
        `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
      );
    }
  }
  return options;
};

const TIME_OPTIONS = generateTimeOptions();

const Availability = () => {
  const dispatch = useDispatch();
  const { myProfile, loading } = useSelector((state) => state.doctors);

  const [workingDays, setWorkingDays] = useState([true, true, true, true, true, false, false]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  // Load the doctor's current profile on mount
  useEffect(() => {
    dispatch(fetchMyDoctorProfile());
  }, [dispatch]);

  const handleSaveAvailability = async () => {
    if (!myProfile?._id) {
      toast.error('Doctor profile not loaded');
      return;
    }

    // Build availability array matching the Doctor model shape
    const availability = DAYS
      .filter((_, i) => workingDays[i])
      .map((day) => ({
        day,
        startTime,
        endTime,
        isAvailable: true,
      }));

    try {
      await dispatch(
        updateAvailability({ doctorId: myProfile._id, availability })
      ).unwrap();
      toast.success('Availability updated successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to update availability');
    }
  };

  const handleGenerateSlots = async () => {
    const selectedDayNames = DAYS.filter((_, i) => workingDays[i]);
    if (selectedDayNames.length === 0) {
      toast.error('Please select at least one working day');
      return;
    }
    try {
      const result = await dispatch(
        generateSlots({
          workingDays: selectedDayNames,
          startTime,
          endTime,
          slotDuration,
        })
      ).unwrap();
      toast.success(`Generated ${result.count || 0} slots for next 30 days`);
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to generate slots');
    }
  };

  const handleBlockDate = async () => {
    if (!newBlockedDate) {
      toast.error('Please select a date');
      return;
    }
    try {
      // Block all slots for the selected date by date (requires slotId; use date-based block)
      await dispatch(blockSlot({ date: newBlockedDate, reason: 'Blocked by doctor' })).unwrap();
      setNewBlockedDate('');
      toast.success('Date blocked successfully');
    } catch (error) {
      toast.error(typeof error === 'string' ? error : 'Failed to block date');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Availability</h1>
        <p className="page-subtitle">Manage your working hours and appointment slots</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Working Days */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Working Days</h2>

          <div className="grid grid-cols-7 gap-2 mb-6">
            {DAY_ABBR.map((day, index) => (
              <button
                key={day}
                type="button"
                onClick={() => {
                  const updated = [...workingDays];
                  updated[index] = !updated[index];
                  setWorkingDays(updated);
                }}
                className={`p-3 rounded-lg font-medium text-sm transition-colors ${
                  workingDays[index]
                    ? 'bg-primary-600 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="label">Start Time</label>
              <select
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">End Time</label>
              <select
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input"
              >
                {TIME_OPTIONS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Slot Duration (minutes)</label>
              <div className="flex gap-4">
                {[15, 30, 60].map((d) => (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setSlotDuration(d)}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                      slotDuration === d
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {d} min
                  </button>
                ))}
              </div>
            </div>
          </div>

          <button
            onClick={handleSaveAvailability}
            disabled={loading}
            className="btn btn-primary w-full mt-6"
          >
            {loading ? 'Saving...' : 'Save Availability'}
          </button>
        </div>

        {/* Generate Slots */}
        <div className="card p-6">
          <h2 className="text-xl font-semibold text-slate-900 mb-4">Generate Slots</h2>
          <p className="text-slate-600 mb-6">
            Generate appointment slots for the next 30 days based on your working days
            and time settings above.
          </p>
          <button
            onClick={handleGenerateSlots}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-teal-600 text-white rounded-lg hover:bg-teal-700 transition-colors disabled:opacity-50"
          >
            {loading ? (
              'Generating...'
            ) : (
              <>
                <Plus className="w-4 h-4" />
                Generate Slots for 30 Days
              </>
            )}
          </button>
        </div>
      </div>

      {/* Block a Date */}
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Block a Date</h2>
        <div className="flex gap-4">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            min={new Date().toISOString().split('T')[0]}
            className="input flex-1"
          />
          <button
            onClick={handleBlockDate}
            disabled={loading}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
          >
            <X className="w-4 h-4" />
            Block Date
          </button>
        </div>
        <p className="text-sm text-slate-500 mt-2">
          Blocking a date will prevent new bookings for all slots on that day.
        </p>
      </div>
    </div>
  );
};

export default Availability;
