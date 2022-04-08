import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import {
  alphabeticalSort,
  alphabeticalSortPropCurried,
  removeDuplicates,
} from "@s/util/functions";
import type { ActionType } from "./types";

const actionAdapter = createEntityAdapter<ActionType>({
  selectId: ({ changelogId }) => changelogId,
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
};

export const initialState: AuditState = {
  actions: actionAdapter.getInitialState(),
  filter: { action: "none", user: "all" },
  length: 50,
  loading: false,
};

export const auditSlice = createSlice({
  initialState,
  name: "audit",
  reducers: {
    deleteAction: (state, { payload }: PayloadAction<EntityId>) => {
      actionAdapter.removeOne(state.actions, payload);
    },
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
  },
});

export const {
  actions: {
    deleteAction,
    setAllActions,
    setFilterAction,
    setFilterUser,
    setLength,
    setLoading,
  },
} = auditSlice;

export const selectLoading = (state: RootState) => state.audit.loading;

export const selectFilter = (state: RootState) => state.audit.filter;

export const selectFilterAction = (state: RootState) =>
  state.audit.filter.action;

export const selectFilterUser = (state: RootState) => state.audit.filter.user;

export const selectLength = (state: RootState) => state.audit.length;

export const {
  selectAll: selectActions,
  selectById: selectActionById,
  selectEntities: selectActionMap,
  selectIds: selectActionIds,
  selectTotal: selectActionTotal,
} = actionAdapter.getSelectors<RootState>((state) => state.audit.actions);

export const selectUsers = createSelector(selectActions, (actions) =>
  alphabeticalSort(
    removeDuplicates(actions.map(({ user: { nickname } }) => nickname)).filter(
      (str): str is string => !!str
    )
  )
);

export default auditSlice.reducer;
