import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Patient thunks ───────────────────────────────────────────────────────────

export const fetchMyAppointments = createAsyncThunk(
  'appointments/fetchMyAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/appointment/my-appointments', { params });
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
      const response = await api.post('/v1/appointment/book', appointmentData);
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
      const response = await api.put(`/v1/appointment/${id}/cancel`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

// ── Doctor thunks ────────────────────────────────────────────────────────────

export const fetchDoctorAppointments = createAsyncThunk(
  'appointments/fetchDoctorAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      // Use dedicated doctor endpoint — resolves doctorId server-side from the logged-in user
      const { doctorId, ...rest } = params;
      const url = doctorId
        ? `/v1/appointment/doctor/${doctorId}`
        : '/v1/appointment/my-doctor-appointments';
      const response = await api.get(url, { params: rest });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor appointments');
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  'appointments/confirmAppointment',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/appointment/${id}/confirm`);
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
      const response = await api.put(`/v1/appointment/${id}/complete`, {
        doctorNotes: medicalNotes,
        prescription,
      });
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
      const response = await api.put(`/v1/appointment/${id}/complete`, {
        doctorNotes: medicalNotes,
        prescription,
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to add medical notes');
    }
  }
);

// ── Admin thunk ──────────────────────────────────────────────────────────────

export const fetchAdminAppointments = createAsyncThunk(
  'appointments/fetchAdminAppointments',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/appointment/admin/all', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

// ── Slice ────────────────────────────────────────────────────────────────────

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
    // ── fetchMyAppointments ──
    builder
      .addCase(fetchMyAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments || [];
        state.total = action.payload.pagination?.totalAppointments || action.payload.total || 0;
      })
      .addCase(fetchMyAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── bookAppointment ──
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const apt = action.payload.appointment;
        if (apt) state.list.unshift(apt);
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── cancelAppointment ──
      .addCase(cancelAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.appointment;
        if (updated) {
          const index = state.list.findIndex((apt) => apt._id === updated._id);
          if (index !== -1) state.list[index] = updated;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── confirmAppointment ──
      .addCase(confirmAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(confirmAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.appointment;
        if (updated) {
          const index = state.list.findIndex((apt) => apt._id === updated._id);
          if (index !== -1) state.list[index] = updated;
        }
      })
      .addCase(confirmAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── completeAppointment ──
      .addCase(completeAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(completeAppointment.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.appointment;
        if (updated) {
          const index = state.list.findIndex((apt) => apt._id === updated._id);
          if (index !== -1) state.list[index] = updated;
        }
      })
      .addCase(completeAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── addMedicalNotes ──
      .addCase(addMedicalNotes.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedicalNotes.fulfilled, (state, action) => {
        state.loading = false;
        const updated = action.payload.appointment;
        if (updated) {
          const index = state.list.findIndex((apt) => apt._id === updated._id);
          if (index !== -1) state.list[index] = updated;
        }
      })
      .addCase(addMedicalNotes.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── fetchDoctorAppointments ──
      .addCase(fetchDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments || [];
        state.total = action.payload.pagination?.totalAppointments || action.payload.total || 0;
      })
      .addCase(fetchDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // ── fetchAdminAppointments ──
      .addCase(fetchAdminAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.appointments || [];
        state.total = action.payload.pagination?.totalAppointments || action.payload.total || 0;
      })
      .addCase(fetchAdminAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ── Selectors ─────────────────────────────────────────────────────────────────
export const selectAppointments = (state) => state.appointments.list;
export const selectAppointmentsLoading = (state) => state.appointments.loading;
export const selectAppointmentsTotal = (state) => state.appointments.total;
export const selectAppointmentsError = (state) => state.appointments.error;

export const { clearError, setSelected } = appointmentSlice.actions;
export default appointmentSlice.reducer;
