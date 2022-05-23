import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
import firebase from "@s/firebase";
import firestore from "@s/firebase/firestore";
import type { GuideId } from "@s/firebase/types";
import { visibilityVals } from "@s/guides/constants";
import {
  alphabeticalSort,
  alphabeticalSortPropCurried,
  groupBy,
  objectEntries,
  objectFromEntries,
  removeDuplicates,
} from "@s/util/functions";
import type { GuideEntryType, Visibility } from "./types";

const guideEntryAdapter = createEntityAdapter<GuideEntryType>({
  sortComparer: alphabeticalSortPropCurried<GuideEntryType, "title">(
    "title",
    false,
    "Welcome to KeycapLendar!"
  ),
});

const getGuides = firebase.functions().httpsCallable("getGuides");

export const guideApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    createGuideEntry: build.mutation<GuideId, Omit<GuideEntryType, "id">>({
      onQueryStarted: async (entry, { dispatch, queryFulfilled }) => {
        try {
          const { data: id } = await queryFulfilled;
          dispatch(
            guideApi.util.updateQueryData(
              "getGuides",
              undefined,
              (entityState) =>
                guideEntryAdapter.setOne(entityState, { ...entry, id })
            )
          );
        } catch {}
      },
      queryFn: async (entry) => {
        try {
          const docRef = await firestore.collection("guides").add(entry);
          return {
            data: docRef.id,
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    deleteGuideEntry: build.mutation<"Success", EntityId>({
      onQueryStarted: async (id, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            guideApi.util.updateQueryData(
              "getGuides",
              undefined,
              (entityState) => guideEntryAdapter.removeOne(entityState, id)
            )
          );
        } catch {}
      },
      queryFn: async (id) => {
        try {
          await firestore
            .collection("guides")
            .doc(id as GuideId)
            .delete();
          return {
            data: "Success",
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    getGuides: build.query<EntityState<GuideEntryType>, void>({
      queryFn: async () => {
        try {
          return {
            data: guideEntryAdapter.setAll(
              guideEntryAdapter.getInitialState(),
              (await getGuides()).data
            ),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
    updateGuideEntry: build.mutation<"Success", GuideEntryType>({
      onQueryStarted: async (entry, { dispatch, queryFulfilled }) => {
        try {
          await queryFulfilled;
          dispatch(
            guideApi.util.updateQueryData(
              "getGuides",
              undefined,
              (entityState) => guideEntryAdapter.setOne(entityState, entry)
            )
          );
        } catch {}
      },
      queryFn: async ({ id, ...entry }) => {
        try {
          await firestore
            .collection("guides")
            .doc(id as GuideId)
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
  useCreateGuideEntryMutation,
  useDeleteGuideEntryMutation,
  useGetGuidesQuery,
  useUpdateGuideEntryMutation,
} = guideApi;

export const setupGuideListeners = combineListeners((startListening) =>
  createErrorMessagesListeners(
    guideApi.endpoints,
    {
      createGuideEntry: "Failed to create guide entry",
      deleteGuideEntry: "Failed to delete guide entry",
      getGuides: "Failed to get guide entries",
      updateGuideEntry: "Failed to update entry",
    },
    startListening
  )
);

type GuidesState = {
  filteredTag: string;
};

export const initialState: GuidesState = {
  filteredTag: "",
};

export const guidesSlice = createSlice({
  initialState,
  name: "guides",
  reducers: {
    filterTag: (state, { payload }: PayloadAction<string>) => {
      state.filteredTag = payload;
    },
  },
});

export const {
  actions: { filterTag },
} = guidesSlice;

export default guidesSlice.reducer;

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export const {
  selectAll: selectEntries,
  selectById: selectEntryById,
  selectEntities: selectEntryMap,
  selectIds: selectEntryIds,
  selectTotal: selectEntryTotal,
} = guideEntryAdapter.getSelectors();

export const selectAllTags = createSelector(selectEntries, (entries) =>
  alphabeticalSort(removeDuplicates(entries.map((entry) => entry.tags).flat(1)))
);

const blankVisibilityMap = visibilityVals.reduce<
  Record<Visibility, EntityId[]>
>((acc, vis) => {
  acc[vis] ??= [];
  return acc;
}, {} as Record<Visibility, EntityId[]>);

export const selectVisibilityMap = createSelector(selectEntries, (entries) => ({
  ...blankVisibilityMap,
  ...groupBy(
    [...entries].sort(
      typeof guideEntryAdapter.sortComparer === "function"
        ? guideEntryAdapter.sortComparer
        : undefined
    ),
    "visibility",
    { createVal: ({ id }) => id }
  ),
}));

export const selectFilteredVisibilityMap = createSelector(
  selectEntryMap,
  selectVisibilityMap,
  (_: unknown, filteredTag: string) => filteredTag,
  (entryMap, visibilityMap, filteredTag) =>
    objectFromEntries<typeof visibilityMap>(
      objectEntries(visibilityMap).map(([key, ids]) => [
        key,
        ids.filter(
          (id) => filteredTag === "" || entryMap[id]?.tags.includes(filteredTag)
        ),
      ])
    )
);
