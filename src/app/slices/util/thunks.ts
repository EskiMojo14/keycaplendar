import type { AppThunk, RootState } from "~/app/store";

export const selectFromState =
  <Selected>(selector: (state: RootState) => Selected): AppThunk<Selected> =>
  (dispatch, getState) =>
    selector(getState());
