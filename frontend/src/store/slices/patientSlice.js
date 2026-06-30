import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/utils/api";

export const createPatientProfile = createAsyncThunk(
  "patient/createProfile",
  async (profileData, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/v1/patient/profile", profileData);
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create patient profile");
    }
  }
);

export const getPatientProfile = createAsyncThunk(
  "patient/getProfile",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/patient/profile/me");
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch patient profile");
    }
  }
);

export const updatePatientProfile = createAsyncThunk(
  "patient/updateProfile",
  async ({ patientId, profileData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/patient/profile/${patientId}`, profileData);
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update patient profile");
    }
  }
);

export const addMedicalHistory = createAsyncThunk(
  "patient/addMedicalHistory",
  async ({ patientId, historyData }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/v1/patient/profile/${patientId}/medical-history`, historyData);
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add medical history");
    }
  }
);

export const addAllergy = createAsyncThunk(
  "patient/addAllergy",
  async ({ patientId, allergyData }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/v1/patient/profile/${patientId}/allergies`, allergyData);
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add allergy");
    }
  }
);

export const addCurrentMedication = createAsyncThunk(
  "patient/addCurrentMedication",
  async ({ patientId, medicationData }, { rejectWithValue }) => {
    try {
      const { data } = await API.post(`/v1/patient/profile/${patientId}/medications`, medicationData);
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to add medication");
    }
  }
);

export const updateLifestyle = createAsyncThunk(
  "patient/updateLifestyle",
  async ({ patientId, lifestyleData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/patient/profile/${patientId}/lifestyle`, lifestyleData);
      return data.patient;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update lifestyle");
    }
  }
);

const initialState = {
  profile: null,
  loading: false,
  error: null,
};

const patientSlice = createSlice({
  name: "patient",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Profile
      .addCase(createPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(createPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Profile
      .addCase(getPatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(getPatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Profile
      .addCase(updatePatientProfile.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePatientProfile.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updatePatientProfile.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Medical History
      .addCase(addMedicalHistory.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addMedicalHistory.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(addMedicalHistory.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Allergy
      .addCase(addAllergy.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addAllergy.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(addAllergy.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Add Current Medication
      .addCase(addCurrentMedication.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addCurrentMedication.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(addCurrentMedication.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Lifestyle
      .addCase(updateLifestyle.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateLifestyle.fulfilled, (state, action) => {
        state.loading = false;
        state.profile = action.payload;
      })
      .addCase(updateLifestyle.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError } = patientSlice.actions;
export default patientSlice.reducer;
