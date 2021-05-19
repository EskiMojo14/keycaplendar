import store from "../../store";
import { setStatsTab } from "./statisticsSlice";
import { StatsTab } from "../../../util/types";

export const setStatisticsTab = (tab: StatsTab, clearUrl = true) => {
  const { dispatch } = store;
  const {
    statistics: { tab: statsTab },
  } = store.getState();
  if (statsTab !== tab) {
    document.documentElement.scrollTop = 0;
    dispatch(setStatsTab(tab));
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    params.delete("statisticsTab");
    const questionParam = params.has("page") ? "?" + params.toString() : "/";
    window.history.pushState({}, "KeycapLendar", questionParam);
  }
};
