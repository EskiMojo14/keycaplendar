import { configureStore } from "@reduxjs/toolkit";
import commonReducer from "./slices/common/commonSlice";
import userReducer from "./slices/user/userSlice";
import settingsReducer from "./slices/settings/settingsSlice";
import mainReducer from "./slices/main/mainSlice";
import statisticsReducer from "./slices/statistics/statisticsSlice";
import historyReducer from "./slices/history/historySlice";
import auditReducer from "./slices/audit/auditSlice";
import usersReducer from "./slices/users/usersSlice";
import imagesReducer from "./slices/images/imagesSlice";
import updatesReducer from "./slices/updates/updatesSlice";

export const store = configureStore({
  reducer: {
    common: commonReducer,
    settings: settingsReducer,
    user: userReducer,
    main: mainReducer,
    statistics: statisticsReducer,
    history: historyReducer,
    audit: auditReducer,
    users: usersReducer,
    images: imagesReducer,
    updates: updatesReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredPaths: ["statistics.data"] },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
