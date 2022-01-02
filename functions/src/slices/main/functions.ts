import { DateTime } from "luxon";
import { StatisticsSetType } from "../statistics/types";
import { Pages } from "./types";

/**
 * Tests whether a set would be shown on each page.
 * @param set Set to be tested.
 * @param favorites Array of set IDs which are favorited.
 * @param bought Array of set IDs which are bought.
 * @param hidden Array of set IDs which are hidden.
 * @returns Object with page keys, containing a boolean of if that set would be shown on the page.
 */

export const pageConditions = (
  set: StatisticsSetType
): Record<Pages, boolean> => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const startDate = DateTime.fromISO(set.gbLaunch, {
    zone: "utc",
  });
  const endDate = DateTime.fromISO(set.gbEnd).set({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });
  return {
    calendar:
      startDate > today ||
      (startDate <= today && (endDate >= yesterday || !set.gbEnd)),
    live: startDate <= today && (endDate >= yesterday || !set.gbEnd),
    ic: !set.gbLaunch || set.gbLaunch.includes("Q"),
    previous: Boolean(endDate && endDate <= yesterday),
    timeline: Boolean(set.gbLaunch && !set.gbLaunch.includes("Q")),
    archive: true,
  };
};
