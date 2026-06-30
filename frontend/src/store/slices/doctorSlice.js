import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/utils/api";

export const createDoctorProfile = createAsyncThunk(
  "doctor/createProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/v1/doctor/profile", profileData);
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create doctor profile");
    }
  }
);

export const getDoctorProfile = createAsyncThunk(
  "doctor/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/doctor/profile/me");
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctor profile");
    }
  }
);

export const getDoctorById = createAsyncThunk(
  "doctor/getDoctorById",
  async (doctorId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/doctor/${doctorId}`);
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctor");
    }
  }
);

export const getAllDoctors = createAsyncThunk(
  "doctor/getAllDoctors",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/doctor", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch doctors");
    }
  }
);

export const updateDoctorProfile = createAsyncThunk(
  "doctor/updateProfile",
  async ({ doctorId, profileData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/doctor/profile/${doctorId}`, profileData);
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update doctor profile");
    }
  }
);

export const updateAvailability = createAsyncThunk(
  "doctor/updateAvailability",
  async ({ doctorId, availability }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/doctor/profile/${doctorId}/availability`, { availability });
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update availability");
    }
  }
);

export const updateOnlineStatus = createAsyncThunk(
  "doctor/updateOnlineStatus",
  async ({ doctorId, isOnline }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/doctor/profile/${doctorId}/online-status`, { isOnline });
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update online status");
    }
  }
);

export const addReview = createAsyncThunk(
  "doctor/addReview",
  async ({ doctorId, reviewData }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/v1/doctor/${doctorId}/reviews`, reviewData);
      return data.doctor;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add review");
    }
  }
);

export const getAvailableSlots = createAsyncThunk(
  "doctor/getAvailableSlots",
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/doctor/${doctorId}/available-slots`, { params: { date } });
      return data.slots;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch available slots");
    }
  }
);

const initialState = {
  profile: null,
  doctors: [],
  currentDoctor: null,
  availableSlots: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalDoctors: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const doctorSlice = createSlice({
  name: "doctor",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentDoctor: (state) => {
      state.currentDoctor = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Profile
      .addCase(createDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(createDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Doctor By ID
      .addCase(getDoctorById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(getDoctorById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get All Doctors
      .addCase(getAllDoctors.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAllDoctors.fulfilled, (state, action) => {
        state.loading = false;
        state.doctors = action.payload.doctors;
        state.pagination = action.payload.pagination;
      })
      .addCase(getAllDoctors.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updateDoctorProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateDoctorProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateDoctorProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Availability
      .addCase(updateAvailability.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAvailability.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateAvailability.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Online Status
      .addCase(updateOnlineStatus.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateOnlineStatus.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateOnlineStatus.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Review
      .addCase(addReview.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addReview.fulfilled, (state, action) => {
        state.loading = false;
        state.currentDoctor = action.payload;
      })
      .addCase(addReview.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Available Slots
      .addCase(getAvailableSlots.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAvailableSlots.fulfilled, (state, action) => {
        state.loading = false;
        state.availableSlots = action.payload;
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
        state.availableSlots = [];
      });
  },
});

export const { clearError, clearCurrentDoctor } = doctorSlice.actions;
export default doctorSlice.reducer;
