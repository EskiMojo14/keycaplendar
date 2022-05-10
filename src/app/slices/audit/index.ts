import {
  createAsyncThunk,
  createEntityAdapter,
  createSelector,
  createSlice,
  isAnyOf,
  isFulfilled,
  isPending,
  isRejected,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { AnyAsyncThunk } from "@reduxjs/toolkit/dist/matchers";
import isEqual from "lodash.isequal";
import type { RootState } from "~/app/store";
import type { AppStartListening } from "@mw/listener";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
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

export const auditApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getActions: builder.query<EntityState<ActionType>, number>({
      queryFn: async (length) => {
        try {
          const querySnapshot = await firestore
            .collection("changelog")
            .orderBy("timestamp", "desc")
            // eslint-disable-next-line no-use-before-define
            .limit(length)
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
          return {
            data: actionAdapter.setAll(
              actionAdapter.getInitialState(),
              actions.map(processAction)
            ),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetActionsQuery } = auditApi;

export const setupAuditListeners = combineListeners(
  (startListening: AppStartListening) => [
    ...createErrorMessagesListeners(
      auditApi.endpoints,
      {
        getActions: "Failed to get audit actions",
      },
      startListening
    ),
  ]
);

export const getActions = createAsyncThunk<
  ActionType[],
  number | undefined,
  { state: RootState }
>("audit/getActions", async (length, { getState }) => {
  const querySnapshot = await firestore
    .collection("changelog")
    .orderBy("timestamp", "desc")
    // eslint-disable-next-line no-use-before-define
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

const idAsyncThunks = <AsyncThunks extends [AnyAsyncThunk, ...AnyAsyncThunk[]]>(
  ...thunks: AsyncThunks
) => thunks;

const loadingAsyncThunks = idAsyncThunks(getActions);

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

export const auditSlice = createSlice({
  extraReducers: (builder) => {
    builder
      .addCase(getActions.fulfilled, (state, { payload }) => {
        actionAdapter.setAll(state.actions, payload);
      })
      .addCase(deleteAction.fulfilled, (state, { meta: { arg } }) => {
        actionAdapter.removeOne(state.actions, arg);
      })
      .addMatcher(
        isPending(...loadingAsyncThunks),
        (state, { meta: { requestId } }) => {
          state.loadingId = requestId;
        }
      )
      .addMatcher(
        isAnyOf(
          isFulfilled(...loadingAsyncThunks),
          isRejected(...loadingAsyncThunks)
        ),
        (state, { meta: { requestId } }) => {
          if (state.loadingId === requestId) {
            state.loadingId = "";
          }
        }
      );
  },
  initialState,
  name: "audit",
  reducers: {
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

export const {
  actions: { setFilterAction, setFilterUser, setLength },
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
} = actionAdapter.getSelectors();

export const selectUsers = createSelector(selectActions, (actions) =>
  alphabeticalSort(
    removeDuplicates(actions.map(({ user: { nickname } }) => nickname)).filter(
      (str): str is string => !!str
    )
  )
);

export default auditSlice.reducer;
