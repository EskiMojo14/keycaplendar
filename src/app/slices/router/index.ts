import type { Location } from "history";
import type { RootState } from "~/app/store";
import { allPages } from "@s/common/constants";
import type { Page } from "@s/common/types";
import { arrayIncludes } from "@s/util/functions";

export const selectLocation = (state: RootState, location: Location) =>
  location;

export const getPageName = (pathname: string): Page => {
  if (pathname === "/") {
    return "calendar";
  } else {
    const [, page] = pathname.split("/");
    if (arrayIncludes(allPages, page)) {
      return page;
    } else {
      // this won't happen - router directs to 404
      return "calendar";
    }
  }
};
