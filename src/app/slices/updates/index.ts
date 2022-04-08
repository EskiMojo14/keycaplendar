import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
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

export const getEntries = (): AppThunk<Promise<void>> => async (dispatch) => {
  dispatch(setLoading(true));
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
    dispatch([setEntries(entries), setLoading(false)]);
  } catch (error) {
    dispatch(setLoading(false));
    console.log(`Error getting data: ${error}`);
    queue.notify({ title: `Error getting data: ${error}` });
  }
};

export const pinEntry =
  (entryId: EntityId): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const entry = selectEntryById(getState(), entryId);
    try {
      await firestore
        .collection("updates")
        .doc(entryId as UpdateId)
        .set({ pinned: !entry?.pinned }, { merge: true });
      queue.notify({
        title: `Entry ${entry?.pinned ? "unpinned" : "pinned"}.`,
      });
      await dispatch(getEntries());
    } catch (error) {
      console.log(
        `Failed to ${entry?.pinned ? "unpin" : "pin"} entry: ${error}`
      );
      queue.notify({
        title: `Failed to ${entry?.pinned ? "unpin" : "pin"} entry: ${error}`,
      });
    }
  };
