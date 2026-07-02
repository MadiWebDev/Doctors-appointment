import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";

// Hardcoded production backend URL — env var fallback kept for local dev
const BACKEND_URL = "https://doctors-appointment-sigma-coral.vercel.app";

const baseQuery = fetchBaseQuery({
  baseUrl: import.meta.env.VITE_API_URL || BACKEND_URL,
  prepareHeaders: (headers, { getState }) => {
    const token = getState().auth.accessToken;
    if (token) {
      headers.set("authorization", `Bearer ${token}`);
    }
    return headers;
  },
});

const baseQueryWithReauth = async (args, api, extraOptions) => {
  let result = await baseQuery(args, api, extraOptions);

  if (result.error && result.error.status === 401) {
    // Try to refresh token
    const refreshResult = await baseQuery(
      {
        url: "/api/v1/user/refresh-token",
        method: "GET",
        credentials: "include",
      },
      api,
      extraOptions
    );

    if (refreshResult.data) {
      // Store new token
      api.dispatch({
        type: "auth/setCredentials",
        payload: refreshResult.data,
      });
      // Retry original request
      result = await baseQuery(args, api, extraOptions);
    } else {
      // Logout if refresh fails
      api.dispatch({ type: "auth/logout" });
    }
  }

  return result;
};

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  tagTypes: [
    "User",
    "Doctor",
    "Appointment",
    "Slot",
    "Specialization",
    "Notification",
    "Patient",
    "Admin",
  ],
  endpoints: (builder) => ({
    // Auth endpoints
    login: builder.mutation({
      query: (credentials) => ({
        url: "/api/v1/user/login",
        method: "POST",
        body: credentials,
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    register: builder.mutation({
      query: (userData) => ({
        url: "/api/v1/user/register",
        method: "POST",
        body: userData,
      }),
      invalidatesTags: ["User"],
    }),
    logout: builder.mutation({
      query: () => ({
        url: "/api/v1/user/logout",
        method: "GET",
        credentials: "include",
      }),
      invalidatesTags: ["User"],
    }),
    loadUser: builder.query({
      query: () => ({
        url: "/api/v1/user/me",
        credentials: "include",
      }),
      providesTags: ["User"],
    }),
    verifyEmail: builder.mutation({
      query: (token) => ({
        url: `/api/v1/user/verify-email/${token}`,
        method: "GET",
      }),
      invalidatesTags: ["User"],
    }),
    sendOTP: builder.mutation({
      query: (email) => ({
        url: "/api/v1/user/send-otp",
        method: "POST",
        body: { email },
      }),
    }),
    verifyOTP: builder.mutation({
      query: ({ email, otp }) => ({
        url: "/api/v1/user/verify-otp",
        method: "POST",
        body: { email, otp },
      }),
      invalidatesTags: ["User"],
    }),

    // Doctor endpoints
    getDoctors: builder.query({
      query: (params) => ({
        url: "/api/v1/doctor",
        params,
      }),
      providesTags: ["Doctor"],
    }),
    getDoctorById: builder.query({
      query: (id) => ({
        url: `/api/v1/doctor/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Doctor", id }],
    }),
    createDoctorProfile: builder.mutation({
      query: (doctorData) => ({
        url: "/api/v1/doctor/profile",
        method: "POST",
        body: doctorData,
      }),
      invalidatesTags: ["Doctor"],
    }),
    updateDoctorProfile: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/doctor/profile/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Doctor", id }],
    }),
    verifyDoctor: builder.mutation({
      query: ({ id, status, reason }) => ({
        url: `/api/v1/doctor/${id}/verify`,
        method: "PUT",
        body: { status, reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Doctor", id }, "Admin"],
    }),
    getPendingVerifications: builder.query({
      query: (params) => ({
        url: "/api/v1/doctor/pending-verifications",
        params,
      }),
      providesTags: ["Doctor", "Admin"],
    }),

    // Appointment endpoints
    getAppointments: builder.query({
      query: (params) => ({
        url: "/api/v1/appointment/my-appointments",
        params,
      }),
      providesTags: ["Appointment"],
    }),
    getAppointmentById: builder.query({
      query: (id) => ({
        url: `/api/v1/appointment/${id}`,
      }),
      providesTags: (result, error, id) => [{ type: "Appointment", id }],
    }),
    bookAppointment: builder.mutation({
      query: (appointmentData) => ({
        url: "/api/v1/appointment/book",
        method: "POST",
        body: appointmentData,
      }),
      invalidatesTags: ["Appointment", "Slot"],
    }),
    confirmAppointment: builder.mutation({
      query: (id) => ({
        url: `/api/v1/appointment/${id}/confirm`,
        method: "PUT",
      }),
      invalidatesTags: (result, error, id) => [{ type: "Appointment", id }],
    }),
    cancelAppointment: builder.mutation({
      query: ({ id, reason }) => ({
        url: `/api/v1/appointment/${id}/cancel`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Appointment", id }, "Slot"],
    }),
    rescheduleAppointment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/appointment/${id}/reschedule`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Appointment", id }],
    }),
    completeAppointment: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/appointment/${id}/complete`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: (result, error, { id }) => [{ type: "Appointment", id }],
    }),
    getAvailableSlots: builder.query({
      query: ({ doctorId, date }) => ({
        url: `/api/v1/slot/doctor/${doctorId}/available`,
        params: { date },
      }),
      providesTags: (result, error, { doctorId }) => [{ type: "Slot", id: doctorId }],
    }),

    // Slot endpoints
    generateSlots: builder.mutation({
      query: (slotData) => ({
        url: "/api/v1/slot/generate",
        method: "POST",
        body: slotData,
      }),
      invalidatesTags: ["Slot"],
    }),
    getDoctorSlots: builder.query({
      query: ({ doctorId, ...params }) => ({
        url: `/api/v1/slot/doctor/${doctorId}`,
        params,
      }),
      providesTags: (result, error, { doctorId }) => [{ type: "Slot", id: doctorId }],
    }),
    blockSlot: builder.mutation({
      query: ({ slotId, reason }) => ({
        url: `/api/v1/slot/${slotId}/block`,
        method: "PUT",
        body: { reason },
      }),
      invalidatesTags: ["Slot"],
    }),
    unblockSlot: builder.mutation({
      query: (slotId) => ({
        url: `/api/v1/slot/${slotId}/unblock`,
        method: "PUT",
      }),
      invalidatesTags: ["Slot"],
    }),

    // Specialization endpoints
    getSpecializations: builder.query({
      query: () => ({
        url: "/api/v1/specialization",
      }),
      providesTags: ["Specialization"],
    }),
    getActiveSpecializations: builder.query({
      query: () => ({
        url: "/api/v1/specialization/active",
      }),
      providesTags: ["Specialization"],
    }),
    createSpecialization: builder.mutation({
      query: (data) => ({
        url: "/api/v1/specialization",
        method: "POST",
        body: data,
      }),
      invalidatesTags: ["Specialization", "Admin"],
    }),
    updateSpecialization: builder.mutation({
      query: ({ id, ...data }) => ({
        url: `/api/v1/specialization/${id}`,
        method: "PUT",
        body: data,
      }),
      invalidatesTags: ["Specialization", "Admin"],
    }),
    deleteSpecialization: builder.mutation({
      query: (id) => ({
        url: `/api/v1/specialization/${id}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Specialization", "Admin"],
    }),
    getSpecializationStats: builder.query({
      query: () => ({
        url: "/api/v1/specialization/stats",
      }),
      providesTags: ["Specialization", "Admin"],
    }),

    // Notification endpoints
    getNotifications: builder.query({
      query: (params) => ({
        url: "/api/v1/notification",
        params,
      }),
      providesTags: ["Notification"],
    }),
    markAsRead: builder.mutation({
      query: (id) => ({
        url: `/api/v1/notification/${id}/read`,
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    markAllAsRead: builder.mutation({
      query: () => ({
        url: "/api/v1/notification/read-all",
        method: "PUT",
      }),
      invalidatesTags: ["Notification"],
    }),
    getUnreadCount: builder.query({
      query: () => ({
        url: "/api/v1/notification/unread-count",
      }),
      providesTags: ["Notification"],
    }),

    // Admin Analytics endpoints
    getDashboardStats: builder.query({
      query: () => ({
        url: "/api/v1/admin/analytics/stats",
      }),
      providesTags: ["Admin"],
    }),
    getAppointmentsDaily: builder.query({
      query: (params) => ({
        url: "/api/v1/admin/analytics/appointments-daily",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getAppointmentsBySpecialization: builder.query({
      query: (params) => ({
        url: "/api/v1/admin/analytics/appointments-specialization",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getAppointmentsByStatus: builder.query({
      query: (params) => ({
        url: "/api/v1/admin/analytics/appointments-status",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getRevenueMonthly: builder.query({
      query: (params) => ({
        url: "/api/v1/admin/analytics/revenue-monthly",
        params,
      }),
      providesTags: ["Admin"],
    }),
    getDoctorPerformance: builder.query({
      query: (params) => ({
        url: "/api/v1/admin/analytics/doctor-performance",
        params,
      }),
      providesTags: ["Admin"],
    }),

    // Patient endpoints
    getPatientAppointments: builder.query({
      query: (params) => ({
        url: "/api/v1/patient/appointments",
        params,
      }),
      providesTags: ["Appointment", "Patient"],
    }),
    getPatientMedicalRecords: builder.query({
      query: () => ({
        url: "/api/v1/patient/medical-records",
      }),
      providesTags: ["Patient"],
    }),
    getPatientPrescriptions: builder.query({
      query: () => ({
        url: "/api/v1/patient/prescriptions",
      }),
      providesTags: ["Patient"],
    }),

    // Upload endpoints
    uploadProfileImage: builder.mutation({
      query: (formData) => ({
        url: "/api/v1/upload/profile-image",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["User", "Doctor"],
    }),
    uploadDocument: builder.mutation({
      query: (formData) => ({
        url: "/api/v1/upload/document",
        method: "POST",
        body: formData,
      }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useLogoutMutation,
  useLoadUserQuery,
  useVerifyEmailMutation,
  useSendOTPMutation,
  useVerifyOTPMutation,
  useGetDoctorsQuery,
  useGetDoctorByIdQuery,
  useCreateDoctorProfileMutation,
  useUpdateDoctorProfileMutation,
  useVerifyDoctorMutation,
  useGetPendingVerificationsQuery,
  useGetAppointmentsQuery,
  useGetAppointmentByIdQuery,
  useBookAppointmentMutation,
  useConfirmAppointmentMutation,
  useCancelAppointmentMutation,
  useRescheduleAppointmentMutation,
  useCompleteAppointmentMutation,
  useGetAvailableSlotsQuery,
  useGenerateSlotsMutation,
  useGetDoctorSlotsQuery,
  useBlockSlotMutation,
  useUnblockSlotMutation,
  useGetSpecializationsQuery,
  useGetActiveSpecializationsQuery,
  useCreateSpecializationMutation,
  useUpdateSpecializationMutation,
  useDeleteSpecializationMutation,
  useGetSpecializationStatsQuery,
  useGetNotificationsQuery,
  useMarkAsReadMutation,
  useMarkAllAsReadMutation,
  useGetUnreadCountQuery,
  useGetDashboardStatsQuery,
  useGetAppointmentsDailyQuery,
  useGetAppointmentsBySpecializationQuery,
  useGetAppointmentsByStatusQuery,
  useGetRevenueMonthlyQuery,
  useGetDoctorPerformanceQuery,
  useGetPatientAppointmentsQuery,
  useGetPatientMedicalRecordsQuery,
  useGetPatientPrescriptionsQuery,
  useUploadProfileImageMutation,
  useUploadDocumentMutation,
} = apiSlice;

export default apiSlice;
