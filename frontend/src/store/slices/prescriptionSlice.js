import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/utils/api";

export const createPrescription = createAsyncThunk(
  "prescription/create",
  async (prescriptionData, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/v1/prescription", prescriptionData);
      return data.prescription;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create prescription");
    }
  }
);

export const getPrescriptionById = createAsyncThunk(
  "prescription/getById",
  async (prescriptionId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/prescription/${prescriptionId}`);
      return data.prescription;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch prescription");
    }
  }
);

export const getMyPrescriptions = createAsyncThunk(
  "prescription/getMyPrescriptions",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/prescription/my-prescriptions", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch prescriptions");
    }
  }
);

export const getActivePrescriptions = createAsyncThunk(
  "prescription/getActivePrescriptions",
  async (_, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/prescription/active");
      return data.prescriptions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch active prescriptions");
    }
  }
);

export const updatePrescription = createAsyncThunk(
  "prescription/update",
  async ({ prescriptionId, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/prescription/${prescriptionId}`, updateData);
      return data.prescription;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update prescription");
    }
  }
);

export const searchPrescriptions = createAsyncThunk(
  "prescription/search",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/prescription/search", { params: { q: searchTerm } });
      return data.prescriptions;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search prescriptions");
    }
  }
);

const initialState = {
  prescriptions: [],
  activePrescriptions: [],
  currentPrescription: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalPrescriptions: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const prescriptionSlice = createSlice({
  name: "prescription",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentPrescription: (state) => {
      state.currentPrescription = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Prescription
      .addCase(createPrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(createPrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Prescription By ID
      .addCase(getPrescriptionById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPrescriptionById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(getPrescriptionById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Prescriptions
      .addCase(getMyPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload.prescriptions;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Active Prescriptions
      .addCase(getActivePrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getActivePrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.activePrescriptions = action.payload;
      })
      .addCase(getActivePrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Prescription
      .addCase(updatePrescription.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrescription.fulfilled, (state, action) => {
        state.loading = false;
        state.currentPrescription = action.payload;
      })
      .addCase(updatePrescription.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Prescriptions
      .addCase(searchPrescriptions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchPrescriptions.fulfilled, (state, action) => {
        state.loading = false;
        state.prescriptions = action.payload;
      })
      .addCase(searchPrescriptions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentPrescription } = prescriptionSlice.actions;
export default prescriptionSlice.reducer;
