import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/common/commonSlice";
import userReducer from "./slices/user/userSlice";
import settingsReducer from "./slices/settings/settingsSlice";
import mainReducer from "./slices/main/mainSlice";
import statisticsReducer from "./slices/statistics/statisticsSlice";
import historyReducer from "./slices/history/historySlice";
import auditReducer from "./slices/audit/auditSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    settings: settingsReducer,
    user: userReducer,
    main: mainReducer,
    statistics: statisticsReducer,
    history: historyReducer,
    audit: auditReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
