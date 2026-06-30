import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  isSidebarOpen: false,
  theme: localStorage.getItem("theme") || "light",
  notificationsUnreadCount: 0,
};

const uiSlice = createSlice({
  name: "ui",
  initialState,
  reducers: {
    toggleSidebar: (state) => {
      state.isSidebarOpen = !state.isSidebarOpen;
    },
    setSidebarOpen: (state, action) => {
      state.isSidebarOpen = action.payload;
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem("theme", action.payload);
      if (action.payload === "dark") {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    },
    setUnreadNotifications: (state, action) => {
      state.notificationsUnreadCount = action.payload;
    },
    incrementUnreadNotifications: (state) => {
      state.notificationsUnreadCount += 1;
    },
    clearUnreadNotifications: (state) => {
      state.notificationsUnreadCount = 0;
    },
  },
});

export const {
  toggleSidebar,
  setSidebarOpen,
  setTheme,
  setUnreadNotifications,
  incrementUnreadNotifications,
  clearUnreadNotifications,
} = uiSlice.actions;

export default uiSlice.reducer;
