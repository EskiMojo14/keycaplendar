import { createEntityAdapter } from "@reduxjs/toolkit";
import type { EntityId, EntityState } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import type { AppStartListening } from "@mw/listener";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type { UpdateEntryType } from "./types";

const updateEntryAdapter = createEntityAdapter<UpdateEntryType>({
  sortComparer: (a: UpdateEntryType, b: UpdateEntryType) => {
    if ((a.pinned || b.pinned) && !(a.pinned && b.pinned)) {
      return a.pinned ? -1 : 1;
    }
    return (
      alphabeticalSortPropCurried<UpdateEntryType, "date">("date", true)(
        a,
        b
      ) || alphabeticalSortPropCurried<UpdateEntryType, "title">("title")(a, b)
    );
  },
});

export const updateApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createEntry: build.mutation<UpdateId, Omit<UpdateEntryType, "id">>({
      invalidatesTags: () => [
        { id: "LIST", type: "Update" as const },
        { id: "NEW", type: "Update" as const },
      ],
      queryFn: async (entry) => {
        try {
          const docRef = await firestore.collection("updates").add(entry);
          return {
            data: docRef.id,
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    deleteEntry: build.mutation<void, EntityId>({
      invalidatesTags: (_, __, id) => [
        { id, type: "Update" as const },
        { id: "NEW", type: "Update" as const },
      ],
      queryFn: async (id) => {
        try {
          return {
            data: await firestore
              .collection("updates")
              .doc(id as UpdateId)
              .delete(),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    getNewUpdate: build.query<boolean, void>({
      providesTags: () => [{ id: "NEW", type: "Update" as const }],
      queryFn: async () => {
        const lastWeek = DateTime.utc().minus({ days: 7 });
        try {
          let data = false;
          const querySnapshot = await firestore
            .collection("updates")
            .orderBy("date", "desc")
            .limit(1)
            .get();

          querySnapshot.forEach((doc) => {
            const date = DateTime.fromISO(doc.data().date, { zone: "utc" });
            if (date >= lastWeek) {
              data = true;
            }
          });

          return { data };
        } catch (error) {
          return { error };
        }
      },
    }),
    getUpdates: build.query<EntityState<UpdateEntryType>, void>({
      providesTags: (result) =>
        result
          ? [
              ...result.ids.map((id) => ({ id, type: "Update" as const })),
              { id: "LIST", type: "Update" as const },
            ]
          : [{ id: "LIST", type: "Update" as const }],
      queryFn: async () => {
        try {
          const querySnapshot = await firestore
            .collection("updates")
            .orderBy("date", "desc")
            .get();

          const entries: UpdateEntryType[] = [];
          querySnapshot.forEach((doc) => {
            const data = doc.data();
            entries.push({
              ...data,
              id: doc.id,
              pinned: data.pinned ?? false,
            });
          });
          return {
            data: updateEntryAdapter.setAll(
              updateEntryAdapter.getInitialState(),
              entries
            ),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    pinEntry: build.mutation<void, UpdateEntryType>({
      invalidatesTags: (_, __, entry) => [
        { id: entry.id, type: "Update" as const },
      ],
      queryFn: async (entry) => {
        try {
          return {
            data: await firestore
              .collection("updates")
              .doc(entry.id as UpdateId)
              .set({ pinned: !entry.pinned }, { merge: true }),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    updateEntry: build.mutation<void, UpdateEntryType>({
      invalidatesTags: (_, __, { id }) => [{ id, type: "Update" as const }],
      queryFn: async ({ id, ...entry }) => {
        try {
          return {
            data: await firestore
              .collection("updates")
              .doc(id as UpdateId)
              .set(entry),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const {
  useCreateEntryMutation,
  useDeleteEntryMutation,
  useGetNewUpdateQuery,
  useGetUpdatesQuery,
  usePinEntryMutation,
  useUpdateEntryMutation,
} = updateApi;

export const setupUpdateListeners = combineListeners(
  (startListening: AppStartListening) => [
    ...createErrorMessagesListeners(
      updateApi.endpoints,
      {
        createEntry: "Failed to create update entry",
        deleteEntry: "Failed to delete update entry",
        getNewUpdate: "",
        getUpdates: "Failed to get update entries",
        pinEntry: "Failed to pin entry",
        updateEntry: "Failed to update entry",
      },
      startListening
    ),
  ]
);

export const {
  selectAll: selectEntries,
  selectById: selectEntryById,
  selectEntities: selectEntryMap,
  selectIds: selectEntryIds,
  selectTotal: selectEntryTotal,
} = updateEntryAdapter.getSelectors();
