import { configureStore } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";
import { loadState, saveState } from "~/app/localStorage";
import audit from "@s/audit";
import common from "@s/common";
import guides from "@s/guides";
import history from "@s/history";
import images from "@s/images";
import main from "@s/main";
import settings from "@s/settings";
import statistics from "@s/statistics";
import updates from "@s/updates";
import user from "@s/user";
import users from "@s/users";

export const store = configureStore({
  preloadedState: loadState(),
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

let currentValue: string;

store.subscribe(
  debounce(() => {
    const previousValue = currentValue;
    const { main, settings, user } = store.getState();
    currentValue = JSON.stringify({ main, settings, user });
    if (previousValue !== currentValue) {
      saveState(store.getState());
    }
  }, 1000)
);

export type RootState = ReturnType<typeof store.getState>;

export type AppDispatch = typeof store.dispatch;

export default store;
