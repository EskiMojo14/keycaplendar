import { combineReducers, configureStore } from "@reduxjs/toolkit";
import debounce from "lodash.debounce";
import { loadState, saveState } from "~/app/local-storage";
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
      }),
    preloadedState,
    reducer,
  });

export type AppStore = ReturnType<typeof createStore>;

export type AppDispatch = AppStore["dispatch"];

export const store = createStore(loadState());

let currentValue: string;

store.subscribe(
  debounce(() => {
    const previousValue = currentValue;
    const { common, main, settings, user } = store.getState();
    currentValue = JSON.stringify({
      common,
      main,
      settings,
      user,
    });
    if (previousValue !== currentValue) {
      saveState(store.getState());
    }
  }, 1000)
);

export default store;
