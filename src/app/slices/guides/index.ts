import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import firebase from "@s/firebase";
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

const blankVisibilityMap = visibilityVals.reduce<
  Record<Visibility, EntityId[]>
>((acc, vis) => {
  acc[vis] ??= [];
  return acc;
}, {} as Record<Visibility, EntityId[]>);

const guideEntryAdapter = createEntityAdapter<GuideEntryType>({
  sortComparer: alphabeticalSortPropCurried<GuideEntryType, "title">(
    "title",
    false,
    "Welcome to KeycapLendar!"
  ),
});

type GuidesState = {
  entries: EntityState<GuideEntryType> & {
    urlEntry: EntityId;
  };
  filteredTag: string;
  loading: boolean;
};

export const initialState: GuidesState = {
  entries: guideEntryAdapter.getInitialState({
    urlEntry: "",
    visibilityMap: blankVisibilityMap,
  }),
  filteredTag: "",
  loading: false,
};

export const guidesSlice = createSlice({
  initialState,
  name: "guides",
  reducers: {
    setEntries: (state, { payload }: PayloadAction<GuideEntryType[]>) => {
      guideEntryAdapter.setAll(state.entries, payload);
    },
    setFilteredTag: (state, { payload }: PayloadAction<string>) => {
      state.filteredTag = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setURLEntry: (state, { payload }: PayloadAction<EntityId>) => {
      state.entries.urlEntry = payload;
    },
  },
});

export const {
  actions: { setEntries, setFilteredTag, setLoading, setURLEntry },
} = guidesSlice;

export const selectLoading = (state: RootState) => state.guides.loading;

export const {
  selectAll: selectEntries,
  selectById: selectEntryById,
  selectEntities: selectEntryMap,
  selectIds: selectEntryIds,
  selectTotal: selectEntryTotal,
} = guideEntryAdapter.getSelectors<RootState>((state) => state.guides.entries);

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export const selectURLEntry = (state: RootState) =>
  state.guides.entries.urlEntry;

export const selectAllTags = createSelector(selectEntries, (entries) =>
  alphabeticalSort(removeDuplicates(entries.map((entry) => entry.tags).flat(1)))
);

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
  selectFilteredTag,
  selectEntryMap,
  selectVisibilityMap,
  (filteredTag, entryMap, visibilityMap) =>
    objectFromEntries<typeof visibilityMap>(
      objectEntries(visibilityMap).map(([key, ids]) => [
        key,
        ids.filter(
          (id) => filteredTag === "" || entryMap[id]?.tags.includes(filteredTag)
        ),
      ])
    )
);

export default guidesSlice.reducer;

export const getEntries = (): AppThunk<Promise<void>> => async (dispatch) => {
  const cloudFn = firebase.functions().httpsCallable("getGuides");
  dispatch(setLoading(true));
  try {
    const result = await cloudFn();
    dispatch([setEntries(result.data), setLoading(false)]);
  } catch (error) {
    console.log(`Error getting data: ${error}`);
    queue.notify({ title: `Error getting data: ${error}` });
    dispatch(setLoading(false));
  }
};
