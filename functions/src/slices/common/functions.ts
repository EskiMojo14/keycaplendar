import { DateTime } from "luxon";
import { DateSortKeys, SetType } from "../main/types";
import { StatisticsSetType } from "../statistics/types";

/**
 * Checks that object contains specified key.
 * @param obj Object to be checked.
 * @param key Key to check against `obj`.
 * @returns Whether `obj` has the specified `key`.
 */

export const hasKey = <O>(obj: O, key: keyof any): key is keyof O => {
  return key in obj;
};

/**
 * Remove all duplicate values within an array.
 * @param array Array of values.
 * @returns `array` with only unique values.
 */

export const uniqueArray = <T>(oldArray: T[]): T[] => {
  return Array.from(new Set(oldArray));
};

/**
 * Counts occurrences of specified value within provided array.
 * @param arr Array to be checked.
 * @param val Value to be counted.
 * @returns Amount of items within `arr` equal to `val`.
 */

export const countInArray = (arr: any[], val: any): number => {
  return arr.reduce((count, item) => count + (item === val), 0);
};

/**
 * Sorts an array of strings in alphabetical order.
 * @param array Array of strings to be sorted.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @returns `array` sorted alphabetically in ascending or descending order.
 */

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

/**
 * Sorts an array of objects by a specified prop, in alphabetical order.
 * @param array Array of identical objects.
 * @param prop Property to sort objects by.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of `array`.
 * @returns `array` sorted by provided prop, with hoisted value at the beginning if provided.
 */

export const alphabeticalSortProp = <O extends Record<string, unknown>>(
  array: O[],
  prop: keyof O,
  descending = false,
  hoist?: O[keyof O]
): O[] => {
  array.sort((a, b) => {
    const x = a[prop];
    const y = b[prop];
    if (hoist && (x === hoist || y === hoist)) {
      return x === hoist ? -1 : 1;
    }
    const c = typeof x === "string" ? x.toLowerCase() : x;
    const d = typeof y === "string" ? y.toLowerCase() : y;
    if (c < d) {
      return descending ? 1 : -1;
    }
    if (c > d) {
      return descending ? -1 : 1;
    }
    return 0;
  });
  return array;
};

/**
 * Takes an array of set objects, and returns a month range of the specfied property, in the specified format (uses Luxon).
 * @param sets Array of set objects to be checked.
 * @param prop Property of set to be used.
 * @param format Luxon string to specify format. See {@link https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens}.
 * @returns Array of months from earliest to latest, in specified format.
 */

export const getSetMonthRange = (
  sets: (SetType | StatisticsSetType)[],
  prop: DateSortKeys,
  format: string
): string[] => {
  const setMonths = uniqueArray(
    sets.map((set) => {
      const val = set[prop];
      return val && !val.includes("Q") ? DateTime.fromISO(val).toFormat("yyyy-MM") : "";
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
  const monthDiff = (dateFrom: DateTime, dateTo: DateTime) => {
    return dateTo.month - dateFrom.month + 12 * (dateTo.year - dateFrom.year);
  };
  const length =
    monthDiff(
      DateTime.fromISO(setMonths[0], { zone: "utc" }),
      DateTime.fromISO(setMonths[setMonths.length - 1], { zone: "utc" })
    ) + 1;
  let i;
  const allMonths = [];
  for (i = 0; i < length; i++) {
    allMonths.push(DateTime.fromISO(setMonths[0], { zone: "utc" }).plus({ months: i }).toFormat(format));
  }
  return allMonths;
};

/**
 * ### Returns Go / Lua like responses(data, err)
 * when used with await
 *
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.all([req1, req2, req3])
 * - Example response [ [data1, data2, data3], undefined ]
 * - Example response [ undefined, Error ]
 *
 *
 * When used with Promise.race([req1, req2, req3])
 * - Example response [ data, undefined ]
 * - Example response [ undefined, Error ]
 *
 * @param {Promise} promise
 * @returns {Promise} [ data, undefined ]
 * @returns {Promise} [ undefined, Error ]
 */

export const handle = <T>(promise: Promise<T>): Promise<[T, undefined] | [undefined, any]> => {
  return promise
    .then((data) => [data, undefined] as [T, undefined])
    .catch((error) => Promise.resolve([undefined, error] as [undefined, any]));
};
