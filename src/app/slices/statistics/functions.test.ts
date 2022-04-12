import store from "~/app/store";
import {
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from "@s/statistics";
import { setSetting, setSort, setStatisticsTab } from "@s/statistics/functions";
import type {
  StatisticsSortType,
  StatisticsType,
  StatsTab,
} from "@s/statistics/types";

jest.mock("~/app/store");

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
  dispatchSpy = jest.spyOn(store, "dispatch");
});

afterAll(() => {
  dispatchSpy.mockRestore();
});

describe("setStatisticsTab", () => {
  const tab: StatsTab = "timelines";
  it("dispatches stats tab action", () => {
    setStatisticsTab(tab);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, setStatsTab(tab));
  });
  it("doesn't push state when told not to", () => {
    setStatisticsTab(tab, false);
  });
});

describe("setSetting", () => {
  it("dispatches setting action", () => {
    const setting: keyof StatisticsType = "summary";
    const val: StatisticsType["summary"] = "icDate";
    setSetting(setting, val);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setStatisticsSetting(setting, val)
    );
  });
});

describe("setSort", () => {
  it("dispatches sort action", () => {
    const setting: keyof StatisticsSortType = "vendors";
    const val: StatisticsSortType["vendors"] = "alphabetical";
    setSort(setting, val);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setStatisticsSort(setting, val)
    );
  });
});
