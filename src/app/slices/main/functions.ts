import moment from "moment";
import { mainPages } from "../common/constants";
import { SetType } from "./types";

/**
 * Tests whether a set would be shown on each page.
 * @param set Set to be tested.
 * @param favorites Array of set IDs which are favourited.
 * @param hidden Array of set IDs which are hidden
 * @returns Object with page keys, containing a boolean of if that set would be shown on the page.
 */

export const pageConditions = (
  set: SetType,
  favorites: string[],
  hidden: string[]
): Record<typeof mainPages[number], boolean> => {
  const today = moment.utc();
  const yesterday = moment.utc().date(today.date() - 1);
  const startDate = moment.utc(set.gbLaunch, ["YYYY-MM-DD", "YYYY-MM"]);
  const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
  return {
    calendar: startDate > today || (startDate <= today && (endDate >= yesterday || !set.gbEnd)),
    live: startDate <= today && (endDate >= yesterday || !set.gbEnd),
    ic: !set.gbLaunch || set.gbLaunch.includes("Q"),
    previous: !!(endDate && endDate <= yesterday),
    timeline: !!(set.gbLaunch && !set.gbLaunch.includes("Q")),
    archive: true,
    favorites: favorites.includes(set.id),
    hidden: hidden.includes(set.id),
  };
};
