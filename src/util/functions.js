import bodyScroll from "body-scroll-toggle";

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
  if (window.scrollY > 0) {
    document.querySelector("body").classList.add("scrolled");
  }
  bodyScroll.disable();
};
export const closeModal = () => {
  setTimeout(() => {
    document.querySelector("body").classList.remove("scrolled");
  }, 20);
  bodyScroll.enable();
};
