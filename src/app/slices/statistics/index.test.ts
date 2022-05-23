import produce from "immer";
import { createStore } from "~/app/store";
import {
  initialState,
  selectSettings,
  selectSort,
  statisticsSetting,
  statisticsSort,
} from "@s/statistics";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets statistics setting", () => {
  store.dispatch(statisticsSetting("shipped", "vendor"));
  const response = selectSettings(store.getState());
  const expected = produce(initialState.settings, (draftSettings) => {
    draftSettings.shipped = "vendor";
  });
  expect(response).toEqual(expected);
});

it("sets sort", () => {
  store.dispatch(statisticsSort("shipped", "alphabetical"));
  const response = selectSort(store.getState());
  const expected = produce(initialState.sort, (draftSort) => {
    draftSort.shipped = "alphabetical";
  });
  expect(response).toEqual(expected);
});
