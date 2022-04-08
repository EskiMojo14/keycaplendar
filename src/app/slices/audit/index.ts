import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import isEqual from "lodash.isequal";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import firestore from "@s/firebase/firestore";
import {
  alphabeticalSort,
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  removeDuplicates,
} from "@s/util/functions";
import { auditProperties } from "./constants";
import type { ActionType } from "./types";

const actionAdapter = createEntityAdapter<ActionType>({
  selectId: ({ changelogId }) => changelogId,
  sortComparer: alphabeticalSortPropCurried("timestamp", true),
});

export type AuditState = {
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

const processAction = ({
  after,
  before,
  ...restAction
}: ActionType): ActionType => {
  if (before && after) {
    auditProperties.forEach((prop) => {
      const { [prop]: beforeProp } = before;
      const { [prop]: afterProp } = after;
      if (
        isEqual(beforeProp, afterProp) &&
        prop !== "profile" &&
        prop !== "colorway"
      ) {
        delete before[prop];
        delete after[prop];
      }
    });
  }
  return {
    ...restAction,
    after,
    before,
  };
};

export const getActions =
  (length?: number): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    dispatch(setLoading(true));
    try {
      const querySnapshot = await firestore
        .collection("changelog")
        .orderBy("timestamp", "desc")
        .limit(length ?? selectLength(getState()))
        .get();

      const actions: ActionType[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const action = data.before?.profile
          ? data.after?.profile
            ? "updated"
            : "deleted"
          : "created";
        actions.push({
          ...data,
          action,
          changelogId: doc.id,
        });
      });

      alphabeticalSortProp(actions, "timestamp", true);

      dispatch([setAllActions(actions.map(processAction)), setLoading(false)]);
    } catch (error) {
      queue.notify({ title: `Error getting data: ${error}` });
      dispatch(setLoading(false));
    }
  };
