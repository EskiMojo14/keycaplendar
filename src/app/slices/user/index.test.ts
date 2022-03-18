import produce from "immer";
import { createStore } from "~/app/store";
import { partialPreset } from "@s/main/constructors";
import {
  addUserPreset,
  blankCurrentUser,
  deleteUserPreset,
  selectAllUserPresets,
  selectBought,
  selectFavorites,
  selectFavoritesId,
  selectHidden,
  selectShareName,
  selectUser,
  selectUserPresetById,
  setBought,
  setFavorites,
  setFavoritesId,
  setHidden,
  setShareName,
  setUser,
  setUserPresets,
  upsertUserPreset,
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
  const expected = produce(blankCurrentUser, (draftUser) => {
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
  const response = selectAllUserPresets(store.getState());
  expect(response).toEqual(presets);
});

it("adds a user preset", () => {
  const newPreset = store.dispatch(
    addUserPreset(partialPreset({ name: "hi" }))
  );
  const response = selectUserPresetById(store.getState(), newPreset.id);
  expect(response).toEqual(newPreset);
});

it("upserts a user preset", () => {
  const newPreset = store.dispatch(
    addUserPreset(partialPreset({ name: "hi" }))
  );
  const editedPreset = produce(newPreset, (draft) => {
    draft.name = "bye";
  });
  store.dispatch(upsertUserPreset(editedPreset));
  const response = selectUserPresetById(store.getState(), newPreset.id);
  expect(response).toEqual(editedPreset);
});

it("deletes a user preset", () => {
  const newPreset = store.dispatch(
    addUserPreset(partialPreset({ name: "hi" }))
  );

  const check = selectUserPresetById(store.getState(), newPreset.id);
  expect(check).toEqual(newPreset);

  store.dispatch(deleteUserPreset(newPreset.id));

  const response = selectUserPresetById(store.getState(), newPreset.id);
  expect(response).toBeUndefined();
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
