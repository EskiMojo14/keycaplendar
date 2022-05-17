import { createStore } from "~/app/store";
import { selectFilteredTag, setFilteredTag } from "@s/guides";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const string = "tag";

it("sets filtered tag", () => {
  store.dispatch(setFilteredTag(string));
  const response = selectFilteredTag(store.getState());
  expect(response).toBe(string);
});
