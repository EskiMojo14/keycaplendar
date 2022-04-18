import { createStore } from "~/app/store";
import { selectPage, setAppPage } from "@s/common";
import type { Page } from "@s/common/types";

let store = createStore();

beforeEach(() => {
  store = createStore();
});

it("sets app page", () => {
  const page: Page = "calendar";
  store.dispatch(setAppPage(page));
  const response = selectPage(store.getState());
  expect(response).toBe(page);
});
