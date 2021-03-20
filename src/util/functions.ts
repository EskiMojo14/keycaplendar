import { replaceChars } from "./constants";
import firebase from "../firebase";
import React from "react";
import { SetType } from "./types";
import moment from "moment";

const storage = firebase.storage();

const storageRef = storage.ref();

export function hasKey<O>(obj: O, key: keyof any): key is keyof O {
  return key in obj;
}

export function hasOwnProperty<O, K extends PropertyKey>(obj: O, key: K): obj is O & Record<K, unknown> {
  return Object.prototype.hasOwnProperty.call(obj, key);
}

export function uniqueArray<T>(oldArray: T[]): T[] {
  return Array.from(new Set(oldArray));
}

export function addOrRemove<T>(oldArray: T[], value: T): T[] {
  const array: any[] = [...oldArray];
  const index: number = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }
  return array;
}

export const capitalise = (str: string) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

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

export const normalise = (str: string, includeSpace = true) => {
  const regex = includeSpace ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
  return str.normalize("NFD").replace(regex, "");
};

export const replaceFunction = (str: string) => {
  let val = str;
  replaceChars.forEach((set) => {
    val = val.replace(set[0], set[1]);
  });
  return val;
};

export const formatFileName = (str: string) => {
  return camelise(normalise(replaceFunction(str)));
};

export const countInArray = (arr: any[], val: any) => {
  return arr.reduce((count, item) => count + (item === val), 0);
};

export const arrayMove = (arr: any[], old_index: number, new_index: number) => {
  if (new_index >= arr.length) {
    let k = new_index - arr.length + 1;
    while (k--) {
      arr.push(undefined);
    }
  }
  arr.splice(new_index, 0, arr.splice(old_index, 1)[0]);
  return arr; // for testing
};

export const iconObject = (jsx: React.ReactNode) => {
  return {
    strategy: "component",
    icon: jsx,
  };
};

export const openModal = () => {
  const body = document.querySelector("body");
  if (body) {
    body.classList.add("scroll-lock");
  }
};

export const closeModal = () => {
  const body = document.querySelector("body");
  if (body) {
    body.classList.remove("scroll-lock");
  }
};

export const boolFunctions = (func: (bool: boolean) => void) => {
  const setFalse = () => {
    func(false);
  };
  const setTrue = () => {
    func(true);
  };
  return [setFalse, setTrue];
};

export const getSetMonthRange = (sets: SetType[], prop: keyof SetType, format: string) => {
  const setMonths = uniqueArray(
    sets.map((set) => {
      const val = set[prop];
      return val && typeof val === "string" && !val.includes("Q") ? moment(val).format("YYYY-MM") : "";
    })
  ).filter((month) => !!month);
  setMonths.sort(function (a, b) {
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

export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};

export const getStorageFolders = async () => {
  const topLevel = await storageRef.listAll();
  const folders = topLevel.prefixes.map((folderRef) => {
    return folderRef.fullPath;
  });
  return folders;
};

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
