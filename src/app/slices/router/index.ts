import type { Location } from "history";
import type { RootState } from "~/app/store";

export const selectLocation = (state: RootState, location: Location) =>
  location;
