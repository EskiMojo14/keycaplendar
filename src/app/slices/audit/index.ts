import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type { ActionType } from "./types";

const actionAdapter = createEntityAdapter<ActionType>({
  selectId: (action) => action.changelogId,
  sortComparer: alphabeticalSortPropCurried("timestamp", true),
});

type AuditState = {
  actions: EntityState<ActionType>;
  filter: {
    action: "created" | "deleted" | "none" | "updated";
    user: string;
  };
  length: number;
  loading: boolean;
  users: string[];
};

export const initialState: AuditState = {
  actions: actionAdapter.getInitialState(),
  filter: { action: "none", user: "all" },
  length: 50,
  loading: false,
  users: [],
};

export const auditSlice = createSlice({
  initialState,
  name: "audit",
  reducers: {
    setAllActions: (state, { payload }: PayloadAction<ActionType[]>) => {
      actionAdapter.setAll(state.actions, payload);
    },
    setFilterAction: (
      state,
      { payload }: PayloadAction<"created" | "deleted" | "none" | "updated">
    ) => {
      state.filter.action = payload;
    },
    setFilterUser: (state, { payload }: PayloadAction<string>) => {
      state.filter.user = payload;
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
    setFilterUser,
    setLength,
    setLoading,
    setUsers,
  },
} = auditSlice;

export const selectLoading = (state: RootState) => state.audit.loading;

export const selectFilter = (state: RootState) => state.audit.filter;

export const selectFilterAction = (state: RootState) =>
  state.audit.filter.action;

export const selectFilterUser = (state: RootState) => state.audit.filter.user;

export const selectLength = (state: RootState) => state.audit.length;

export const selectUsers = (state: RootState) => state.audit.users;

export const {
  selectAll: selectActions,
  selectById,
  selectEntities: selectActionMap,
  selectIds,
  selectTotal,
} = actionAdapter.getSelectors<RootState>((state) => state.audit.actions);

export default auditSlice.reducer;
