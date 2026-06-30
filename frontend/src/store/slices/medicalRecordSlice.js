import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/utils/api";

export const createMedicalRecord = createAsyncThunk(
  "medicalRecord/create",
  async (recordData, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/v1/medical-record", recordData);
      return data.record;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to create medical record");
    }
  }
);

export const getMedicalRecordById = createAsyncThunk(
  "medicalRecord/getById",
  async (recordId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/medical-record/${recordId}`);
      return data.record;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch medical record");
    }
  }
);

export const getMyMedicalRecords = createAsyncThunk(
  "medicalRecord/getMyRecords",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/medical-record/my-records", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch medical records");
    }
  }
);

export const getPatientMedicalRecords = createAsyncThunk(
  "medicalRecord/getPatientRecords",
  async ({ patientId, filters = {} }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/medical-record/patient/${patientId}`, { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch medical records");
    }
  }
);

export const updateMedicalRecord = createAsyncThunk(
  "medicalRecord/update",
  async ({ recordId, updateData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/medical-record/${recordId}`, updateData);
      return data.record;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to update medical record");
    }
  }
);

export const searchMedicalRecords = createAsyncThunk(
  "medicalRecord/search",
  async (searchTerm, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/medical-record/search", { params: { q: searchTerm } });
      return data.records;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to search medical records");
    }
  }
);

const initialState = {
  records: [],
  currentRecord: null,
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalRecords: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const medicalRecordSlice = createSlice({
  name: "medicalRecord",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentRecord: (state) => {
      state.currentRecord = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Create Medical Record
      .addCase(createMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMedicalRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(createMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Medical Record By ID
      .addCase(getMedicalRecordById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMedicalRecordById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(getMedicalRecordById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get My Medical Records
      .addCase(getMyMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getMyMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.pagination = action.payload.pagination;
      })
      .addCase(getMyMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Patient Medical Records
      .addCase(getPatientMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload.records;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPatientMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Update Medical Record
      .addCase(updateMedicalRecord.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMedicalRecord.fulfilled, (state, action) => {
        state.loading = false;
        state.currentRecord = action.payload;
      })
      .addCase(updateMedicalRecord.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Search Medical Records
      .addCase(searchMedicalRecords.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchMedicalRecords.fulfilled, (state, action) => {
        state.loading = false;
        state.records = action.payload;
      })
      .addCase(searchMedicalRecords.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentRecord } = medicalRecordSlice.actions;
export default medicalRecordSlice.reducer;
