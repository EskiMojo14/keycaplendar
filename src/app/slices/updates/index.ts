import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
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

type UpdatesState = {
  entries: EntityState<UpdateEntryType> & {
    urlEntry: EntityId;
  };
  loading: boolean;
};

export const initialState: UpdatesState = {
  entries: updateEntryAdapter.getInitialState({ urlEntry: "" }),
  loading: false,
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
      state.entries.urlEntry = payload;
    },
  },
});

export const {
  actions: { setEntries, setLoading, setURLEntry },
} = updatesSlice;

export const selectLoading = (state: RootState) => state.updates.loading;

export const {
  selectAll: selectEntries,
  selectById: selectEntryById,
  selectEntities: selectEntryMap,
  selectIds: selectEntryIds,
  selectTotal: selectEntryTotal,
} = updateEntryAdapter.getSelectors<RootState>(
  (state) => state.updates.entries
);

export const selectURLEntry = (state: RootState) =>
  state.updates.entries.urlEntry;

export default updatesSlice.reducer;
