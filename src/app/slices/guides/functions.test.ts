import store from "~/app/store";
import { setAllTags, setEntries, setLoading } from "@s/guides";
import { sortEntries } from "@s/guides/functions";
import { GuideEntryType } from "@s/guides/types";

jest.mock("~/app/store");

let dispatchSpy = jest.spyOn(store, "dispatch");

beforeEach(() => {
  dispatchSpy = jest.spyOn(store, "dispatch");
});

afterAll(() => {
  dispatchSpy.mockRestore();
});

const exampleString = "test";

const blankEntry: GuideEntryType = {
  id: exampleString,
  name: exampleString,
  title: exampleString,
  description: exampleString,
  tags: [exampleString],
  body: exampleString,
  visibility: "all",
};

describe("sortEntries", () => {
  it("sorts given entries, and dispatches sorted entries and tags to state", () => {
    sortEntries([blankEntry]);
    expect(dispatchSpy).toHaveBeenNthCalledWith(1, setEntries([blankEntry]));
    expect(dispatchSpy).toHaveBeenNthCalledWith(2, setAllTags([exampleString]));
    expect(dispatchSpy).toHaveBeenNthCalledWith(3, setLoading(false));
  });
});