import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import isEqual from "lodash.isequal";
import type { RootState } from "~/app/store";
import { combineListeners } from "@mw/listener/functions";
import baseApi, { selectAllCachedArgsByQuery } from "@s/api";
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
  endpoints: (build) => ({
    deleteAction: build.mutation<string, EntityId>({
      onQueryStarted: async (id, { dispatch, getState, queryFulfilled }) => {
        try {
          await queryFulfilled;
          for (const length of selectAllCachedArgsByQuery(
            getState() as RootState,
            "getActions"
          )) {
            dispatch(
              auditApi.util.updateQueryData(
                "getActions",
                length,
                (entityState) => actionAdapter.removeOne(entityState, id)
              )
            );
          }
        } catch {}
      },
      queryFn: async (id) => {
        try {
          await firestore
            .collection("changelog")
            .doc(id as ChangelogId)
            .delete();
          return {
            data: "Success",
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    getActions: build.query<EntityState<ActionType>, number>({
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

export const { useDeleteActionMutation, useGetActionsQuery } = auditApi;

export const setupAuditListeners = combineListeners((startListening) =>
  createErrorMessagesListeners(
    auditApi.endpoints,
    {
      deleteAction: "Failed to delete audit entry",
      getActions: "Failed to get audit entries",
    },
    startListening
  )
);

export type AuditState = {
  filter: {
    action: "created" | "deleted" | "none" | "updated";
    user: string;
  };
  length: number;
};

export const initialState: AuditState = {
  filter: { action: "none", user: "all" },
  length: 50,
};

export const auditSlice = createSlice({
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
