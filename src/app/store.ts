import { combineReducers, configureStore } from "@reduxjs/toolkit";
import { loadState } from "~/app/local-storage";
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
import listenerMiddleware from "~/app/middleware/listener";

const reducers = {
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
};

const reducer = combineReducers(reducers);

export type RootState = ReturnType<typeof reducer>;

export const createStore = (preloadedState?: Partial<RootState>) =>
  configureStore({
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({
        immutableCheck: false,
        serializableCheck: false,
      }).concat(listenerMiddleware),
    preloadedState,
    reducer,
  });

export type AppStore = ReturnType<typeof createStore>;

export type AppDispatch = AppStore["dispatch"];

export const store = createStore(loadState());

export default store;
