import store from "../../store";
import { setTab } from "./historySlice";
import { HistoryTab } from "./types";

export const setHistoryTab = (tab: HistoryTab, clearUrl = true) => {
  const { dispatch } = store;
  const {
    history: { tab: historyTab },
  } = store.getState();
  if (historyTab !== tab) {
    document.documentElement.scrollTop = 0;
    dispatch(setTab(tab));
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    params.delete("historyTab");
    const questionParam = params.has("page") ? "?" + params.toString() : "/";
    window.history.pushState({}, "KeycapLendar", questionParam);
  }
};
