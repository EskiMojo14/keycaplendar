import { createBrowserHistory } from "history";
import type { Location } from "history";
import type { RootState } from "~/app/store";

export const history = createBrowserHistory();

export const selectLocation = (state: RootState, location: Location) =>
  location;
