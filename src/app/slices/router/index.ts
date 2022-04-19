import type { Location } from "history";
import type { RootState } from "~/app/store";

export const selectLocation = (state: RootState, location: Location) =>
  location;

export const getPageName = (pathname: string) =>
  pathname === "/" ? "calendar" : pathname.split("/")[1];
