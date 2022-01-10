import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { visibilityVals } from "@s/guides/constants";
import {
  alphabeticalSort,
  alphabeticalSortPropCurried,
  groupBy,
  removeDuplicates,
} from "@s/util/functions";
import type { GuideEntryType, Visibility } from "./types";

const blankVisibilityMap = visibilityVals.reduce<
  Record<Visibility, EntityId[]>
>((acc, vis) => {
  acc[vis] ??= [];
  return acc;
}, {} as Record<Visibility, EntityId[]>);

const sortEntries = alphabeticalSortPropCurried<GuideEntryType, "title">(
  "title",
  false,
  "Welcome to KeycapLendar!"
);

const guideEntryAdapter = createEntityAdapter<GuideEntryType>({
  sortComparer: sortEntries,
});

type GuidesState = {
  allTags: string[];
  entries: EntityState<GuideEntryType> & {
    urlEntry: EntityId;
    visibilityMap: Record<Visibility, EntityId[]>;
  };
  filteredTag: string;
  loading: boolean;
};

export const initialState: GuidesState = {
  allTags: [],
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
      state.entries.visibilityMap = {
        ...blankVisibilityMap,
        ...groupBy(
          [...payload].sort(sortEntries),
          "visibility",
          ({ id }) => id
        ),
      };
      state.allTags = alphabeticalSort(
        removeDuplicates(payload.map((entry) => entry.tags).flat(1))
      );
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
  selectById,
  selectEntities: selectEntryMap,
  selectIds,
  selectTotal,
} = guideEntryAdapter.getSelectors<RootState>((state) => state.guides.entries);

export const selectURLEntry = (state: RootState) =>
  state.guides.entries.urlEntry;

export const selectAllTags = (state: RootState) => state.guides.allTags;

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export const selectVisibilityMap = (state: RootState) =>
  state.guides.entries.visibilityMap;

export default guidesSlice.reducer;
