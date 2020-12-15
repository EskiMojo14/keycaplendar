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
