import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { HistoryTab } from "./types";

type HistoryState = {
  tab: HistoryTab;
  loading: boolean;
};

const initialState: HistoryState = {
  tab: "recent",
  loading: false,
};

export const historySlice = createSlice({
  name: "history",
  initialState,
  reducers: {
    setTab: (state, action: PayloadAction<HistoryTab>) => {
      state.tab = action.payload;
      scrollTo(0, 0);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setTab, setLoading } = historySlice.actions;

export const selectTab = (state: RootState) => state.history.tab;

export const selectLoading = (state: RootState) => state.history.loading;

export default historySlice.reducer;
