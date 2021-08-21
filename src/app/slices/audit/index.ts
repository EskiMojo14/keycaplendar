import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { ActionType } from "./types";

type AuditState = {
  loading: boolean;

  allActions: ActionType[];
  filteredActions: ActionType[];

  users: string[];
  filterAction: "none" | "created" | "updated" | "deleted";
  filterUser: string;
  length: number;
};

export const initialState: AuditState = {
  loading: false,
  //actions
  allActions: [],
  filteredActions: [],
  //filter
  users: [],
  filterAction: "none",
  filterUser: "all",
  length: 50,
};

export const auditSlice = createSlice({
  name: "audit",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setAllActions: (state, action: PayloadAction<ActionType[]>) => {
      state.allActions = action.payload;
    },
    setFilteredActions: (state, action: PayloadAction<ActionType[]>) => {
      state.filteredActions = action.payload;
    },
    setFilterAction: (state, action: PayloadAction<"none" | "created" | "updated" | "deleted">) => {
      state.filterAction = action.payload;
    },
    setFilterUser: (state, action: PayloadAction<string>) => {
      state.filterUser = action.payload;
    },
    setLength: (state, action: PayloadAction<number>) => {
      state.length = action.payload;
    },
    setUsers: (state, action: PayloadAction<string[]>) => {
      state.users = action.payload;
    },
  },
});

export const {
  setLoading,
  setAllActions,
  setFilteredActions,
  setFilterAction,
  setFilterUser,
  setLength,
  setUsers,
} = auditSlice.actions;

export const selectLoading = (state: RootState) => state.audit.loading;

export const selectAllActions = (state: RootState) => state.audit.allActions;

export const selectFilteredActions = (state: RootState) => state.audit.filteredActions;

export const selectFilterAction = (state: RootState) => state.audit.filterAction;

export const selectFilterUser = (state: RootState) => state.audit.filterUser;

export const selectLength = (state: RootState) => state.audit.length;

export const selectUsers = (state: RootState) => state.audit.users;

export default auditSlice.reducer;
