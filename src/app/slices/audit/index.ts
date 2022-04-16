import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import isEqual from "lodash.isequal";
import type { RootState } from "~/app/store";
import { auditProperties } from "@s/audit/constants";
import firestore from "@s/firebase/firestore";
import type { ChangelogId } from "@s/firebase/types";
import {
  alphabeticalSort,
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  removeDuplicates,
} from "@s/util/functions";
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
  loadingId: string;
};

export const initialState: AuditState = {
  actions: actionAdapter.getInitialState(),
  filter: { action: "none", user: "all" },
  length: 50,
  loadingId: "",
};

/* eslint-disable no-use-before-define */
export const auditSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(getActions.pending, (state, { meta: { requestId } }) => {
        state.loadingId = requestId;
      })
      .addCase(
        getActions.fulfilled,
        (state, { meta: { requestId }, payload }) => {
          actionAdapter.setAll(state.actions, payload);
          if (state.loadingId === requestId) {
            state.loadingId = "";
          }
        }
      )
      .addCase(getActions.rejected, (state, { meta: { requestId } }) => {
        if (state.loadingId === requestId) {
          state.loadingId = "";
        }
      })
      .addCase(deleteAction.fulfilled, (state, { meta: { arg } }) => {
        actionAdapter.removeOne(state.actions, arg);
      });
  },
  initialState,
  name: "audit",
  reducers: {
    removeAction: (state, { payload }: PayloadAction<EntityId>) => {
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
  },
});
/* eslint-enable no-use-before-define */

export const {
  actions: {
    removeAction,
    setAllActions,
    setFilterAction,
    setFilterUser,
    setLength,
  },
} = auditSlice;

export const selectLoading = (state: RootState) => !!state.audit.loadingId;

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

export const processAction = ({
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

export const getActions = createAsyncThunk<
  ActionType[],
  number | undefined,
  { state: RootState }
>("audit/getActions", async (length, { getState }) => {
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
  return actions.map(processAction);
});

export const deleteAction = createAsyncThunk(
  "audit/deleteAction",
  async (id: EntityId) =>
    await firestore
      .collection("changelog")
      .doc(id as ChangelogId)
      .delete()
);
