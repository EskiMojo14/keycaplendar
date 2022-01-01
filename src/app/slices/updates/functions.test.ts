import store from "~/app/store";
import { setEntries, setLoading } from "@s/updates";
import { sortEntries } from "@s/updates/functions";
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
  it("sorts given entries, and dispatches sorted entries to state", () => {
    sortEntries([blankEntry, { ...blankEntry, pinned: true }]);
    expect(dispatchSpy).toHaveBeenNthCalledWith(
      1,
      setEntries([{ ...blankEntry, pinned: true }, blankEntry])
    );
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, setLoading(false));
  });
});
