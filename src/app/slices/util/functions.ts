import type { ReactNode } from "react";
import type { IconOptions, IconPropT } from "@rmwc/types";
import { DateTime } from "luxon";
import { is } from "typescript-is";
import { replaceChars } from "@s/common/constants";
import firebase from "@s/firebase";
import type { DateSortKeys, SetType } from "@s/main/types";
import type { ObjectEntries, WritableKeys } from "./types";

const storage = firebase.storage();

const storageRef = storage.ref();

/**
 * Use within `.filter` to remove `undefined` and `null` types.
 */
/* eslint-disable no-use-before-define */
export const filterFalsey = Boolean as unknown as <T>(
  val: T
) => val is NonNullable<T>;
/* eslint-enable no-use-before-define */

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

export const arrayIncludes = <T>(
  arr: Readonly<T[]> | T[],
  item: any
): item is T => arr.includes(item);

/**
 * Checks every item of an array matches a condition, and asserts that the items are a specified type.
 * @param arr Array of items to be checked
 * @param callback Type predicate which takes each item and checks its type, returning `true` if the type matches.
 * @returns If all items meet the callback requirement.
 */

export const arrayEveryType = <T>(
  arr: any[],
  predicate: (item: any, index: number, array: any[]) => item is T
): arr is T[] => arr.every(predicate);

/** Merge objects and modify specified keys. */

export const mergeObjects = <T>(obj: T, ...objs: Partial<T>[]): T =>
  Object.assign({}, obj, ...objs);

/**
 * Returns an array of object keys to iterate on.
 *
 * Only use for objects you're certain won't gain more keys in runtime.
 */

export const objectKeys = <T extends Record<string, any>>(
  obj: T
): (keyof T)[] => Object.keys(obj);

/**
 * Returns an array of object entries to iterate on.
 *
 * Only use for objects you're certain won't gain more keys in runtime.
 */

export const objectEntries = <T extends Record<string, any>>(
  obj: T
): ObjectEntries<T> => Object.entries(obj);

/**
 * Creates an object from tuples. Use to assert a
 */

export const objectFromEntries = <T extends Record<string, any>>(
  entries: ObjectEntries<T>
): T => Object.fromEntries(entries) as T;

/**
 * Group objects by a specified key or accessor function result
 * @param arr Array of objects to group
 * @param accessor Key or function to provide value to use key
 * @param opts Further options to customise output.
 * @returns Object/map with values as keys and object arrays (unless specified) as value
 */

export const groupBy = <
  T extends Record<any, any>,
  Accessor extends keyof T | ((obj: T) => any),
  Val = T,
  UseMap extends boolean = false,
  UseArray extends boolean = true
>(
  arr: T[] | readonly T[],
  accessor: Accessor,
  {
    createVal = (obj) => obj,
    map = false as UseMap,
    array = true as UseArray,
  }: {
    /** Whether to use an array for each value. If set to false, later objects will overwrite previous ones. */
    array?: UseArray;
    /** Function that receives object and returns what the value should be */
    createVal?: (obj: T) => Val;
    /** Whether to use a Map instead of a plain object (allows object/array keys) */
    map?: UseMap;
  } = {}
): Accessor extends (obj: T) => infer Key
  ? UseMap extends true
    ? Map<Key, UseArray extends true ? Val[] : Val>
    : Key extends keyof any
    ? Record<Key, UseArray extends true ? Val[] : Val>
    : never
  : Accessor extends keyof T
  ? UseMap extends true
    ? Map<T[Accessor], UseArray extends true ? Val[] : Val>
    : T[Accessor] extends keyof any
    ? Record<T[Accessor], UseArray extends true ? Val[] : Val>
    : never
  : never =>
  arr.reduce(
    (acc: any, obj) => {
      const key =
        typeof accessor === "function" ? accessor(obj) : obj[accessor];
      const val = createVal(obj);
      if (map) {
        if (array) {
          if (acc.has(key)) {
            acc.get(key).push(val);
          } else {
            acc.set(key, [val]);
          }
        } else {
          acc.set(key, val);
        }
      } else {
        if (array) {
          acc[key] ??= [];
          acc[key].push(val);
        } else {
          acc[key] = val;
        }
      }
      return acc;
    },
    map ? new Map() : ({} as any)
  ) as any;

/**
 * Creates a copy of `obj` with keys sorted by `compareFn` (uses default if not provided)
 * @param obj
 * @param compareFn
 * @returns Sorted object
 */
export const sortObjectKeys = <O extends Record<any, any>>(
  obj: O,
  compareFn?: (a: keyof O, b: keyof O) => number
) =>
  objectKeys(obj)
    .sort(compareFn)
    .reduce<O>((acc: O, key) => {
      ({ [key]: acc[key] } = obj);
      return acc;
      // eslint-disable-next-line @typescript-eslint/prefer-reduce-type-parameter
    }, {} as O);

/**
 * Remove all duplicate values within an array.
 * @param array Array of values.
 * @returns `array` with only unique values.
 */

export const removeDuplicates = <T>(arr: T[]): T[] =>
  arr.filter((item, index) => arr.indexOf(item) === index);

/**
 * "Toggles" an element in an array. *MUTATES*
 * @param array Array of values.
 * @param value Value to be added or removed (if already in `array`).
 * @returns `array` with element added or removed.
 */

export const addOrRemove = <T>(array: T[], value: T): T[] => {
  const index: number = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }
  return array;
};

/**
 * Creates a function to pass to sort an array of items in alphabetical order.
 * @param descending Whether to sort the items in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of array.
 * @returns Function to pass `a` and `b` to.
 * @example <caption>Simple string sort</caption>
 * strArr.sort(alphabeticalSortCurried())
 * @example <caption>Simple string sort (descending)</caption>
 * strArr.sort(alphabeticalSortCurried(true))
 * @example <caption>Sorting by object key</caption>
 * objArr.sort((a, b) => alphabeticalSortCurried()(a.key, b.key))
 * @example <caption>Sorting by object key with fallback sort</caption>
 * objArr.sort((a, b) => alphabeticalSortCurried()(a.key, b.key) || alphabeticalSortCurried()(a.key2, b.key2))
 */

export const alphabeticalSortCurried =
  <T>(descending = false, hoist?: T) =>
  (a: T, b: T) => {
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
    if (is<string>(a) && is<string>(b)) {
      return descending ? b.localeCompare(a) : a.localeCompare(b);
    }
    return 0;
  };

/**
 * Sorts an array of strings in alphabetical order. *MUTATES*
 * @param array Array of strings to be sorted.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of array.
 * @returns `array` sorted alphabetically in ascending or descending order, with hoisted value at the beginning if provided.
 */

export const alphabeticalSort = (
  array: string[],
  descending = false,
  hoist?: string
) => array.sort(alphabeticalSortCurried(descending, hoist));

/**
 * Creates a function to pass to sort an array of objects by a specified prop, in alphabetical order.
 * @param prop Property to sort objects by.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of `array`.
 * @returns Function to pass `a` and `b` objects to.
 * @example <caption>Sorting by object key</caption>
 * arr.sort(alphabeticalSortProp("key"))
 * @example <caption>Sorting by object key with fallback sort</caption>
 * arr.sort((a,b) => alphabeticalSortProp("key")(a,b) || alphabeticalSortProp("key2")(a,b))
 */

export const alphabeticalSortPropCurried =
  <O extends Record<string, unknown>, K extends keyof O = keyof O>(
    prop: K,
    descending = false,
    hoist?: O[K]
  ) =>
  (a: O, b: O) =>
    alphabeticalSortCurried(descending, hoist)(a[prop], b[prop]);

/**
 * Sorts an array of objects by a specified prop, in alphabetical order. *MUTATES*
 * @param array Array of identical objects.
 * @param prop Property to sort objects by.
 * @param descending Whether to sort the `array` in descending order. Defaults to false.
 * @param hoist Value to be hoisted to beginning of `array`.
 * @returns `array` sorted by provided prop, with hoisted value at the beginning if provided.
 */

export const alphabeticalSortProp = <
  O extends Record<string, unknown>,
  K extends keyof O = keyof O
>(
  array: O[],
  prop: K,
  descending = false,
  hoist?: O[K]
) => array.sort(alphabeticalSortPropCurried(prop, descending, hoist));

/**
 * Truncates a string to a specified length.
 * @param str String to be truncated.
 * @param num Amount of characters to include.
 * @returns String truncated with ... at the end.
 */

export const truncate = (str: string, num: number) =>
  str.length <= num ? str : `${str.slice(0, num)}...`;

/**
 * Capitalise a string's first character.
 * @param str String to capitalise.
 * @returns `str` with first character capitalised.
 */

export const capitalise = (str: string) =>
  str.charAt(0).toUpperCase() + str.slice(1);

/**
 * Convert a string to camelCase.
 * @param str String to convert.
 * @param chr Character to separate `str` by. Defaults to a space character.
 * @returns `str` converted to camelCase.
 */

export const camelise = (str: string, chr = " ") =>
  str
    .split(chr)
    .map((word, index) => {
      if (index === 0) {
        return word.toLowerCase();
      } else {
        return capitalise(word.toLowerCase());
      }
    })
    .join("");

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
 * Uses `replaceChars` constant and replaces specified character with specified replacement.
 *
 * Used for exceptions such as `βeta` to `Beta`.
 * @param str String to be iterated upon.
 * @returns `str` with specified characters replaced.
 */

export const replaceFunction = (str: string) => {
  let val = str;
  replaceChars.forEach(([searchValue, replaceValue]) => {
    val = val.replace(searchValue, replaceValue);
  });
  return val;
};

/**
 * Combines multiple formatting functions to create a filename-friendly string.
 * @param str String to be made filename-friendly.
 * @returns `str` after being replaced, normalised, and camelCased.
 */

export const formatFileName = (str: string) =>
  camelise(normalise(replaceFunction(str)));

/**
 * Interweaves multiple arrays into a single array.
 * @param arrays Arrays to be combined
 * @returns An array with all items combined in alternating order.
 *
 * found https://stackoverflow.com/a/57748845
 */
export const braidArrays = <T>(...arrays: T[][]) => {
  const braided: T[] = [];
  const length = Math.max(...arrays.map((a) => a.length));
  for (let i = 0; i < length; i++) {
    arrays.forEach((array) => {
      if (array[i] !== undefined) braided.push(array[i]);
    });
  }
  return braided;
};

/**
 * Tagged template literal to pluralise based on a value
 *
 * Values are given as a tuplet `[number, single]` or optionally `[number, single, plural]`.
 *
 * Plural is `single` appended with `s` if not provided.
 * @example
 * pluralise`I have ${cows} ${[cows, "cow"]}, ${sheep} ${[sheep, "sheep", "sheep"]}, and ${geese} ${[geese, "goose", "geese"]}`
 */

export const pluralise = (
  strings: TemplateStringsArray,
  ...expressions: any[]
) => {
  const plurals = expressions.map((value) => {
    if (is<[number, string, string] | [number, string]>(value)) {
      const [val, single, plural] = value;
      return val === 1 ? single : plural ?? `${single}s`;
    }
    return value;
  });
  return braidArrays([...strings], plurals).join("");
};

/**
 * Counts occurrences of specified value within provided array.
 * @param arr Array to be checked.
 * @param val Value to be counted.
 * @returns Amount of items within `arr` equal to `val`.
 */

export const countInArray = <T>(arr: T[], val: T) =>
  arr.reduce((count, item) => count + Number(item === val), 0);

/**
 * Moves an item within an array to a new position. *MUTATES*
 * @param arr Array to be manipulated.
 * @param old_index Current position of item to be moved.
 * @param new_index New position of item to be moved.
 * @param fill What to fill empty spaces with if new index is larger than current array length (`undefined` by default)
 * @returns `arr` with item moved.
 */

export const arrayMove = <T>(
  arr: T[],
  old_index: number,
  new_index: number,
  fill = undefined as unknown as T
) => {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(fill);
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

export const iconObject = (
  jsx: ReactNode,
  config: Omit<IconOptions, "icon"> = {}
): IconPropT => ({
  icon: jsx,
  strategy: "component",
  ...config,
});

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
 * @returns An tuple of callbacks, the first being `func(false)` and the second being `func(true)`.
 */

export const useBoolStates = <T>(
  func: (bool: boolean) => T
): [setFalse: () => T, setTrue: () => T] => [
  () => func(false),
  () => func(true),
];

/**
 * Takes an array of set objects, and returns a month range of the specfied property, in the specified format (uses Luxon).
 * @param sets Array of set objects to be checked.
 * @param prop Property of set to be used.
 * @param format Luxon string to specify format. See {@link https://moment.github.io/luxon/#/formatting?id=table-of-tokens}.
 * @returns Array of months from earliest to latest, in specified format.
 */

export const getSetMonthRange = (
  sets: SetType[],
  prop: DateSortKeys,
  format: string
) => {
  const setMonths = removeDuplicates(
    sets.map(({ [prop]: val }) =>
      val && !val.includes("Q") ? DateTime.fromISO(val).toFormat("yyyy-MM") : ""
    )
  ).filter(Boolean);
  alphabeticalSort(setMonths);
  const monthDiff = (dateFrom: DateTime, dateTo: DateTime) =>
    dateTo.month - dateFrom.month + 12 * (dateTo.year - dateFrom.year);
  const length =
    monthDiff(
      DateTime.fromISO(setMonths[0], { zone: "utc" }),
      DateTime.fromISO(setMonths[setMonths.length - 1], { zone: "utc" })
    ) + 1;
  const allMonths = Array(length)
    .fill("")
    .map((v, i) =>
      DateTime.fromISO(setMonths[0], { zone: "utc" })
        .plus({ months: i })
        .toFormat(format)
    );
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

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

/**
 * Takes a number, and returns the ordinal
 * @param n Number
 * @returns "th", "rd", "nd" or "st"
 */

export const ordinal = (
  n: number,
  { nd = "nd", rd = "rd", st = "st", th = "th" } = {}
) => {
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
  const folders = topLevel.prefixes.map((folderRef) => folderRef.fullPath);
  return folders;
};

/**
 * Takes an array of storage file locations (e.g. `"/thumbs/katLich.png"`), and deletes each specified file, returning the promise from the operation.
 * @param array Array of storage file locations (e.g. `"/thumbs/katLich.png"`).
 * @returns Promise from deletions (uses `Promise.all()`).
 */

export const batchStorageDelete = (array: string[] = []) =>
  Promise.all(
    array.map(async (path) => {
      const ref = storageRef.child(path);
      try {
        await ref.getMetadata();
        // file exists
        await ref.delete();
      } catch (error) {
        // file doesn't exist
        console.log(error);
      }
    })
  );

/** Checks current locale and returns true if locale uses 24 hour time.
 * https://stackoverflow.com/a/60437579
 * @param [langCode] Language code.
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl#locale_identification_and_negotiation.
 * @returns If locale uses 24 hour time.
 */

export const localeUses24HourTime = (langCode?: string) =>
  !!(
    new Intl.DateTimeFormat(langCode, {
      hour: "numeric",
    })
      .formatToParts(new Date(2020, 0, 1, 13))
      .find((part) => part.type === "hour")?.value.length === 2
  );

/**
 * Generates a random integer between `min` and `max`
 * @param max Maximum value to return
 * @returns Random integer between `min` and `max`
 */
export const randomInt = (min = 0, max = 1) =>
  Math.round(Math.random() * (max - min)) + min;

/**
 * Creates a URL object with specified options (uses current URL as base if not provided), and provides searchParams to function to modify
 * @param opts keys in URL object to modify
 * @param paramsMod Function which receives URLSearchParams and modifies it
 * @returns URL object
 * @example
 * const url = createURL({ pathname: "/page" }, (params) => {
 *   params.set("search", "test")
 * });
 * console.log(url.href) // <current URL>/page?search=test<rest>
 */
export const createURL = (
  {
    href = window.location.href,
    ...opts
  }: Partial<Pick<URL, WritableKeys<URL>>> = {},
  paramsMod?: (params: URLSearchParams) => void
) => {
  const url = new URL(href);
  Object.assign(url, opts);
  paramsMod?.(url.searchParams);
  return url;
};

/**
 * Loops through URL search params and clears all keys that aren't in `except` whitelist
 * @param params URLSearchParams to modify
 * @param except Keys to keep
 * @example
 * const params = new URLSearchParams("foo=1&bar=2");
 * clearSearchParams(params, ["bar"]);
 * console.log(params.toString()) // "bar=2"
 */

export const clearSearchParams = (
  params: URLSearchParams,
  except: string[] = []
) => {
  params.forEach((_, name) => {
    if (!except.includes(name)) {
      params.delete(name);
    }
  });
};

/**
 * Creates a function that fills in any partial object with given defaults.
 * @param defaults
 * @returns fill func
 */
export const createFillFunc =
  <T extends Record<any, any>>(defaults: T) =>
  (partial: Partial<T> = {}): T => ({ ...defaults, ...partial });

/** Returns an error message if invalid, otherwise returns false. */

export const invalidDate = (
  date: string,
  {
    allowQuarter = false,
    disableFuture = false,
    month = false,
    required = false,
  } = {}
): string | false => {
  const { invalidExplanation: luxonExplanation } = DateTime.fromISO(date);
  if (allowQuarter && /^Q[1-4]{1} \d{4}$/.test(date)) {
    // allow Q1-4 YYYY if quarters are allowed.
    return false;
  } else if (required && !date) {
    return "Field is required.";
  } else if (disableFuture && date && date > DateTime.now().toISODate()) {
    return "Date is in the future";
  } else if (luxonExplanation && date) {
    return `${luxonExplanation}${
      allowQuarter ? " (and date isn't Q1-4 YYYY)" : ""
    }`;
  } else if (required && !(date.length === (month ? 7 : 10))) {
    // valid ISO but not the format we want
    return `Format: ${month ? "YYYY-MM" : "YYYY-MM-DD"}${
      allowQuarter ? " or Q1-4 YYYY" : ""
    }`;
  }
  return false;
};

/** Returns an error message if invalid, otherwise returns false. */

export const invalidTime = (
  date: string,
  { required = false } = {}
): string | false => {
  if (required && !date) {
    return "Field is required";
  } else if (date && date.length !== 5) {
    return "Format: HH:YY (24hr)";
  } else if (date.length === 5) {
    const [hours, minutes] = date.split(":");
    const valid =
      hours &&
      minutes &&
      parseInt(hours) >= 0 &&
      parseInt(hours) <= 23 &&
      parseInt(minutes) >= 0 &&
      parseInt(minutes) <= 59;
    return valid ? false : "Format: HH:YY (24hr)";
  }
  return false;
};

export const isBetweenTimes = (
  start: string,
  end: string,
  now = DateTime.now().toLocaleString(DateTime.TIME_24_SIMPLE)
) => {
  const startToday = DateTime.fromFormat(start, "HH:mm");
  const endToday = DateTime.fromFormat(end, "HH:mm");
  const timeNow = DateTime.fromFormat(now, "HH:mm");
  return startToday >= endToday // different day
    ? startToday <= timeNow || timeNow <= endToday
    : startToday <= timeNow && timeNow <= endToday;
};
