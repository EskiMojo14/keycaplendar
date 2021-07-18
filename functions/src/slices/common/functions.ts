import { DateTime } from "luxon";
import { is } from "typescript-is";
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
 * Checks if item is included in array, and asserts that the types are the same.
 * @param arr Array of items
 * @param item Item to be checked
 * @returns Whether the item is contained in the array.
 */

export const arrayIncludes = <T>(arr: T[] | Readonly<T[]>, item: any): item is T => {
  return arr.includes(item);
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
 * Creates a function to pass to sort an array of items in alphabetical order.
 * @param descending Whether to sort the items in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of array.
 * @returns Function to pass `a` and `b` to.
 * @example
 * arr.sort(alphabeticalSortCurried())
 * @example
 * arr.sort(alphabeticalSortCurried(true))
 * @example
 * arr.sort((a, b) => alphabeticalSortCurried()(a.key, b.key))
 * @example
 * arr.sort((a, b) => alphabeticalSortCurried()(a.key, b.key) || alphabeticalSortCurried()(a.key2, b.key2))
 */

export const alphabeticalSortCurried = <T extends unknown>(descending = false, hoist?: T) => (
  a: T,
  b: T
): 1 | -1 | 0 => {
  if (hoist && (a === hoist || b === hoist) && a !== b) {
    return a === hoist ? -1 : 1;
  }
  const x = is<string>(a) ? a.toLowerCase() : a;
  const y = is<string>(b) ? b.toLowerCase() : b;
  if (x < y) {
    return descending ? 1 : -1;
  }
  if (x > y) {
    return descending ? -1 : 1;
  }
  return 0;
};

/**
 * Sorts an array of strings in alphabetical order.
 * @param array Array of strings to be sorted.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of array.
 * @returns `array` sorted alphabetically in ascending or descending order, with hoisted value at the beginning if provided.
 */

export const alphabeticalSort = (array: string[], descending = false, hoist?: string): string[] =>
  array.sort(alphabeticalSortCurried(descending, hoist));

/**
 * Creates a function to pass to sort an array of objects by a specified prop, in alphabetical order.
 * @param prop Property to sort objects by.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of `array`.
 * @returns Function to pass `a` and `b` objects to.
 * @example
 * arr.sort(alphabeticalSortProp("key"))
 * @example
 * arr.sort((a,b) => alphabeticalSortProp("key")(a,b) || alphabeticalSortProp("key2")(a,b))
 */

export const alphabeticalSortPropCurried = <O extends Record<string, unknown>, K extends keyof O>(
  prop: K,
  descending = false,
  hoist?: O[K]
) => (a: O, b: O): 1 | -1 | 0 => {
  const x = a[prop];
  const y = b[prop];
  if (hoist && (x === hoist || y === hoist) && x !== y) {
    return x === hoist ? -1 : 1;
  }
  const c = is<string>(x) ? x.toLowerCase() : x;
  const d = is<string>(y) ? y.toLowerCase() : y;
  if (c < d) {
    return descending ? 1 : -1;
  }
  if (c > d) {
    return descending ? -1 : 1;
  }
  return 0;
};

/**
 * Sorts an array of objects by a specified prop, in alphabetical order.
 * @param array Array of identical objects.
 * @param prop Property to sort objects by.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of `array`.
 * @returns `array` sorted by provided prop, with hoisted value at the beginning if provided.
 */

export const alphabeticalSortProp = <O extends Record<string, unknown>, K extends keyof O>(
  array: O[],
  prop: K,
  descending = false,
  hoist?: O[K]
): O[] => array.sort(alphabeticalSortPropCurried(prop, descending, hoist));

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
  alphabeticalSort(setMonths);
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
