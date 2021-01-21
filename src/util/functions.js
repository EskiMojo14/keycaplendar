import { replaceChars } from "./constants";
import firebase from "../firebase";

const storage = firebase.storage();

const storageRef = storage.ref();

export const addOrRemove = (oldArray, value) => {
  const array = [...oldArray];
  const index = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }
  return array;
};

export const capitalise = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

export const camelise = (str, chr = " ") => {
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

export const normalise = (str, includeSpace = true) => {
  const regex = includeSpace ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
  return str.normalize("NFD").replace(regex, "");
};

export const replaceFunction = (string) => {
  let val = string;
  replaceChars.forEach((set) => {
    val = val.replace(set[0], set[1]);
  });
  return val;
};

export const formatFileName = (str) => {
  return camelise(normalise(replaceFunction(str)));
};

export const countInArray = (arr, val) => {
  return arr.reduce((count, item) => count + (item === val), 0);
};

export const iconObject = (jsx) => {
  return {
    strategy: "component",
    icon: jsx,
  };
};

export const openModal = () => {
  document.querySelector("body").classList.add("scroll-lock");
};

export const closeModal = () => {
  document.querySelector("body").classList.remove("scroll-lock");
};

export const boolFunctions = (func) => {
  const setFalse = () => {
    func(false);
  };
  const setTrue = () => {
    func(true);
  };
  return [setFalse, setTrue];
};

export const formatBytes = (bytes, decimals = 2) => {
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

export const batchStorageDelete = (array = []) => {
  return Promise.all(
    array.map((path) => {
      const ref = storageRef.child(path);
      return ref
        .getMetadata()
        .then((metadata) => {
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
