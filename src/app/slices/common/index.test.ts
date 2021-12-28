import { createStore } from "~/app/store";
import {
  selectDevice,
  selectOrientation,
  selectPage,
  selectTheme,
  setAppPage,
  setDevice,
  setOrientation,
  setTheme,
} from "@s/common";
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
