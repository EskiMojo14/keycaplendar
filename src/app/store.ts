import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "../components/common/commonSlice";
import userReducer from "../components/common/userSlice";
import settingsReducer from "../components/settings/settingsSlice";

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
