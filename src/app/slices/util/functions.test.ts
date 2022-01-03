import { partialSet } from "@s/main/constructors";
import {
  addOrRemove,
  alphabeticalSort,
  alphabeticalSortCurried,
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  arrayMove,
  getSetMonthRange,
  pluralise,
  removeDuplicates,
} from "@s/util/functions";

describe("removeDuplicates", () => {
  it("removes duplicates from an array", () => {
    expect(removeDuplicates(["test", "test", "test2"])).toEqual([
      "test",
      "test2",
    ]);
  });
});

describe("addOrRemove", () => {
  it("adds an item if it isn't in the given array", () => {
    expect(addOrRemove(["test"], "test2")).toEqual(["test", "test2"]);
  });
  it("removes the item if it's already in the array", () => {
    expect(addOrRemove(["item", "item2"], "item")).toEqual(["item2"]);
  });
});

describe("alphabeticalSort", () => {
  describe("alphabeticalSortCurried", () => {
    it("provides a sort function that sorts strings alphabetically", () => {
      expect(["a", "c", "b"].sort(alphabeticalSortCurried())).toEqual([
        "a",
        "b",
        "c",
      ]);
    });
    it("sorts in descending order if specified", () => {
      expect(["a", "c", "b"].sort(alphabeticalSortCurried(true))).toEqual([
        "c",
        "b",
        "a",
      ]);
    });
    it("hoists a specified value if provided", () => {
      expect(["a", "c", "b"].sort(alphabeticalSortCurried(false, "c"))).toEqual(
        ["c", "a", "b"]
      );
    });
  });
  describe("alphabeticalSort", () => {
    it("sorts strings alphabetically", () => {
      expect(alphabeticalSort(["a", "c", "b"])).toEqual(["a", "b", "c"]);
    });
    it("sorts in descending order if specified", () => {
      expect(alphabeticalSort(["a", "c", "b"], true)).toEqual(["c", "b", "a"]);
    });
    it("hoists a specified value if provided", () => {
      expect(["a", "c", "b"].sort(alphabeticalSortCurried(false, "c"))).toEqual(
        ["c", "a", "b"]
      );
    });
  });
  describe("alphabeticalSortPropCurried", () => {
    it("provides a sort function that sorts objects alphabetically by a specified property", () => {
      expect(
        [{ test: "a" }, { test: "c" }, { test: "b" }].sort(
          alphabeticalSortPropCurried("test")
        )
      ).toEqual([{ test: "a" }, { test: "b" }, { test: "c" }]);
    });
    it("sorts in descending order if specified", () => {
      expect(
        [{ test: "a" }, { test: "c" }, { test: "b" }].sort(
          alphabeticalSortPropCurried("test", true)
        )
      ).toEqual([{ test: "c" }, { test: "b" }, { test: "a" }]);
    });
    it("hoists a specified value if provided", () => {
      expect(
        [{ test: "a" }, { test: "c" }, { test: "b" }].sort(
          alphabeticalSortPropCurried("test", false, "c")
        )
      ).toEqual([{ test: "c" }, { test: "a" }, { test: "b" }]);
    });
  });
  describe("alphabeticalSortProp", () => {
    it("sorts objects alphabetically by a specified property", () => {
      expect(
        alphabeticalSortProp(
          [{ test: "a" }, { test: "c" }, { test: "b" }],
          "test"
        )
      ).toEqual([{ test: "a" }, { test: "b" }, { test: "c" }]);
    });
    it("sorts in descending order if specified", () => {
      expect(
        alphabeticalSortProp(
          [{ test: "a" }, { test: "c" }, { test: "b" }],
          "test",
          true
        )
      ).toEqual([{ test: "c" }, { test: "b" }, { test: "a" }]);
    });
    it("hoists a specified value if provided", () => {
      expect(
        alphabeticalSortProp(
          [{ test: "a" }, { test: "c" }, { test: "b" }],
          "test",
          false,
          "c"
        )
      ).toEqual([{ test: "c" }, { test: "a" }, { test: "b" }]);
    });
  });
});

describe("pluralise", () => {
  it("pluralises correctly, using custom plural if provided", () => {
    const farm = { cows: 2, geese: 4, pigs: 1 };
    const { cows, geese, pigs } = farm;
    expect(
      pluralise`I have ${cows} ${[cows, "cow"]}, ${pigs} ${[
        pigs,
        "pig",
      ]}, and ${geese} ${[geese, "goose", "geese"]}`
    ).toBe("I have 2 cows, 1 pig, and 4 geese");
  });
});

describe("arrayMove", () => {
  it("moves item at specified index to new index", () => {
    expect(arrayMove(["first", "second", "third"], 1, 2)).toEqual([
      "first",
      "third",
      "second",
    ]);
  });
});

describe("getSetMonthRange", () => {
  it("creates an array of months from sets provided, in specified format", () => {
    expect(
      getSetMonthRange(
        [partialSet({ icDate: "2021-01" }), partialSet({ icDate: "2021-03" })],
        "icDate",
        "yyyy-MM"
      )
    ).toEqual(["2021-01", "2021-02", "2021-03"]);
  });
});
