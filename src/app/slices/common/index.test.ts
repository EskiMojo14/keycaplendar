import { createStore } from "~/app/store";
import {
  selectPage,
  selectThemesMap,
  setAppPage,
  setThemeMaps,
} from "@s/common";
import { blankTheme } from "@s/common/constants";
import type { Page } from "@s/common/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets app page", () => {
  const page: Page = "calendar";
  store.dispatch(setAppPage(page));
  const response = selectPage(store.getState());
  expect(response).toBe(page);
});

const mockThemeMap = { deep: blankTheme };

it("sets theme maps", () => {
  store.dispatch(setThemeMaps(mockThemeMap));
  const response = selectThemesMap(store.getState());
  expect(response).toEqual(mockThemeMap);
});
