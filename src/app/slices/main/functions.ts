import produce from "immer";
import debounce from "lodash.debounce";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { is } from "typescript-is";
import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import { selectPage } from "@s/common";
import { allPages, mainPages, pageTitle } from "@s/common/constants";
import { triggerTransition } from "@s/common/functions";
import firestore from "@s/firebase/firestore";
import type { UserId } from "@s/firebase/types";
import {
  selectBought,
  selectFavorites,
  selectHidden,
  selectUser,
  selectUserPresets,
  setUserPresets,
} from "@s/user";
import {
  alphabeticalSort,
  alphabeticalSortCurried,
  alphabeticalSortProp,
  alphabeticalSortPropCurried,
  arrayIncludes,
  hasKey,
  normalise,
  objectKeys,
  removeDuplicates,
  replaceFunction,
} from "@s/util/functions";
import {
  mergeWhitelist,
  selectAllRegions,
  selectAllSets,
  selectAppPresets,
  selectCurrentPreset,
  selectDefaultPreset,
  selectFilteredSets,
  selectInitialLoad,
  selectLinkedFavorites,
  selectSearch,
  selectSetGroups,
  selectSort,
  selectSortOrder,
  selectURLWhitelist,
  selectWhitelist,
  setAppPresets,
  setCurrentPreset,
  setDefaultPreset,
  setInitialLoad,
  setList,
  setLoading,
  setSearch as setMainSearch,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setSetGroups,
  setSetList,
  setURLWhitelist,
} from ".";
import {
  allSorts,
  arraySorts,
  dateSorts,
  pageSort,
  pageSortOrder,
  reverseSortDatePages,
  showAllPages,
  sortHiddenCheck,
  whitelistParams,
} from "./constants";
import { partialPreset } from "./constructors";
import type {
  OldPresetType,
  PresetType,
  SetGroup,
  SetType,
  SortOrderType,
  SortType,
  VendorType,
  WhitelistType,
} from "./types";

const { dispatch } = store;

/**
 * Tests whether a set would be shown on each page.
 * @param set Set to be tested.
 * @param favorites Array of set IDs which are favorited.
 * @param bought Array of set IDs which are bought.
 * @param hidden Array of set IDs which are hidden.
 * @returns Object with page keys, containing a boolean of if that set would be shown on the page.
 */

export const pageConditions = (
  set: SetType,
  favorites: string[],
  bought: string[],
  hidden: string[],
  state = store.getState()
): Record<typeof mainPages[number], boolean> => {
  const linkedFavorites = selectLinkedFavorites(state);

  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const startDate = DateTime.fromISO(set.gbLaunch, {
    zone: "utc",
  });
  const endDate = DateTime.fromISO(set.gbEnd).set({
    hour: 23,
    millisecond: 999,
    minute: 59,
    second: 59,
  });
  return {
    archive: true,
    bought: bought.includes(set.id),
    calendar:
      startDate > today ||
      (startDate <= today && (endDate >= yesterday || !set.gbEnd)),
    favorites:
      linkedFavorites.array.length > 0
        ? linkedFavorites.array.includes(set.id)
        : favorites.includes(set.id),
    hidden: hidden.includes(set.id),
    ic: !set.gbLaunch || set.gbLaunch.includes("Q"),
    live: startDate <= today && (endDate >= yesterday || !set.gbEnd),
    previous: !!(endDate && endDate <= yesterday),
    timeline: !!(set.gbLaunch && !set.gbLaunch.includes("Q")),
  };
};

export const getSetById = (id: string, state = store.getState()) => {
  const allSets = selectAllSets(state);
  const set = allSets.find((set) => set.id === id);
  return set ?? null;
};

const createGroups = (transition = false, state = store.getState()) => {
  const page = selectPage(state);
  const sort = selectSort(state);
  const sortOrder = selectSortOrder(state);
  const sets = selectFilteredSets(state);
  const createSetGroups = (sets: SetType[]): string[] => {
    if (arrayIncludes(dateSorts, sort)) {
      return sets
        .map((set) => {
          if (set[sort]) {
            const setDate = DateTime.fromISO(set[sort], {
              zone: "utc",
            });
            const setMonth = setDate.toFormat("MMMM yyyy");
            return setMonth;
          }
          return "";
        })
        .filter(Boolean);
    } else if (arrayIncludes(arraySorts, sort)) {
      return sets.map((set) => set[sort]).flat();
    } else if (sort === "vendor") {
      return sets
        .map((set) => set.vendors?.map((vendor) => vendor.name) ?? [])
        .flat();
    } else {
      return sets
        .map((set) => (hasKey(set, sort) ? `${set[sort]}` : ""))
        .filter(Boolean);
    }
  };
  const groups = removeDuplicates(createSetGroups(sets));

  groups.sort((a, b) => {
    if (arrayIncludes(dateSorts, sort)) {
      const aDate = DateTime.fromFormat(a, "MMMM yyyy", { zone: "utc" });
      const bDate = DateTime.fromFormat(b, "MMMM yyyy", { zone: "utc" });
      return alphabeticalSortCurried(sortOrder === "descending")(aDate, bDate);
    }
    return alphabeticalSortCurried()(a, b);
  });

  const filterSets = (sets: SetType[], group: string, sort: SortType) => {
    const filteredSets = sets.filter((set) => {
      if (hasKey(set, sort) || sort === "vendor") {
        if (arrayIncludes(dateSorts, sort)) {
          const { [sort]: val } = set;
          const setDate = DateTime.fromISO(val, { zone: "utc" });
          const setMonth = setDate.toFormat("MMMM yyyy");
          return setMonth && setMonth === group;
        } else if (sort === "vendor") {
          if (set.vendors) {
            return set.vendors.map((vendor) => vendor.name).includes(group);
          } else {
            return false;
          }
        } else if (sort === "designer") {
          return set.designer.includes(group);
        } else {
          return set[sort] === group;
        }
      } else {
        return false;
      }
    });
    const defaultSort = arrayIncludes(mainPages, page)
      ? pageSort[page]
      : "icDate";
    const defaultSortOrder = arrayIncludes(mainPages, page)
      ? pageSortOrder[page]
      : "descending";
    const dateSort = (
      a: SetType,
      b: SetType,
      prop = sort,
      order = sortOrder
    ) => {
      const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
      const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
      const nameSort = alphabeticalSortCurried()(aName, bName);
      if (arrayIncludes(dateSorts, prop)) {
        const { [prop]: aProp } = a;
        const aDate =
          aProp && !aProp.includes("Q")
            ? DateTime.fromISO(aProp, { zone: "utc" })
            : null;
        const { [prop]: bProp } = b;
        const bDate =
          bProp && !bProp.includes("Q")
            ? DateTime.fromISO(bProp, { zone: "utc" })
            : null;
        const returnVal = order === "ascending" ? 1 : -1;
        if (aDate && bDate) {
          if (aDate > bDate) {
            return returnVal;
          } else if (aDate < bDate) {
            return -returnVal;
          }
          return nameSort;
        }
        return nameSort;
      }
      return nameSort;
    };
    filteredSets.sort((a, b) => {
      const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
      const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
      const nameSort = alphabeticalSortCurried()(aName, bName);
      if (arrayIncludes(dateSorts, sort)) {
        if (sort === "gbLaunch" && (a.gbMonth || b.gbMonth)) {
          if (a.gbMonth && b.gbMonth) {
            return nameSort;
          } else {
            return a.gbMonth ? 1 : -1;
          }
        }
        return dateSort(a, b, sort, sortOrder);
      } else if (arrayIncludes(dateSorts, defaultSort)) {
        return dateSort(a, b, defaultSort, defaultSortOrder);
      }
      return nameSort;
    });
    return filteredSets;
  };

  const setGroups: SetGroup[] = groups.map((group) => ({
    sets: filterSets(sets, group, sort),
    title: group,
  }));

  dispatch(setSetGroups(setGroups));

  if (transition) {
    triggerTransition();
  }

  if (sortHiddenCheck[sort].includes(page)) {
    const allGroupedSets = removeDuplicates(
      setGroups.map((group) => group.sets.map((set) => set.id)).flat()
    );

    const diff = sets.length - allGroupedSets.length;

    if (diff > 0) {
      queue.notify({ title: `${diff} sets hidden due to sort setting.` });
    }
  }
};

export const filterData = (transition = false, state = store.getState()) => {
  const page = selectPage(state);
  const sets = selectAllSets(state);
  const search = selectSearch(state);
  const whitelist = selectWhitelist(state);
  const favorites = selectFavorites(state);
  const bought = selectBought(state);
  const hidden = selectHidden(state);
  const user = selectUser(state);
  const initialLoad = selectInitialLoad(state);

  if (initialLoad) {
    return;
  }

  // filter bool functions

  const hiddenBool = (set: SetType) => {
    if (
      showAllPages.includes(page) ||
      (whitelist.hidden === "all" && user.email)
    ) {
      return true;
    } else if (
      (whitelist.hidden === "hidden" && user.email) ||
      page === "hidden"
    ) {
      return hidden.includes(set.id);
    } else {
      return !hidden.includes(set.id);
    }
  };

  const pageBool = (set: SetType): boolean => {
    if (arrayIncludes(mainPages, page)) {
      return pageConditions(set, favorites, bought, hidden)[page];
    }
    return false;
  };

  const vendorBool = (set: SetType) => {
    if (set.vendors) {
      const included = set.vendors.some((vendor) =>
        whitelist.vendors.includes(vendor.name)
      );
      return whitelist.vendorMode === "exclude" ? !included : included;
    }
    return false;
  };

  const regionBool = (set: SetType) => {
    if (set.vendors) {
      return set.vendors.some((vendor) =>
        vendor.region
          .split(", ")
          .some((region) => whitelist.regions.includes(region))
      );
    }
    return false;
  };

  const filterBool = (set: SetType) => {
    const shippedBool =
      (whitelist.shipped.includes("Shipped") && set.shipped) ||
      (whitelist.shipped.includes("Not shipped") && !set.shipped);
    const favoritesBool = user.email
      ? !whitelist.favorites ||
        (whitelist.favorites && favorites.includes(set.id))
      : true;
    const boughtBool = user.email
      ? !whitelist.bought || (whitelist.bought && bought.includes(set.id))
      : true;
    if (set.vendors && set.vendors.length > 0) {
      return (
        vendorBool(set) &&
        regionBool(set) &&
        whitelist.profiles.includes(set.profile) &&
        shippedBool &&
        favoritesBool &&
        boughtBool
      );
    } else {
      if (
        (whitelist.vendors.length === 1 &&
          whitelist.vendorMode === "include") ||
        whitelist.regions.length === 1
      ) {
        return false;
      } else {
        return (
          whitelist.profiles.includes(set.profile) &&
          shippedBool &&
          favoritesBool &&
          boughtBool
        );
      }
    }
  };

  const searchBool = (set: SetType) => {
    const setInfo = [
      set.profile,
      set.colorway,
      normalise(replaceFunction(set.colorway)),
      set.designer.join(" "),
      set.vendors
        ? set.vendors.map((vendor) => ` ${vendor.name} ${vendor.region}`)
        : "",
    ];
    const bool = search
      .toLowerCase()
      .split(" ")
      .every((term) =>
        setInfo.join(" ").toLowerCase().includes(term.toLowerCase())
      );
    return search.length > 0 ? bool : true;
  };

  const filteredSets = sets.filter(
    (set) =>
      hiddenBool(set) && pageBool(set) && filterBool(set) && searchBool(set)
  );

  dispatch(setSetList("filteredSets", filteredSets));

  createGroups(transition);

  dispatch(setLoading(false));
};

const debouncedFilterData = debounce(filterData, 350, { trailing: true });

export const setWhitelistMerge = (
  partialWhitelist: Partial<WhitelistType>,
  clearUrl = true,
  state = store.getState()
) => {
  const allSets = selectAllSets(state);
  dispatch(mergeWhitelist(partialWhitelist));
  document.documentElement.scrollTop = 0;
  if (allSets.length > 0) {
    filterData();
  }
  if (clearUrl) {
    dispatch(setURLWhitelist({}));
    const params = new URLSearchParams(window.location.search);
    if (whitelistParams.some((param) => params.has(param))) {
      whitelistParams.forEach((param, index, array) => {
        if (params.has(param)) {
          params.delete(param);
        }
        if (index === array.length - 1) {
          if (params.has("page")) {
            const page = params.get("page");
            if (page && arrayIncludes(allPages, page)) {
              window.history.pushState(
                {
                  page,
                },
                `KeycapLendar: ${pageTitle[page]}`,
                `?${params}`
              );
            }
          } else {
            const questionParam = params.has("page") ? `?${params}` : "/";
            window.history.pushState({}, "KeycapLendar", questionParam);
          }
        }
      });
    }
  }
};

export const setWhitelist = <T extends keyof WhitelistType>(
  prop: T,
  val: WhitelistType[T],
  clearUrl = true,
  state = store.getState()
) => {
  const mainWhitelist = selectWhitelist(state);
  const allSets = selectAllSets(state);
  if (is<string[]>(mainWhitelist.edited)) {
    dispatch(mergeWhitelist({ [prop]: val }));
    document.documentElement.scrollTop = 0;
    if (allSets.length > 0) {
      filterData();
    }
  }
  if (clearUrl) {
    dispatch(setURLWhitelist({}));
    const params = new URLSearchParams(window.location.search);
    if (whitelistParams.some((param) => params.has(param))) {
      whitelistParams.forEach((param, index, array) => {
        if (params.has(param)) {
          params.delete(param);
        }
        if (index === array.length - 1) {
          if (params.has("page")) {
            const page = params.get("page");
            if (page && arrayIncludes(allPages, page)) {
              window.history.pushState(
                {
                  page,
                },
                `KeycapLendar: ${pageTitle[page]}`,
                `?${params}`
              );
            }
          } else {
            const questionParam = params.has("page") ? `?${params}` : "/";
            window.history.pushState({}, "KeycapLendar", questionParam);
          }
        }
      });
    }
  }
};

const generateLists = (state = store.getState()) => {
  const sets = selectAllSets(state);
  const currentPreset = selectCurrentPreset(state);
  const urlWhitelist = selectURLWhitelist(state);

  const allVendors = alphabeticalSort(
    removeDuplicates(
      sets.map((set) => set.vendors?.map((vendor) => vendor.name) ?? []).flat()
    )
  );

  const allVendorRegions = alphabeticalSort(
    removeDuplicates([
      ...sets
        .map((set) => set.vendors?.map((vendor) => vendor.region) ?? [])
        .flat(),
      ...sets
        .map(
          (set) => set.vendors?.map((vendor) => vendor.region.split(", ")) ?? []
        )
        .flat(2),
    ])
  );

  const allRegions = alphabeticalSort(
    removeDuplicates(
      sets
        .map((set) =>
          set.vendors
            ? set.vendors.map((vendor) => vendor.region.split(", "))
            : []
        )
        .flat(2)
    )
  );

  const allDesigners = alphabeticalSort(
    removeDuplicates(sets.map((set) => set.designer ?? []).flat())
  );

  const allProfiles = alphabeticalSort(
    removeDuplicates(sets.map((set) => set.profile))
  );

  // create default preset

  const defaultPreset = partialPreset({
    id: "default",
    name: "Default",
    whitelist: {
      profiles: allProfiles,
      regions: allRegions,
    },
  });

  dispatch(setDefaultPreset(defaultPreset));

  const lists = {
    allDesigners,
    allProfiles,
    allRegions,
    allVendorRegions,
    allVendors,
  } as const;

  objectKeys(lists).forEach((key) => {
    dispatch(setList(key, lists[key]));
  });

  const params = new URLSearchParams(window.location.search);
  const noUrlParams =
    !whitelistParams.some((param) => params.has(param)) &&
    Object.keys(urlWhitelist).length === 0;
  const urlParams = [
    ...whitelistParams.filter((param) => params.has(param)),
    ...Object.keys(urlWhitelist),
  ];
  if (!currentPreset.name && noUrlParams) {
    dispatch(setCurrentPreset(defaultPreset));
    setWhitelistMerge(defaultPreset.whitelist);
  } else if (!currentPreset.name && !noUrlParams) {
    dispatch(setCurrentPreset(defaultPreset));
    const partialWhitelist: Partial<WhitelistType> = {};
    const defaultParams = ["profiles", "regions"] as const;
    defaultParams.forEach((param) => {
      if (!urlParams.includes(param)) {
        const {
          whitelist: { [param]: defaultParam },
        } = defaultPreset;
        partialWhitelist[param] = defaultParam;
      }
    });
    setWhitelistMerge(partialWhitelist, false);
  }
};

export const getData = () => {
  dispatch(setLoading(true));
  firestore
    .collection("keysets")
    .get()
    .then((querySnapshot) => {
      const sets: SetType[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().profile) {
          const {
            gbLaunch: docGbLaunch,
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            latestEditor,
            ...data
          } = doc.data();

          const lastInMonth = docGbLaunch
            ? DateTime.fromISO(docGbLaunch).daysInMonth
            : 0;
          const gbLaunch =
            doc.data().gbMonth && docGbLaunch && !docGbLaunch.includes("Q")
              ? `${docGbLaunch}-${lastInMonth}`
              : docGbLaunch;

          sets.push({
            id: doc.id,
            ...data,
            gbLaunch,
          });
        }
      });

      alphabeticalSortProp(sets, "colorway");

      dispatch(setSetList("allSets", sets));
      dispatch(setInitialLoad(false));

      filterData(true);
      generateLists(store.getState());
    })
    .catch((error) => {
      console.log(`Error getting data: ${error}`);
      queue.notify({ title: `Error getting data: ${error}` });
      dispatch(setLoading(false));
      dispatch(setSetGroups([]));
    });
};

export const testSets = (state = store.getState()) => {
  const sets = selectAllSets(state);
  const testValue = (set: SetType, key: string, value?: string) => {
    if (value) {
      const endSpace = /\s+$/m;
      const startSpace = /^\s+/;
      const commaNoSpace = /,[^ ]/;
      const stringInvalid =
        endSpace.test(value) ||
        startSpace.test(value) ||
        commaNoSpace.test(value);
      if (stringInvalid) {
        console.log(
          `${set.profile} ${set.colorway} - ${key}: ${value
            .replace(endSpace, "<space>")
            .replace(startSpace, "<space>")}`
        );
      }
    }
  };
  sets.forEach((set) => {
    Object.keys(set).forEach((key) => {
      if (hasKey(set, key)) {
        const { [key]: value } = set;
        if (is<string>(value)) {
          testValue(set, key, value);
        } else if (is<any[]>(value)) {
          value.forEach((item: VendorType | string) => {
            if (is<string>(item)) {
              testValue(set, key, item);
            } else if (is<VendorType>(item)) {
              Object.keys(item).forEach((itemKey) => {
                if (hasKey(item, itemKey)) {
                  if (itemKey === "region") {
                    item[itemKey].split(", ").forEach((region) => {
                      if (!region) {
                        console.log(
                          `${set.profile} ${set.colorway}: ${item.name} <empty region>`
                        );
                      }
                      testValue(set, `${key} ${itemKey}`, region);
                    });
                  } else if (is<string>(item[itemKey])) {
                    testValue(set, `${key} ${itemKey}`, item[itemKey]);
                  }
                }
              });
            }
          });
        }
      }
    });
  });
};

const sortData = (state = store.getState()) => {
  const sort = selectSort(state);
  const sortOrder = selectSortOrder(state);
  const groups = selectSetGroups(state);
  const sortedGroups = produce(groups, (groupsDraft) => {
    groupsDraft.sort(({ title: a }, { title: b }) => {
      if (arrayIncludes(dateSorts, sort)) {
        const aDate = DateTime.fromFormat(a, "MMMM yyyy", { zone: "utc" });
        const bDate = DateTime.fromFormat(b, "MMMM yyyy", { zone: "utc" });
        return alphabeticalSortCurried(sortOrder === "descending")(
          aDate,
          bDate
        );
      }
      return alphabeticalSortCurried()(a, b);
    });
  });

  dispatch(setSetGroups(sortedGroups));
};

export const setSort = (
  sort: SortType,
  clearUrl = true,
  state = store.getState()
) => {
  const page = selectPage(state);
  document.documentElement.scrollTop = 0;
  let sortOrder: SortOrderType = "ascending";
  if (arrayIncludes(dateSorts, sort) && reverseSortDatePages.includes(page)) {
    sortOrder = "descending";
  }
  if (arrayIncludes(allSorts, sort)) {
    dispatch(setMainSort(sort));
    dispatch(setMainSortOrder(sortOrder));
    createGroups();
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sort")) {
      params.delete("sort");
      const questionParam = params.has("page") ? `?${params}` : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const setSortOrder = (sortOrder: SortOrderType, clearUrl = true) => {
  document.documentElement.scrollTop = 0;
  dispatch(setMainSortOrder(sortOrder));
  sortData(store.getState());
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sortOrder")) {
      params.delete("sortOrder");
      const questionParam = params.has("page") ? `?${params}` : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const setSearch = (query: string) => {
  dispatch(setMainSearch(query));
  document.documentElement.scrollTop = 0;
  debouncedFilterData();
};

export const updatePreset = (
  preset: OldPresetType | PresetType,
  state = store.getState()
): PresetType => {
  const allRegions = selectAllRegions(state);
  const regions =
    hasKey(preset.whitelist, "regions") &&
    is<string[]>(preset.whitelist.regions)
      ? preset.whitelist.regions
      : allRegions;
  const bought = hasKey(preset.whitelist, "bought")
    ? !!preset.whitelist.bought
    : false;
  const hidden = is<boolean>(preset.whitelist.hidden)
    ? preset.whitelist.hidden
      ? "hidden"
      : "unhidden"
    : preset.whitelist.hidden;
  const updatedPreset: PresetType = {
    ...preset,
    whitelist: { ...preset.whitelist, bought, hidden, regions },
  };
  return updatedPreset;
};

export const findPreset = (
  prop: keyof PresetType,
  val: string,
  state = store.getState()
): PresetType | undefined => {
  const appPresets = selectAppPresets(state);
  const userPresets = selectUserPresets(state);
  const allPresets = [...appPresets, ...userPresets];
  const index = allPresets.findIndex((preset) => preset[prop] === val);
  return allPresets[index];
};

export const selectPreset = (id: string, state = store.getState()) => {
  const defaultPreset = selectDefaultPreset(state);
  if (id === "default") {
    dispatch(setCurrentPreset(defaultPreset));
    setWhitelistMerge(defaultPreset.whitelist);
  } else {
    const preset = findPreset("id", id);
    if (preset) {
      dispatch(setCurrentPreset(preset));
      setWhitelistMerge(preset.whitelist);
    }
  }
};

export const syncPresets = (state = store.getState()) => {
  const presets = selectUserPresets(state);
  const user = selectUser(state);
  const sortedPresets = produce(presets, (presetsDraft) => {
    presetsDraft.sort(alphabeticalSortPropCurried("name", false, "Default"));
    return presetsDraft.map((preset) => ({ ...preset }));
  });
  firestore
    .collection("users")
    .doc(user.id as UserId)
    .set({ filterPresets: sortedPresets }, { merge: true })
    .catch((error) => {
      console.log(`Failed to sync presets: ${error}`);
      queue.notify({ title: `Failed to sync presets: ${error}` });
    });
};

export const newPreset = (preset: PresetType, state = store.getState()) => {
  const userPresets = selectUserPresets(state);
  preset.id = nanoid();
  const presets = [...userPresets, preset];
  alphabeticalSortProp(presets, "name", false);
  dispatch(setCurrentPreset(preset));
  dispatch(setUserPresets(presets));
  syncPresets(store.getState());
};

export const editPreset = (preset: PresetType, state = store.getState()) => {
  const userPresets = selectUserPresets(state);
  const savedPreset = findPreset("id", preset.id);
  let presets: PresetType[];
  if (savedPreset) {
    const index = userPresets.indexOf(savedPreset);
    presets = [...userPresets];
    presets[index] = preset;
  } else {
    presets = [...userPresets, preset];
  }
  alphabeticalSortProp(presets, "name", false);
  dispatch(setCurrentPreset(preset));
  dispatch(setUserPresets(presets));
  syncPresets(store.getState());
};

export const deletePreset = (preset: PresetType, state = store.getState()) => {
  const defaultPreset = selectDefaultPreset(state);
  const userPresets = selectUserPresets(state);
  const presets = userPresets.filter(
    (filterPreset) => filterPreset.id !== preset.id
  );
  alphabeticalSortProp(presets, "name", false);
  dispatch(setCurrentPreset(defaultPreset));
  dispatch(setUserPresets(presets));
  syncPresets(store.getState());
};

export const syncGlobalPresets = (state = store.getState()) => {
  const presets = selectAppPresets(state);
  const filteredPresets = presets.filter((preset) => preset.id !== "default");
  const sortedPresets = alphabeticalSortProp(
    filteredPresets,
    "name",
    false
  ).map((preset) => ({
    ...preset,
  }));
  firestore
    .collection("app")
    .doc("globals")
    .set({ filterPresets: sortedPresets }, { merge: true })
    .catch((error) => {
      console.log(`Failed to sync presets: ${error}`);
      queue.notify({ title: `Failed to sync presets: ${error}` });
    });
};

export const newGlobalPreset = (
  preset: PresetType,
  state = store.getState()
) => {
  const appPresets = selectAppPresets(state);
  preset.id = nanoid();
  const presets = [...appPresets, preset];
  alphabeticalSortProp(presets, "name", false, "Default");
  dispatch(setCurrentPreset(preset));
  dispatch(setAppPresets(presets));
  syncGlobalPresets(store.getState());
};

export const editGlobalPreset = (
  preset: PresetType,
  state = store.getState()
) => {
  const appPresets = selectAppPresets(state);
  const savedPreset = findPreset("id", preset.id);
  let presets: PresetType[];
  if (savedPreset) {
    const index = appPresets.indexOf(savedPreset);
    presets = [...appPresets];
    presets[index] = preset;
  } else {
    presets = [...appPresets, preset];
  }
  alphabeticalSortProp(presets, "name", false, "Default");
  dispatch(setCurrentPreset(preset));
  dispatch(setAppPresets(presets));
  syncGlobalPresets(store.getState());
};

export const deleteGlobalPreset = (
  preset: PresetType,
  state = store.getState()
) => {
  const appPresets = selectAppPresets(state);
  const defaultPreset = selectDefaultPreset(state);
  const presets = appPresets.filter(
    (filterPreset) => filterPreset.id !== preset.id
  );
  alphabeticalSortProp(presets, "name", false, "Default");
  dispatch(setCurrentPreset(defaultPreset));
  dispatch(setAppPresets(presets));
  syncGlobalPresets(store.getState());
};
