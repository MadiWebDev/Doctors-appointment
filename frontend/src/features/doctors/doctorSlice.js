import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../services/api';

// Async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (params = {}, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctors', { params });
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
      const response = await api.get(`/doctors/${id}`);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctor');
    }
  }
);

export const fetchDoctorSlots = createAsyncThunk(
  'doctors/fetchDoctorSlots',
  async ({ id, date }, { rejectWithValue }) => {
    try {
      const response = await api.get(`/doctors/${id}/slots`, { params: { date } });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch slots');
    }
  }
);

export const updateAvailability = createAsyncThunk(
  'doctors/updateAvailability',
  async (availabilityData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/doctors/availability', availabilityData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update availability');
    }
  }
);

export const generateSlots = createAsyncThunk(
  'doctors/generateSlots',
  async (params, { rejectWithValue }) => {
    try {
      const response = await api.post('/doctors/generate-slots', params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate slots');
    }
  }
);

export const blockSlot = createAsyncThunk(
  'doctors/blockSlot',
  async ({ date, slotId }, { rejectWithValue }) => {
    try {
      const response = await api.patch('/doctors/block-slot', { date, slotId });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to block slot');
    }
  }
);

export const fetchDoctorDashboard = createAsyncThunk(
  'doctors/fetchDoctorDashboard',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/doctors/dashboard');
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch dashboard data');
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  'doctors/updateDoctorProfile',
  async (profileData, { rejectWithValue }) => {
    try {
      const response = await api.patch('/doctors/profile', profileData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update profile');
    }
  }
);

const initialState = {
  list: [],
  total: 0,
  selected: null,
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
      // Fetch Doctors
      .addCase(fetchDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.list = action.payload.doctors || [];
        state.total = action.payload.total || 0;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Fetch Doctor By ID
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
      // Fetch Doctor Slots
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
      // Update Availability
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
      // Generate Slots
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
      // Block Slot
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
      // Fetch Doctor Dashboard
      .addCase(fetchDoctorDashboard.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchDoctorDashboard.fulfilled, (state, action) => {
        state.loading = false;
        state.dashboard = action.payload;
      })
      .addCase(fetchDoctorDashboard.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Doctor Profile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.selected = action.payload.doctor;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearSlots } = doctorSlice.actions;
export default doctorSlice.reducer;
