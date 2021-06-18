import React from "react";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import firebase from "../firebase/firebase";
import { IconOptions, IconPropT } from "@rmwc/types";
import { replaceChars } from "./constants";
import { DateSortKeys, SetType } from "../main/types";

const storage = firebase.storage();

const storageRef = storage.ref();

/**
 * Checks that object contains specified key.
 * @param obj Object to be checked.
 * @param key Key to check against `obj`.
 * @returns Whether `obj` has the specified `key`.
 */

export const hasKey = <O>(obj: O, key: keyof any): key is keyof O => key in obj;

/**
 * Checks if item is included in array, and asserts that the types are the same.
 * @param arr Array of items
 * @param item Item to be checked
 * @returns Whether the item is contained in the array.
 */

export const arrayIncludes = <T>(arr: T[] | Readonly<T[]>, item: any): item is T => arr.includes(item);

/**
 * Checks every item of an array matches a condition, and asserts that the items are a specified type.
 * @param arr Array of items to be checked
 * @param callback Callback which takes each item and checks its type, returning `true` if the type matches.
 * @returns If all items meet the callback requirement.
 */

export const arrayEveryType = <T>(arr: any[], callback: (item: any) => boolean): arr is T[] => arr.every(callback);

/** Merge object and modify specified keys. */

export const mergeObject = <T>(obj: T, obj2: Partial<T>): T => Object.assign({ ...obj }, obj2);

/**
 * Remove all duplicate values within an array.
 * @param array Array of values.
 * @returns `array` with only unique values.
 */

export const uniqueArray = <T extends string | number>(arr: T[]): T[] =>
  arr.filter((item, index) => arr.indexOf(item) === index);

/**
 * "Toggles" an element in an array.
 * @param array Array of values.
 * @param value Value to be added or removed (if already in `array`).
 * @returns `array` with element added or removed.
 */

export const addOrRemove = <T>(array: T[], value: T): T[] => {
  const newArray: any[] = [...array];
  const index: number = newArray.indexOf(value);

  if (index === -1) {
    newArray.push(value);
  } else {
    newArray.splice(index, 1);
  }
  return newArray;
};

/**
 * Sorts an array of strings in alphabetical order.
 * @param array Array of strings to be sorted.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @returns `array` sorted alphabetically in ascending or descending order.
 */

export const alphabeticalSort = (array: string[], descending = false) => {
  array.sort((a, b) => {
    const x = a.toLowerCase();
    const y = b.toLowerCase();
    if (x < y) {
      return descending ? 1 : -1;
    }
    if (x > y) {
      return descending ? -1 : 1;
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
) => {
  array.sort((a, b) => {
    const x = a[prop];
    const y = b[prop];
    if (hoist && (x === hoist || y === hoist)) {
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
  });
  return array;
};

/**
 * Truncates a string to a specified length.
 * @param str String to be truncated.
 * @param num Amount of characters to include.
 * @returns String truncated with ... at the end.
 */

export const truncate = (str: string, num: number) => {
  return str.length <= num ? str : str.slice(0, num) + "...";
};

/**
 * Capitalise a string's first character.
 * @param str String to capitalise.
 * @returns `str` with first character capitalised.
 */

export const capitalise = (str: string) => str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Convert a string to camelCase.
 * @param str String to convert.
 * @param chr Character to separate `str` by. Defaults to a space character.
 * @returns `str` converted to camelCase.
 */

export const camelise = (str: string, chr = " ") => {
  return str
    .split(chr)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return capitalise(word.toLowerCase());
      }
    })
    .join("");
};

/**
 * Removes abnormal characters. Useful for file names or search.
 * @param str String to be normalised.
 * @param includeSpace Whether to include space characters in the final string.
 * @returns `str` with only normal characters. (`a-zA-Z0-9`)
 */

export const normalise = (str: string, includeSpace = true) => {
  const regex = includeSpace ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
  return str.normalize("NFD").replace(regex, "");
};

/**
 * Uses `replaceChars` constant and replaces specified character with specified replacement. Used for exceptions such as `βeta` to `Beta`.
 * @param str String to be iterated upon.
 * @returns `str` with specified characters replaced.
 */

export const replaceFunction = (str: string) => {
  let val = str;
  replaceChars.forEach((set) => {
    val = val.replace(set[0], set[1]);
  });
  return val;
};

/**
 * Combines multiple formatting functions to create a filename-friendly string.
 * @param str String to be made filename-friendly.
 * @returns `str` after being replaced, normalised, and camelCased.
 */

export const formatFileName = (str: string) => camelise(normalise(replaceFunction(str)));

/**
 * Counts occurrences of specified value within provided array.
 * @param arr Array to be checked.
 * @param val Value to be counted.
 * @returns Amount of items within `arr` equal to `val`.
 */

export const countInArray = (arr: any[], val: any) => arr.reduce((count, item) => count + (item === val), 0);

/**
 * Moves an item within an array to a new position.
 * @param arr Array to be manipulated.
 * @param old_index Current position of item to be moved.
 * @param new_index New position of item to be moved.
 * @returns `arr` with item moved.
 */

export const arrayMove = (arr: any[], old_index: number, new_index: number) => {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr;
};

/**
 * Converts JSX to RMWC icon object parameter.
 * @param jsx JSX of icon component.
 * @returns Object with `strategy` set to `"component"` and `icon` set to the value of `jsx`.
 */

export const iconObject = (jsx: React.ReactNode, config?: Omit<IconOptions, "icon">): IconPropT => {
  return {
    strategy: "component",
    icon: jsx,
    ...config,
  };
};

/**
 * Adds scroll-lock class to body, to prevent scrolling while modal is open.
 */

export const openModal = () => {
  const body = document.querySelector("body");
  if (body) {
    body.classList.add("scroll-lock");
  }
};

/**
 * Removes scroll-lock class from body, to allow scrolling once modal is closed.
 */

export const closeModal = () => {
  const body = document.querySelector("body");
  if (body) {
    body.classList.remove("scroll-lock");
  }
};

/**
 * Takes a function and returns two callbacks, calling it with boolean parameters.
 * @param func A function to be called with boolean parameters. Typically a `useState` set function.
 * @returns An array of callbacks, the first being `func(false)` and the second being `func(true)`.
 */

export const useBoolStates = (func: (bool: boolean) => void) => {
  const setFalse = () => {
    func(false);
  };
  const setTrue = () => {
    func(true);
  };
  return [setFalse, setTrue];
};

/**
 * Takes an array of set objects, and returns a month range of the specfied property, in the specified format (uses Luxon).
 * @param sets Array of set objects to be checked.
 * @param prop Property of set to be used.
 * @param format Luxon string to specify format. See {@link https://moment.github.io/luxon/docs/manual/formatting.html#table-of-tokens}.
 * @returns Array of months from earliest to latest, in specified format.
 */

export const getSetMonthRange = (sets: SetType[], prop: DateSortKeys, format: string) => {
  const setMonths = uniqueArray(
    sets.map((set) => {
      const val = set[prop];
      return val && !val.includes("Q") ? DateTime.fromISO(val).toFormat("yyyy-MM") : "";
    })
  ).filter(Boolean);
  setMonths.sort(function (a, b) {
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
 * Converts number of bytes to formatted string, e.g. `"2GB"`.
 * @param bytes Number to convert.
 * @param decimals Amount of decimal places to use.
 * @returns Formatted string, e.g. `"2GB"`.
 */

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

/**
 * Takes a number, and returns the ordinal
 * @param n Number
 * @returns "th", "rd", "nd" or "st"
 */

export const ordinal = (n: number) => {
  const th = "th";
  const rd = "rd";
  const nd = "nd";
  const st = "st";

  if (n === 11 || n === 12 || n === 13) return th;

  const lastDigit = n.toString().slice(-1);

  switch (lastDigit) {
    case "1":
      return st;
    case "2":
      return nd;
    case "3":
      return rd;
    default:
      return th;
  }
};

/**
 * Fetches and lists all top level storage folders.
 * @returns Array of all top level folder names.
 */

export const getStorageFolders = async () => {
  const topLevel = await storageRef.listAll();
  const folders = topLevel.prefixes.map((folderRef) => {
    return folderRef.fullPath;
  });
  return folders;
};

/**
 * Takes an array of storage file locations (e.g. `"/thumbs/katLich.png"`), and deletes each specified file, returning the promise from the operation.
 * @param array Array of storage file locations (e.g. `"/thumbs/katLich.png"`).
 * @returns Array of promises from deletion (uses `Promise.all()`).
 */

export const batchStorageDelete = (array: string[] = []) => {
  return Promise.all(
    array.map((path) => {
      const ref = storageRef.child(path);
      return ref
        .getMetadata()
        .then(() => {
          // file exists
          return ref.delete();
        })
        .catch((error) => {
          // file doesn't exist
          console.log(error);
          return Promise.resolve();
        });
    })
  );
};
