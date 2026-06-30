import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import api, { setStore } from '../services/api';

// Import other reducers when they exist
import appointmentsReducer from '../features/appointments/appointmentSlice';
import doctorsReducer from '../features/doctors/doctorSlice';
import notificationsReducer from '../features/notifications/notificationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    appointments: appointmentsReducer,
    doctors: doctorsReducer,
    notifications: notificationsReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ['persist/PERSIST', 'persist/REHYDRATE'],
      },
    }),
});

// Set store reference in api
setStore(store);

export default store;