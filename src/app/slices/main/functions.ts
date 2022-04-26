import produce from "immer";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { ordinal } from "@s/util/functions";
import type { OldPresetType, PresetType, SetType } from "./types";

const oneDay = 24 * 60 * 60 * 1000;

/**
 * Finds the last day of the given month and adds it to the end.
 * @param date YYYY-MM
 * @returns YYYY-MM-DD
 */
export const addLastDate = (date: string) => {
  const { daysInMonth: lastInMonth } = DateTime.fromISO(date);
  return `${date}-${lastInMonth}`;
};

export const getSetDetails = (
  set: SetType,
  { month = "MMMM", year = "yyyy" } = {}
) => {
  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });

  const gbLaunch =
    set.gbLaunch?.includes("Q") || !set.gbLaunch
      ? set.gbLaunch
      : DateTime.fromISO(set.gbLaunch, { zone: "utc" });
  const gbLaunchOrdinal =
    gbLaunch instanceof DateTime ? ordinal(gbLaunch.day) : "";

  const gbEnd =
    set.gbEnd &&
    DateTime.fromISO(set.gbEnd, { zone: "utc" }).set({
      hour: 23,
      millisecond: 999,
      minute: 59,
      second: 59,
    });
  const gbEndOrdinal = gbEnd instanceof DateTime ? ordinal(gbEnd.day) : "";

  const icDate = set.icDate && DateTime.fromISO(set.icDate, { zone: "utc" });
  const icDateOrdinal = icDate instanceof DateTime ? ordinal(icDate.day) : "";
  let subtitle = "";
  if (gbLaunch && gbLaunch instanceof DateTime && gbEnd) {
    subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0${month}`)}${
      (gbLaunch.year !== today.year && gbLaunch.year !== gbEnd.year) ||
      gbLaunch.year !== gbEnd.year
        ? gbLaunch.toFormat(`\xa0${year}`)
        : ""
    } until ${gbEnd.toFormat(`d'${gbEndOrdinal}'\xa0${month}`)}${
      gbEnd.year !== today.year || gbLaunch.year !== gbEnd.year
        ? gbEnd.toFormat(`\xa0${year}`)
        : ""
    }`;
  } else if (gbLaunch && is<string>(gbLaunch)) {
    subtitle = `GB expected ${gbLaunch}`;
  } else if (set.gbMonth && gbLaunch && gbLaunch instanceof DateTime) {
    subtitle = `GB expected ${
      gbLaunch.toFormat(month) +
      (gbLaunch.year !== today.year ? gbLaunch.toFormat(`\xa0${year}`) : "")
    }`;
  } else if (gbLaunch && gbLaunch instanceof DateTime) {
    subtitle = `${gbLaunch.toFormat(`d'${gbLaunchOrdinal}'\xa0${month}`)}${
      gbLaunch.year !== today.year ? gbLaunch.toFormat(`\xa0${year}`) : ""
    }`;
  } else if (icDate) {
    subtitle = `IC posted ${icDate.toFormat(
      `d'${icDateOrdinal}'\xa0${month}`
    )}${icDate.year !== today.year ? icDate.toFormat(`\xa0${year}`) : ""}`;
  }
  const live =
    gbLaunch instanceof DateTime && gbEnd
      ? gbLaunch.valueOf() < today.valueOf() &&
        (gbEnd.valueOf() > yesterday.valueOf() || !set.gbEnd)
      : false;

  const daysLeft = gbEnd
    ? Math.ceil(Math.abs((gbEnd.valueOf() - today.valueOf()) / oneDay))
    : 0;
  const thisWeek = gbEnd
    ? gbEnd.valueOf() - 7 * oneDay < today.valueOf() &&
      gbEnd.valueOf() > today.valueOf()
    : false;

  return { daysLeft, live, subtitle, thisWeek };
};

export const updatePreset = (
  preset: OldPresetType | PresetType,
  { regions }: { regions: string[] }
) =>
  produce(preset, (draftPreset) => {
    draftPreset.whitelist.regions ??= regions;
    draftPreset.whitelist.bought ??= false;
    if (typeof draftPreset.whitelist.hidden === "boolean") {
      draftPreset.whitelist.hidden = draftPreset.whitelist.hidden
        ? "hidden"
        : "unhidden";
    }
  }) as PresetType;
