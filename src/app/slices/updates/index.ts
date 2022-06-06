import { createEntityAdapter } from "@reduxjs/toolkit";
import type { EntityId, EntityState } from "@reduxjs/toolkit";
import { DateTime } from "luxon";
import baseApi from "@s/api";
import { addErrorMessages } from "@s/api/functions";
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
    createUpdateEntry: build.mutation<UpdateId, Omit<UpdateEntryType, "id">>({
      onQueryStarted: async (entry, { dispatch, queryFulfilled }) => {
        try {
          const { data: id } = await queryFulfilled;
          dispatch(
            updateApi.util.updateQueryData(
              "getNewUpdate",
              undefined,
              () => true
            )
          );
          dispatch(
            updateApi.util.updateQueryData(
              "getUpdates",
              undefined,
              (entityState) =>
                updateEntryAdapter.setOne(entityState, { ...entry, id })
            )
          );
        } catch {}
      },
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
    deleteUpdateEntry: build.mutation<"Success", EntityId>({
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            updateApi.util.prefetch("getNewUpdate", undefined, { force: true })
          );
          dispatch(
            updateApi.util.updateQueryData(
              "getUpdates",
              undefined,
              (entityState) => updateEntryAdapter.removeOne(entityState, id)
            )
          );
        } catch {}
      },
      queryFn: async (id) => {
        try {
          await firestore
            .collection("updates")
            .doc(id as UpdateId)
            .delete();
          return {
            data: "Success",
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    getNewUpdate: build.query<boolean, void>({
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
    pinUpdateEntry: build.mutation<"Success", UpdateEntryType>({
      onQueryStarted: async (entry, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            updateApi.util.updateQueryData(
              "getUpdates",
              undefined,
              (entityState) => {
                const {
                  entities: { [entry.id]: entryInState },
                } = entityState;
                if (entryInState) {
                  entryInState.pinned === !entry.pinned;
                }
              }
            )
          );
        } catch {}
      },
      queryFn: async (entry) => {
        try {
          await firestore
            .collection("updates")
            .doc(entry.id as UpdateId)
            .set({ pinned: !entry.pinned }, { merge: true });
          return {
            data: "Success",
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    updateUpdateEntry: build.mutation<"Success", UpdateEntryType>({
      onQueryStarted: async (entry, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            updateApi.util.updateQueryData(
              "getUpdates",
              undefined,
              (entityState) => updateEntryAdapter.setOne(entityState, entry)
            )
          );
        } catch {}
      },
      queryFn: async ({ id, ...entry }) => {
        try {
          await firestore
            .collection("updates")
            .doc(id as UpdateId)
            .set(entry);
          return {
            data: "Success",
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
  useCreateUpdateEntryMutation,
  useDeleteUpdateEntryMutation,
  useGetNewUpdateQuery,
  useGetUpdatesQuery,
  usePinUpdateEntryMutation,
  useUpdateUpdateEntryMutation,
} = updateApi;

addErrorMessages<typeof updateApi.endpoints>({
  createUpdateEntry: "Failed to create update entry",
  deleteUpdateEntry: "Failed to delete update entry",
  getUpdates: "Failed to get update entries",
  pinUpdateEntry: "Failed to pin entry",
  updateUpdateEntry: "Failed to update entry",
});

export const {
  selectAll: selectEntries,
  selectById: selectEntryById,
  selectEntities: selectEntryMap,
  selectIds: selectEntryIds,
  selectTotal: selectEntryTotal,
} = updateEntryAdapter.getSelectors();
