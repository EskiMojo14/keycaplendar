import { createStore } from "~/app/store";
import { filterTag, selectFilteredTag } from "@s/guides";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

const string = "tag";

it("sets filtered tag", () => {
  store.dispatch(filterTag(string));
  const response = selectFilteredTag(store.getState());
  expect(response).toBe(string);
});
