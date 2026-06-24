import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  persistStore,
  persistReducer,
  FLUSH,
  REHYDRATE,
  PAUSE,
  PERSIST,
  PURGE,
  REGISTER,
} from "redux-persist";
import storage from "redux-persist/lib/storage";
import { thunk } from "redux-thunk";
import {forgotPasswordReducer, profileReducer, userReducer} from './Reducers/userReducer'
// Combine your reducers
const rootReducer = combineReducers({
    user : userReducer ,
    profile : profileReducer,
    forgetPassword : forgotPasswordReducer,
});

// Configure Redux Persist
const persistConfig = { 
  key: "root",
  storage,
  whitelist: ["user"], // Only the 'user' reducer will be persisted
  blacklist: ["products", "productDetail"], // Exclude 'products' and 'productDetail' from serialization
};

const initialState = {};
// Create the persistedReducer
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Create the store with Redux Toolkit and Redux Persist
const Store = configureStore({
  reducer: persistedReducer,
  preloadedState: initialState,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: {
        ignoredActions: [FLUSH, REHYDRATE, PAUSE, PERSIST, PURGE, REGISTER],
      },
    }).concat(thunk),
  devTools: process.env.NODE_ENV !== "production",
});

const persistor = persistStore(Store);

export { Store, persistor };
