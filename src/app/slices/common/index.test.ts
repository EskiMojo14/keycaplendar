import { createStore } from "~/app/store";
import {
  selectCurrentThemeMap,
  selectDevice,
  selectOrientation,
  selectPage,
  selectTheme,
  selectThemesMap,
  setAppPage,
  setDevice,
  setOrientation,
  setTheme,
  setThemeMaps,
} from "@s/common";
import { blankTheme } from "@s/common/constants";
import type { Page } from "@s/common/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets device category", () => {
  const category = "mobile";
  store.dispatch(setDevice(category));
  const response = selectDevice(store.getState());
  expect(response).toBe(category);
});

it("sets device orientation", () => {
  const orientation = "portrait";
  store.dispatch(setOrientation(orientation));
  const response = selectOrientation(store.getState());
  expect(response).toBe(orientation);
});

it("sets app page", () => {
  const page: Page = "calendar";
  store.dispatch(setAppPage(page));
  const response = selectPage(store.getState());
  expect(response).toBe(page);
});

it("sets app theme", () => {
  const theme = "deep";
  store.dispatch(setTheme(theme));
  const response = selectTheme(store.getState());
  expect(response).toBe(theme);
});

const mockThemeMap = { deep: blankTheme };

it("sets theme maps", () => {
  store.dispatch(setThemeMaps(mockThemeMap));
  const response = selectThemesMap(store.getState());
  expect(response).toEqual(mockThemeMap);
});

it("selects current theme map", () => {
  store.dispatch(setTheme("deep"));
  store.dispatch(setThemeMaps(mockThemeMap));
  const response = selectCurrentThemeMap(store.getState());
  expect(response).toEqual(mockThemeMap.deep);
});
