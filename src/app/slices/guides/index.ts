import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import {
  alphabeticalSort,
  alphabeticalSortPropCurried,
  removeDuplicates,
} from "@s/util/functions";
import type { GuideEntryType, Visibility } from "./types";

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
  entries: EntityState<GuideEntryType>;
  filteredTag: string;
  loading: boolean;
  urlEntry: EntityId;
  visibilityMap: Partial<Record<Visibility, EntityId[]>>;
};

export const initialState: GuidesState = {
  allTags: [],
  entries: guideEntryAdapter.getInitialState(),
  filteredTag: "",
  loading: false,
  urlEntry: "",
  visibilityMap: {},
};

export const guidesSlice = createSlice({
  initialState,
  name: "guides",
  reducers: {
    setEntries: (state, { payload }: PayloadAction<GuideEntryType[]>) => {
      guideEntryAdapter.setAll(state.entries, payload);
      state.visibilityMap = payload
        .sort(sortEntries)
        .reduce<Partial<Record<Visibility, EntityId[]>>>(
          (prev, { id, visibility }) => {
            prev[visibility] ??= [];
            prev[visibility]?.push(id);
            return prev;
          },
          {}
        );
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
      state.urlEntry = payload;
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

export const selectURLEntry = (state: RootState) => state.guides.urlEntry;

export const selectAllTags = (state: RootState) => state.guides.allTags;

export const selectFilteredTag = (state: RootState) => state.guides.filteredTag;

export const selectVisibilityMap = (state: RootState) =>
  state.guides.visibilityMap;

export default guidesSlice.reducer;
