import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { ActionType } from "./types";

type AuditState = {
  allActions: ActionType[];
  filterAction: "created" | "deleted" | "none" | "updated";
  filteredActions: ActionType[];
  filterUser: string;
  length: number;
  loading: boolean;
  users: string[];
};

export const initialState: AuditState = {
  allActions: [],
  filterAction: "none",
  filteredActions: [],
  filterUser: "all",
  length: 50,
  loading: false,
  users: [],
};

export const auditSlice = createSlice({
  initialState,
  name: "audit",
  reducers: {
    setAllActions: (state, { payload }: PayloadAction<ActionType[]>) => {
      state.allActions = payload;
    },
    setFilterAction: (
      state,
      { payload }: PayloadAction<"created" | "deleted" | "none" | "updated">
    ) => {
      state.filterAction = payload;
    },
    setFilteredActions: (state, { payload }: PayloadAction<ActionType[]>) => {
      state.filteredActions = payload;
    },
    setFilterUser: (state, { payload }: PayloadAction<string>) => {
      state.filterUser = payload;
    },
    setLength: (state, { payload }: PayloadAction<number>) => {
      state.length = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setUsers: (state, { payload }: PayloadAction<string[]>) => {
      state.users = payload;
    },
  },
});

export const {
  actions: {
    setAllActions,
    setFilterAction,
    setFilteredActions,
    setFilterUser,
    setLength,
    setLoading,
    setUsers,
  },
} = auditSlice;

export const selectLoading = (state: RootState) => state.audit.loading;

export const selectAllActions = (state: RootState) => state.audit.allActions;

export const selectFilteredActions = (state: RootState) =>
  state.audit.filteredActions;

export const selectFilterAction = (state: RootState) =>
  state.audit.filterAction;

export const selectFilterUser = (state: RootState) => state.audit.filterUser;

export const selectLength = (state: RootState) => state.audit.length;

export const selectUsers = (state: RootState) => state.audit.users;

export default auditSlice.reducer;
