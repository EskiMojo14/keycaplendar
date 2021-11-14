import { createStore } from "~/app/store";
import {
  appendImages,
  selectCheckedImages,
  selectCurrentFolder,
  selectDetailImage,
  selectDetailMetadata,
  selectDuplicateSetImages,
  selectFolders,
  selectImages,
  selectLoading,
  selectSetImages,
  setCheckedImages,
  setCurrentFolder,
  setDetailImage,
  setDetailMetadata,
  setDuplicateSetImages,
  setFolders,
  setImages,
  setLoading,
  setSetImages,
} from "@s/images";
import { ImageType } from "@s/images/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const folder = "test";

const image: ImageType = {
  name: "",
  parent: "",
  fullPath: "",
  src: "",
};

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

it("sets folder array", () => {
  store.dispatch(setFolders([folder]));
  const response = selectFolders(store.getState());
  expect(response).toEqual([folder]);
});

it("sets image array", () => {
  store.dispatch(setImages([image]));
  const response = selectImages(store.getState());
  expect(response).toEqual([image]);
});

it("appends image array", () => {
  store.dispatch(setImages([image]));
  store.dispatch(appendImages([image]));
  const response = selectImages(store.getState());
  expect(response).toEqual([image, image]);
});

it("sets checked image array", () => {
  store.dispatch(setCheckedImages([image]));
  const response = selectCheckedImages(store.getState());
  expect(response).toEqual([image]);
});

it("sets set image array", () => {
  store.dispatch(setSetImages([folder]));
  const response = selectSetImages(store.getState());
  expect(response).toEqual([folder]);
});

it("sets duplicate set image array", () => {
  store.dispatch(setDuplicateSetImages([folder]));
  const response = selectDuplicateSetImages(store.getState());
  expect(response).toEqual([folder]);
});

it("sets detail image", () => {
  store.dispatch(setDetailImage(image));
  const response = selectDetailImage(store.getState());
  expect(response).toEqual(image);
});

it("sets detail metadata", () => {
  const metadata = { test: "test" };
  store.dispatch(setDetailMetadata({ test: "test" }));
  const response = selectDetailMetadata(store.getState());
  expect(response).toEqual(metadata);
});
