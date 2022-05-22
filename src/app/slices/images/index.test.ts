import { createStore } from "~/app/store";
import { selectCurrentFolder, setCurrentFolder } from "@s/images";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const folder = "test";

it("sets current folder", () => {
  store.dispatch(setCurrentFolder(folder));
  const response = selectCurrentFolder(store.getState());
  expect(response).toBe(folder);
});
