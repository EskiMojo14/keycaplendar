import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/commonSlice";
import userReducer from "./slices/userSlice";
import settingsReducer from "./slices/settingsSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    settings: settingsReducer,
    user: userReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
