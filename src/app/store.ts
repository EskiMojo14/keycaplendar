import { configureStore } from "@reduxjs/toolkit";
import audit from "@s/audit";
import common from "@s/common";
import guides from "@s/guides";
import history from "@s/history";
import images from "@s/images";
import main from "@s/main";
import settings from "@s/settings";
import statistics from "@s/statistics";
import updates from "@s/updates";
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
