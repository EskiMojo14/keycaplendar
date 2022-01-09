import store from "~/app/store";
import { sortEntries } from "@s/updates";
import type { UpdateEntryType } from "@s/updates/types";

jest.mock("~/app/store");

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
  dispatchSpy = jest.spyOn(store, "dispatch");
});

afterAll(() => {
  dispatchSpy.mockRestore();
});

const blankEntry: UpdateEntryType = {
  body: "",
  date: "",
  id: "",
  name: "",
  pinned: false,
  title: "",
};

describe("sortEntries", () => {
  it("sorts given entries", () => {
    const response = [blankEntry, { ...blankEntry, pinned: true }].sort(
      sortEntries
    );
    const expected = [{ ...blankEntry, pinned: true }, blankEntry];
    expect(response).toEqual(expected);
  });
});
