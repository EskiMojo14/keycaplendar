import { configureStore } from "@reduxjs/toolkit";
import displayReducer from "../components/settings/displaySlice";
import settingsReducer from "../components/settings/settingsSlice";

export const store = configureStore({
  reducer: {
    display: displayReducer,
    settings: settingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
