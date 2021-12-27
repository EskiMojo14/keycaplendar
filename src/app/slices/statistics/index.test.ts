import produce from "immer";
import { createStore } from "~/app/store";
import {
  initialState,
  selectData,
  selectLoading,
  selectSettings,
  selectSort,
  selectTab,
  setLoading,
  setStatisticsData,
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from "@s/statistics";
import { StatsTab } from "@s/statistics/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets tab", () => {
  const tab: StatsTab = "timelines";
  store.dispatch(setStatsTab(tab));
  const response = selectTab(store.getState());
  expect(response).toBe(tab);
});

it("sets loading state", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets statistics data", () => {
  const modifiedStats = produce(initialState.data, (draftStats) => {
    draftStats.timelines.icDate.allProfiles = ["test"];
  });
  store.dispatch(setStatisticsData(modifiedStats));
  const response = selectData(store.getState());
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
