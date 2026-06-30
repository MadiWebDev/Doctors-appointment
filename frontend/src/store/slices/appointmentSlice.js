import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import API from "@/utils/api";

export const bookAppointment = createAsyncThunk(
  "appointment/book",
  async (appointmentData, { rejectWithValue }) => {
    try {
      const { data } = await API.post("/v1/appointment/book", appointmentData);
      return data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to book appointment");
    }
  }
);

export const getPatientAppointments = createAsyncThunk(
  "appointment/getPatientAppointments",
  async (filters = {}, { rejectWithValue }) => {
    try {
      const { data } = await API.get("/v1/appointment/my-appointments", { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const getDoctorAppointments = createAsyncThunk(
  "appointment/getDoctorAppointments",
  async ({ doctorId, filters = {} }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/appointment/doctor/${doctorId}`, { params: filters });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointments");
    }
  }
);

export const getAppointmentById = createAsyncThunk(
  "appointment/getById",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/appointment/${appointmentId}`);
      return data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch appointment");
    }
  }
);

export const getAvailableSlots = createAsyncThunk(
  "appointment/getAvailableSlots",
  async ({ doctorId, date }, { rejectWithValue }) => {
    try {
      const { data } = await API.get(`/v1/appointment/available-slots/${doctorId}`, { params: { date } });
      return data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to fetch available slots");
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  "appointment/cancel",
  async ({ appointmentId, reason }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/appointment/${appointmentId}/cancel`, { reason });
      return data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to cancel appointment");
    }
  }
);

export const rescheduleAppointment = createAsyncThunk(
  "appointment/reschedule",
  async ({ appointmentId, rescheduleData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/appointment/${appointmentId}/reschedule`, rescheduleData);
      return data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to reschedule appointment");
    }
  }
);

export const confirmAppointment = createAsyncThunk(
  "appointment/confirm",
  async (appointmentId, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/appointment/${appointmentId}/confirm`);
      return data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to confirm appointment");
    }
  }
);

export const completeAppointment = createAsyncThunk(
  "appointment/complete",
  async ({ appointmentId, completionData }, { rejectWithValue }) => {
    try {
      const { data } = await API.put(`/v1/appointment/${appointmentId}/complete`, completionData);
      return data.appointment;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || "Failed to complete appointment");
    }
  }
);

const initialState = {
  appointments: [],
  currentAppointment: null,
  availableSlots: [],
  loading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalAppointments: 0,
    hasNextPage: false,
    hasPrevPage: false,
  },
};

const appointmentSlice = createSlice({
  name: "appointment",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearCurrentAppointment: (state) => {
      state.currentAppointment = null;
    },
    clearAvailableSlots: (state) => {
      state.availableSlots = [];
    },
  },
  extraReducers: (builder) => {
    builder
      // Book Appointment
      .addCase(bookAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(bookAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(bookAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Patient Appointments
      .addCase(getPatientAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getPatientAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getPatientAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Doctor Appointments
      .addCase(getDoctorAppointments.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getDoctorAppointments.fulfilled, (state, action) => {
        state.loading = false;
        state.appointments = action.payload.appointments;
        state.pagination = action.payload.pagination;
      })
      .addCase(getDoctorAppointments.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Get Appointment By ID
      .addCase(getAppointmentById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(getAppointmentById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(getAppointmentById.rejected, (state, action) => {
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
        state.availableSlots = action.payload.slots || [];
      })
      .addCase(getAvailableSlots.rejected, (state, action) => {
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
        state.currentAppointment = action.payload;
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      // Reschedule Appointment
      .addCase(rescheduleAppointment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rescheduleAppointment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentAppointment = action.payload;
      })
      .addCase(rescheduleAppointment.rejected, (state, action) => {
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
        state.currentAppointment = action.payload;
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
        state.currentAppointment = action.payload;
      })
      .addCase(completeAppointment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      });
  },
});

export const { clearError, clearCurrentAppointment, clearAvailableSlots } = appointmentSlice.actions;
export default appointmentSlice.reducer;
