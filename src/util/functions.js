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

export const countInArray = (arr, val) => {
  return arr.reduce((count, item) => count + (item === val), 0);
};

export const normalise = (str, includeSpace = true) => {
  const regex = includeSpace ? /[^a-zA-Z0-9 ]/g : /[^a-zA-Z0-9]/g;
  return str.normalize("NFD").replace(regex, "");
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
