import React, { useEffect, useState } from 'react';
import { Calendar, Clock, Plus, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { updateAvailability, generateSlots, blockSlot } from '../../features/doctors/doctorSlice';
import Spinner from '../../Components/shared/Spinner';
import toast from 'react-hot-toast';

const Availability = () => {
  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.doctors);
  const [workingDays, setWorkingDays] = useState([true, true, true, true, true, false, false]);
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('17:00');
  const [slotDuration, setSlotDuration] = useState(30);
  const [blockedDates, setBlockedDates] = useState([]);
  const [newBlockedDate, setNewBlockedDate] = useState('');

  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const handleSaveAvailability = async () => {
    try {
      await dispatch(updateAvailability({
        workingDays,
        startTime,
        endTime,
        slotDuration,
      })).unwrap();
      toast.success('Availability updated successfully');
    } catch (error) {
      toast.error(error || 'Failed to update availability');
    }
  };

  const handleGenerateSlots = async () => {
    try {
      await dispatch(generateSlots({ days: 30 })).unwrap();
      toast.success('Slots generated for next 30 days');
    } catch (error) {
      toast.error(error || 'Failed to generate slots');
    }
  };

  const handleBlockDate = async () => {
    if (!newBlockedDate) {
      toast.error('Please select a date');
      return;
    }
    try {
      await dispatch(blockSlot({ date: newBlockedDate })).unwrap();
      setBlockedDates([...blockedDates, newBlockedDate]);
      setNewBlockedDate('');
      toast.success('Date blocked successfully');
    } catch (error) {
      toast.error(error || 'Failed to block date');
    }
  };

  const handleRemoveBlockedDate = (date) => {
    setBlockedDates(blockedDates.filter((d) => d !== date));
    toast.success('Date unblocked');
  };

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 0; hour < 24; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        options.push(time);
      }
    }
    return options;
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
            {days.map((day, index) => (
              <button
                key={day}
                onClick={() => {
                  const newDays = [...workingDays];
                  newDays[index] = !newDays[index];
                  setWorkingDays(newDays);
                }}
                className={`p-3 rounded-lg font-medium transition-colors ${
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
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
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
                {generateTimeOptions().map((time) => (
                  <option key={time} value={time}>
                    {time}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Slot Duration (minutes)</label>
              <div className="flex gap-4">
                {[15, 30, 60].map((duration) => (
                  <button
                    key={duration}
                    onClick={() => setSlotDuration(duration)}
                    className={`flex-1 p-3 rounded-lg font-medium transition-colors ${
                      slotDuration === duration
                        ? 'bg-primary-600 text-white'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {duration} min
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
            Generate appointment slots for the next 30 days based on your availability settings.
          </p>
          <button
            onClick={handleGenerateSlots}
            disabled={loading}
            className="btn btn-teal w-full"
          >
            <Plus className="w-4 h-4 mr-2" />
            Generate Slots for 30 Days
          </button>
        </div>
      </div>

      {/* Blocked Dates */}
      <div className="card p-6 mt-6">
        <h2 className="text-xl font-semibold text-slate-900 mb-4">Blocked Dates</h2>
        <div className="flex gap-4 mb-6">
          <input
            type="date"
            value={newBlockedDate}
            onChange={(e) => setNewBlockedDate(e.target.value)}
            className="input flex-1"
          />
          <button onClick={handleBlockDate} className="btn btn-danger">
            <X className="w-4 h-4 mr-2" />
            Block Date
          </button>
        </div>

        {blockedDates.length === 0 ? (
          <p className="text-slate-500 text-center py-4">No blocked dates</p>
        ) : (
          <div className="flex flex-wrap gap-2">
            {blockedDates.map((date) => (
              <div
                key={date}
                className="flex items-center gap-2 px-3 py-2 bg-red-100 text-red-700 rounded-lg"
              >
                <Calendar className="w-4 h-4" />
                <span>{date}</span>
                <button
                  onClick={() => handleRemoveBlockedDate(date)}
                  className="p-1 hover:bg-red-200 rounded"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Availability;
