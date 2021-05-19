import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/common/commonSlice";
import userReducer from "./slices/user/userSlice";
import settingsReducer from "./slices/settings/settingsSlice";
import statisticsReducer from "./slices/statistics/statisticsSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    settings: settingsReducer,
    user: userReducer,
    statistics: statisticsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
