import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type { UpdateEntryType } from "./types";

export const sortEntries = (a: UpdateEntryType, b: UpdateEntryType) => {
  if ((a.pinned || b.pinned) && !(a.pinned && b.pinned)) {
    return a.pinned ? -1 : 1;
  }
  return (
    alphabeticalSortPropCurried<UpdateEntryType, "date">("date", true)(a, b) ||
    alphabeticalSortPropCurried<UpdateEntryType, "title">("title")(a, b)
  );
};

const updateEntryAdapter = createEntityAdapter<UpdateEntryType>({
  sortComparer: sortEntries,
});

type UpdatesState = {
  entries: EntityState<UpdateEntryType>;
  loading: boolean;
  urlEntry: EntityId;
};

export const initialState: UpdatesState = {
  entries: updateEntryAdapter.getInitialState(),
  loading: false,
  urlEntry: "",
};

export const updatesSlice = createSlice({
  initialState,
  name: "updates",
  reducers: {
    setEntries: (state, { payload }: PayloadAction<UpdateEntryType[]>) => {
      updateEntryAdapter.setAll(state.entries, payload);
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
  actions: { setEntries, setLoading, setURLEntry },
} = updatesSlice;

export const selectLoading = (state: RootState) => state.updates.loading;

export const {
  selectAll: selectEntries,
  selectById,
  selectEntities: selectEntryMap,
  selectIds,
  selectTotal,
} = updateEntryAdapter.getSelectors<RootState>(
  (state) => state.updates.entries
);

export const selectURLEntry = (state: RootState) => state.updates.urlEntry;

export default updatesSlice.reducer;
