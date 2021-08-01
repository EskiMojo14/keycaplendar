import { configureStore } from "@reduxjs/toolkit";
import routerReducer from "@s/router/routerSlice";
import commonReducer from "@s/common/commonSlice";
import userReducer from "@s/user/userSlice";
import settingsReducer from "@s/settings/settingsSlice";
import mainReducer from "@s/main/mainSlice";
import statisticsReducer from "@s/statistics/statisticsSlice";
import historyReducer from "@s/history/historySlice";
import auditReducer from "@s/audit/auditSlice";
import usersReducer from "@s/users/usersSlice";
import imagesReducer from "@s/images/imagesSlice";
import guidesReducer from "@s/guides/guidesSlice";
import updatesReducer from "@s/updates/updatesSlice";

export const store = configureStore({
  reducer: {
    router: routerReducer,
    common: commonReducer,
    settings: settingsReducer,
    user: userReducer,
    main: mainReducer,
    statistics: statisticsReducer,
    history: historyReducer,
    audit: auditReducer,
    users: usersReducer,
    images: imagesReducer,
    guides: guidesReducer,
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
