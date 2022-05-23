import { createStore } from "~/app/store";
import { folderChange, selectCurrentFolder } from "@s/images";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const folder = "test";

it("sets current folder", () => {
  store.dispatch(folderChange(folder));
  const response = selectCurrentFolder(store.getState());
  expect(response).toBe(folder);
});
