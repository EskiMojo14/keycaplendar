import { partialSet } from "@s/main/constructors";
import {
  addOrRemove,
  alphabeticalSort,
  alphabeticalSortCurried,
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  arrayMove,
  getSetMonthRange,
  groupBy,
  isBetweenTimes,
  pluralise,
  removeDuplicates,
} from "@s/util/functions";

const keyset = partialSet({ colorway: "Lich", id: "test", profile: "KAT" });
const keyset2 = partialSet({
  colorway: "Phantom",
  id: "test2",
  profile: "GMK",
});

describe("groupBy", () => {
  it("groups objects by a specified property value", () => {
    expect(groupBy([keyset, keyset2], "profile")).toEqual({
      GMK: [keyset2],
      KAT: [keyset],
    });
  });
  it("allows an accessor function instead of key", () => {
    expect(
      groupBy(
        [keyset, keyset2],
        ({ colorway, profile }) => `${profile} ${colorway}`
      )
    ).toEqual({
      "GMK Phantom": [keyset2],
      "KAT Lich": [keyset],
    });
  });
  it("allows a value to create a custom value", () => {
    expect(
      groupBy([keyset, keyset2], "profile", { createVal: ({ id }) => id })
    ).toEqual({
      GMK: [keyset2.id],
      KAT: [keyset.id],
    });
  });

  it("groups objects by a specified property value (map)", () => {
    expect(groupBy([keyset, keyset2], "profile", { map: true })).toEqual(
      new Map([
        ["GMK", [keyset2]],
        ["KAT", [keyset]],
      ])
    );
  });
  it("allows an accessor function instead of key (map)", () => {
    expect(
      groupBy(
        [keyset, keyset2],
        ({ colorway, profile }) => `${profile} ${colorway}`,
        { map: true }
      )
    ).toEqual(
      new Map([
        ["GMK Phantom", [keyset2]],
        ["KAT Lich", [keyset]],
      ])
    );
  });
  it("allows a value to create a custom value (map)", () => {
    expect(
      groupBy([keyset, keyset2], "profile", {
        createVal: ({ id }) => id,
        map: true,
      })
    ).toEqual(
      new Map([
        ["GMK", [keyset2.id]],
        ["KAT", [keyset.id]],
      ])
    );
  });
});

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

describe("isBetweenTimes", () => {
  const testCases = [
    // different day
    {
      end: 6,
      inside: false,
      now: 12,
      start: 19,
    },
    {
      end: 6,
      inside: true,
      now: 3,
      start: 19,
    },
    {
      end: 6,
      inside: true,
      now: 22,
      start: 19,
    },
    // same day
    {
      end: 18,
      inside: true,
      now: 12,
      start: 7,
    },
    {
      end: 18,
      inside: false,
      now: 3,
      start: 7,
    },
    {
      end: 18,
      inside: false,
      now: 22,
      start: 7,
    },
  ];
  const numberToTime = (num: number) =>
    num >= 10 ? `${num}:00` : `0${num}:00`;
  testCases.forEach(({ end, inside, now, start }) => {
    it(`returns ${inside} for ${JSON.stringify({ end, now, start })}`, () => {
      expect(
        isBetweenTimes(
          numberToTime(start),
          numberToTime(end),
          numberToTime(now)
        )
      ).toBe(inside);
    });
  });
});
