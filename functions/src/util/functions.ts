import { StatisticsSetType } from "./types";
import * as moment from "moment";

export const hasKey = <O>(obj: O, key: keyof any): key is keyof O => {
  return key in obj;
};

export const uniqueArray = <T>(oldArray: T[]): T[] => {
  return Array.from(new Set(oldArray));
};

export const countInArray = (arr: any[], val: any): number => {
  return arr.reduce((count, item) => count + (item === val), 0);
};

export const alphabeticalSort = (array: string[]): string[] => {
  array.sort((a, b) => {
    const x = a.toLowerCase();
    const y = b.toLowerCase();
    if (x < y) {
      return -1;
    }
    if (x > y) {
      return 1;
    }
    return 0;
  });
  return array;
};

export const getSetMonthRange = (
  sets: StatisticsSetType[],
  prop: keyof StatisticsSetType,
  format: string
): string[] => {
  const setMonths = uniqueArray(
    sets.map((set) => {
      const val = set[prop];
      return val && typeof val === "string" && !val.includes("Q") ? moment(val).format("YYYY-MM") : "";
    })
  ).filter(Boolean);
  setMonths.sort((a, b) => {
    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  });
  const monthDiff = (dateFrom: moment.Moment, dateTo: moment.Moment) => {
    return dateTo.month() - dateFrom.month() + 12 * (dateTo.year() - dateFrom.year());
  };
  const length = monthDiff(moment(setMonths[0]), moment(setMonths[setMonths.length - 1])) + 1;
  let i;
  const allMonths = [];
  for (i = 0; i < length; i++) {
    allMonths.push(moment(setMonths[0]).add(i, "M").format(format));
  }
  return allMonths;
};
