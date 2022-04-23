import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
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

type GuidesState = {
  entries: EntityState<GuideEntryType>;
  filteredTag: string;
  loading: boolean;
};

export const initialState: GuidesState = {
  entries: guideEntryAdapter.getInitialState(),
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
  },
});

export const {
  actions: { setEntries, setFilteredTag, setLoading },
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
