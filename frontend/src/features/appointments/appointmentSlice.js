import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchMyAppointments = createAsyncThunk(
  'appointments/fetchMyAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments/my', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const bookAppointment = createAsyncThunk(
  'appointments/bookAppointment',
  async (appointmentData, { rejectWithValue }) => {
    try {
      const response = await api.post('/appointments', appointmentData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to book appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async ({ id, reason }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  'appointments/confirmAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}/confirm`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to confirm appointment');
    }
  }
);

export const completeAppointment = createAsyncThunk(
  'appointments/completeAppointment',
  async ({ id, medicalNotes, prescription }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}/complete`, { medicalNotes, prescription });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to complete appointment');
    }
  }
);

export const addMedicalNotes = createAsyncThunk(
  'appointments/addMedicalNotes',
  async ({ id, medicalNotes, prescription }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}/medical-notes`, { medicalNotes, prescription });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add medical notes');
    }
  }
);

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctorAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments/doctor', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor appointments');
    }
  }
);

export const fetchAdminAppointments = createAsyncThunk(
  'appointments/fetchAdminAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/appointments/admin', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

const initialState = {
  list: [],
  total: 0,
  loading: false,
  error: null,
  selected: null,
};

const appointmentSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch My Appointments
      .addCase(fetchMyAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Book Appointment
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.list.unshift(action.payload.appointment);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((apt) => apt._id === action.payload.appointment._id);
        if (index !== -1) {
          state.list[index] = action.payload.appointment;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Confirm Appointment
      .addCase(confirmAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((apt) => apt._id === action.payload.appointment._id);
        if (index !== -1) {
          state.list[index] = action.payload.appointment;
        }
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Complete Appointment
      .addCase(completeAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((apt) => apt._id === action.payload.appointment._id);
        if (index !== -1) {
          state.list[index] = action.payload.appointment;
        }
      })
      .addCase(completeAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Medical Notes
      .addCase(addMedicalNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedicalNotes.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.list.findIndex((apt) => apt._id === action.payload.appointment._id);
        if (index !== -1) {
          state.list[index] = action.payload.appointment;
        }
      })
      .addCase(addMedicalNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Doctor Appointments
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Admin Appointments
      .addCase(fetchAdminAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchAdminAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, setSelected } = appointmentSlice.actions;
export default appointmentSlice.reducer;
