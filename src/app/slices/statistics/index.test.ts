import type { Location } from "history";
import produce from "immer";
import { createStore } from "~/app/store";
import {
  initialState,
  selectData,
  selectSettings,
  selectSort,
  setStatisticsData,
  setStatisticsSetting,
  setStatisticsSort,
} from "@s/statistics";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets statistics data", () => {
  const modifiedStats = produce(initialState.data, (draftStats) => {
    draftStats.timelines.icDate.allProfiles = ["test"];
  });
  store.dispatch(setStatisticsData(modifiedStats));
  const response = selectData(store.getState(), {
    pathname: "/statistics/summary",
  } as Location);
  expect(response).toEqual(modifiedStats);
});

it("sets statistics setting", () => {
  store.dispatch(setStatisticsSetting("shipped", "vendor"));
  const response = selectSettings(store.getState());
  const expected = produce(initialState.settings, (draftSettings) => {
    draftSettings.shipped = "vendor";
  });
  expect(response).toEqual(expected);
});

it("sets sort", () => {
  store.dispatch(setStatisticsSort("shipped", "alphabetical"));
  const response = selectSort(store.getState());
  const expected = produce(initialState.sort, (draftSort) => {
    draftSort.shipped = "alphabetical";
  });
  expect(response).toEqual(expected);
});
