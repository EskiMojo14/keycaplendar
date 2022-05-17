import { createStore } from "~/app/store";
import {
  appendImages,
  selectCurrentFolder,
  selectImages,
  selectLoading,
  setCurrentFolder,
  setImages,
  setLoading,
} from "@s/images";
import { partialImage } from "@s/images/constructors";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const folder = "test";

const image = partialImage({ name: "hi" });
const image2 = partialImage({ name: "oh " });

it("sets loading state", () => {
  store.dispatch(setLoading(true));
  const response = selectLoading(store.getState());
  expect(response).toBe(true);
});

it("sets current folder", () => {
  store.dispatch(setCurrentFolder(folder));
  const response = selectCurrentFolder(store.getState());
  expect(response).toBe(folder);
});

it("sets image array", () => {
  store.dispatch(setImages([image]));
  const response = selectImages(store.getState());
  expect(response).toEqual([image]);
});

it("appends image array", () => {
  store.dispatch(setImages([image]));
  store.dispatch(appendImages([image2]));
  const response = selectImages(store.getState());
  expect(response).toEqual([image, image2]);
});
