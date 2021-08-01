import { configureStore } from "@reduxjs/toolkit";
import audit from "@s/audit";
import common from "@s/common/commonSlice";
import guides from "@s/guides/guidesSlice";
import history from "@s/history/historySlice";
import images from "@s/images/imagesSlice";
import main from "@s/main/mainSlice";
import settings from "@s/settings/settingsSlice";
import statistics from "@s/statistics/statisticsSlice";
import updates from "@s/updates/updatesSlice";
import user from "@s/user/userSlice";
import users from "@s/users/usersSlice";

export const store = configureStore({
  reducer: {
    audit,
    common,
    guides,
    history,
    images,
    main,
    settings,
    statistics,
    updates,
    user,
    users,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: { ignoredPaths: ["statistics.data"] },
    }),
});

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
