import produce from "immer";
import { createStore } from "~/app/store";
import {
  cookieDecision,
  initialState,
  selectCookies,
  selectSettings,
  selectShareNameLoading,
  settingChange,
  settingsChange,
  shareNameLoad,
  toggleLich,
} from "@s/settings";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets a specific setting", () => {
  store.dispatch(settingChange("bottomNav", true));
  const response = selectSettings(store.getState());
  const expected = produce(initialState, (draftState) => {
    draftState.bottomNav = true;
  });
  expect(response).toEqual(expected);
});

it("merges settings objects", () => {
  store.dispatch(settingsChange({ bottomNav: true, darkTheme: "test" }));
  const response = selectSettings(store.getState());
  const expected = produce(initialState, (draftState) => {
    draftState.bottomNav = true;
    draftState.darkTheme = "test";
  });
  expect(response).toEqual(expected);
});

it("toggles lich theme", () => {
  store.dispatch(toggleLich());
  const response = selectSettings(store.getState());
  const expected = produce(initialState, (draftState) => {
    draftState.lichTheme = !draftState.lichTheme;
  });
  expect(response).toEqual(expected);
});

it("sets cookies", () => {
  store.dispatch(cookieDecision(true));
  const response = selectCookies(store.getState());
  expect(response).toBe(true);
});

it("sets loading state for public name", () => {
  store.dispatch(shareNameLoad(true));
  const response = selectShareNameLoading(store.getState());
  expect(response).toBe(true);
});
