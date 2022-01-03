import produce from "immer";
import { createStore } from "~/app/store";
import { partialPreset } from "@s/main/constructors";
import {
  blankUser,
  selectBought,
  selectFavorites,
  selectFavoritesId,
  selectHidden,
  selectShareName,
  selectUser,
  selectUserPresets,
  setBought,
  setFavorites,
  setFavoritesId,
  setHidden,
  setShareName,
  setUser,
  setUserPresets,
} from "@s/user";
import type { CurrentUserType } from "@s/user/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const user: CurrentUserType = {
  avatar: "imgur",
  email: "me@test.com",
  id: "nice",
  isAdmin: false,
  isDesigner: true,
  isEditor: false,
  name: "me",
  nickname: "test",
};

const array = ["test"];

it("sets user", () => {
  store.dispatch(setUser(user));
  const response = selectUser(store.getState());
  expect(response).toEqual(user);
});

it("sets partial user", () => {
  const { email } = user;
  store.dispatch(setUser({ email }));
  const response = selectUser(store.getState());
  const expected = produce(blankUser, (draftUser) => {
    draftUser.email = email;
  });
  expect(response).toEqual(expected);
});

it("sets shareName", () => {
  const name = "me :)";
  store.dispatch(setShareName(name));
  const response = selectShareName(store.getState());
  expect(response).toBe(name);
});

it("sets user presets", () => {
  const presets = [partialPreset({ name: "hi" })];
  store.dispatch(setUserPresets(presets));
  const response = selectUserPresets(store.getState());
  expect(response).toEqual(presets);
});

it("sets favourites", () => {
  store.dispatch(setFavorites(array));
  const response = selectFavorites(store.getState());
  expect(response).toEqual(array);
});

it("sets favourites ID", () => {
  const id = "test";
  store.dispatch(setFavoritesId(id));
  const response = selectFavoritesId(store.getState());
  expect(response).toBe(id);
});

it("sets bought", () => {
  store.dispatch(setBought(array));
  const response = selectBought(store.getState());
  expect(response).toEqual(array);
});

it("sets hidden", () => {
  store.dispatch(setHidden(array));
  const response = selectHidden(store.getState());
  expect(response).toEqual(array);
});
