import { configureStore, combineReducers } from "@reduxjs/toolkit";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";

// Import reducers
import authReducer from "./slices/authSlice";
import uiReducer from "./slices/uiSlice";
import patientReducer from "./slices/patientSlice";
import doctorReducer from "./slices/doctorSlice";
import appointmentReducer from "./slices/appointmentSlice";
import medicalRecordReducer from "./slices/medicalRecordSlice";
import prescriptionReducer from "./slices/prescriptionSlice";
import messageReducer from "./slices/messageSlice";

// Import RTK Query API slice
import apiSlice from "./api";

const rootReducer = combineReducers({
  auth: authReducer,
  ui: uiReducer,
  patient: patientReducer,
  doctor: doctorReducer,
  appointment: appointmentReducer,
  medicalRecord: medicalRecordReducer,
  prescription: prescriptionReducer,
  message: messageReducer,
  [apiSlice.reducerPath]: apiSlice.reducer,
});

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth", "ui"], // Only persist auth and ui state
};

const persistedReducer = persistReducer(persistConfig, rootReducer);

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: ["persist/PERSIST", "persist/REHYDRATE", "persist/REGISTER"],
      },
    }).concat(apiSlice.middleware),
});

export const persistor = persistStore(store);
