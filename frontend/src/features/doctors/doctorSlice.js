import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// ── Public thunks ────────────────────────────────────────────────────────────

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/doctor', { params });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
    }
  }
);

export const fetchDoctorById = createAsyncThunk(
  'doctors/fetchDoctorById',
  async (id, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/doctor/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

// ── Slots ────────────────────────────────────────────────────────────────────

export const fetchDoctorSlots = createAsyncThunk(
  'doctors/fetchDoctorSlots',
  async ({ id, date }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/v1/slot/doctor/${id}/available`, {
        params: { date },
      });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch slots');
    }
  }
);

export const generateSlots = createAsyncThunk(
  'doctors/generateSlots',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post('/v1/slot/generate', params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate slots');
    }
  }
);

export const blockSlot = createAsyncThunk(
  'doctors/blockSlot',
  async ({ slotId, reason }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/slot/${slotId}/block`, { reason });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block slot');
    }
  }
);

// ── Doctor profile thunks ─────────────────────────────────────────────────────

export const updateAvailability = createAsyncThunk(
  'doctors/updateAvailability',
  async ({ doctorId, availability }, { rejectWithValue }) => {
    try {
      const response = await api.put(
        `/v1/doctor/profile/${doctorId}/availability`,
        { availability }
      );
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update availability');
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctors/updateDoctorProfile',
  async ({ doctorId, ...profileData }, { rejectWithValue }) => {
    try {
      const response = await api.put(`/v1/doctor/profile/${doctorId}`, profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

export const fetchMyDoctorProfile = createAsyncThunk(
  'doctors/fetchMyDoctorProfile',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/doctor/profile/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor profile');
    }
  }
);

// ── Dashboard (computed from appointments) ────────────────────────────────────
// No dedicated backend endpoint exists; fetch doctor profile for stats instead.
export const fetchDoctorDashboard = createAsyncThunk(
  'doctors/fetchDoctorDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/v1/doctor/profile/me');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

// ── Slice ─────────────────────────────────────────────────────────────────────

const initialState = {
  list: [],
  total: 0,
  selected: null,
  myProfile: null,
  slots: [],
  dashboard: null,
  loading: false,
  slotsLoading: false,
  error: null,
};

const doctorSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSlots: (state) => {
      state.slots = [];
    },
  },
  extraReducers: (builder) => {
    builder
    // fetchDoctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.doctors || [];
        state.total =
          action.payload.pagination?.totalDoctors || action.payload.total || 0;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // fetchDoctorById
      .addCase(fetchDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload.doctor;
      })
      .addCase(fetchDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // fetchDoctorSlots
      .addCase(fetchDoctorSlots.pending, (state) => {
        state.slotsLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctorSlots.fulfilled, (state, action) => {
        state.slotsLoading = false;
        state.slots = action.payload.slots || [];
      })
      .addCase(fetchDoctorSlots.rejected, (state, action) => {
        state.slotsLoading = false;
        state.error = action.payload;
      })

    // generateSlots
      .addCase(generateSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSlots.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(generateSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // blockSlot
      .addCase(blockSlot.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(blockSlot.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(blockSlot.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // updateAvailability
      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // updateDoctorProfile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload.doctor || state.selected;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // fetchMyDoctorProfile
      .addCase(fetchMyDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.myProfile = action.payload.doctor;
      })
      .addCase(fetchMyDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })

    // fetchDoctorDashboard
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload.doctor || action.payload;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

// ── Selectors ──────────────────────────────────────────────────────────────────
export const selectDoctors = (state) => state.doctors.list;
export const selectDoctorsLoading = (state) => state.doctors.loading;
export const selectSelectedDoctor = (state) => state.doctors.selected;
export const selectDoctorSlots = (state) => state.doctors.slots;
export const selectSlotsLoading = (state) => state.doctors.slotsLoading;
export const selectDoctorDashboard = (state) => state.doctors.dashboard;
export const selectMyDoctorProfile = (state) => state.doctors.myProfile;

export const { clearError, clearSlots } = doctorSlice.actions;
export default doctorSlice.reducer;
