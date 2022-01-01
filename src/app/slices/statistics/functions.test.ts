import store from "~/app/store";
import {
  setStatisticsSetting,
  setStatisticsSort,
  setStatsTab,
} from "@s/statistics";
import * as statsFunctions from "@s/statistics/functions";
import type {
  StatisticsSortType,
  StatisticsType,
  StatsTab,
} from "@s/statistics/types";

const { setSetting, setSort, setStatisticsTab } = statsFunctions;

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
  let pushStateSpy = jest.spyOn(window.history, "pushState");
  beforeEach(() => {
    pushStateSpy = jest.spyOn(window.history, "pushState");
    // add necessary url params to make clearUrl trigger
    global.window = Object.create(window);
    Object.defineProperty(window, "location", {
      value: new URL(
        "https://keycaplendar.firebaseapp.com/statistics?statisticsTab=summary"
      ) as unknown as Location,
    });
  });
  afterAll(() => {
    pushStateSpy.mockRestore();
  });
  it("dispatches stats tab action", () => {
    setStatisticsTab(tab);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, setStatsTab(tab));
    expect(pushStateSpy).toHaveBeenCalled();
  });
  it("doesn't push state when told not to", () => {
    setStatisticsTab(tab, false);
    expect(pushStateSpy).not.toHaveBeenCalled();
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
  /* eslint-disable @typescript-eslint/no-empty-function */
  let sortDataSpy = jest
    .spyOn(statsFunctions, "sortData")
    .mockImplementation(jest.fn());
  beforeEach(() => {
    sortDataSpy = jest
      .spyOn(statsFunctions, "sortData")
      .mockImplementation(jest.fn());
  });
  afterAll(() => {
    sortDataSpy.mockRestore();
  });
  /* eslint-enable @typescript-eslint/no-empty-function */
  it("dispatches sort action and calls sortData", () => {
    const setting: keyof StatisticsSortType = "vendors";
    const val: StatisticsSortType["vendors"] = "alphabetical";
    setSort(setting, val);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setStatisticsSort(setting, val)
    );
    expect(sortDataSpy).toHaveBeenCalled();
  });
});
