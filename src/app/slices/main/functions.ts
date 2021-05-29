import { debounce } from "lodash";
import moment from "moment";
import { nanoid } from "nanoid";
import firebase from "../../../firebase";
import { queue } from "../../snackbarQueue";
import store from "../../store";
import { allPages, mainPages, pageTitle } from "../common/constants";
import {
  alphabeticalSort,
  alphabeticalSortProp,
  arrayIncludes,
  hasKey,
  normalise,
  replaceFunction,
  uniqueArray,
} from "../common/functions";
import { Page } from "../common/types";
import { setStorage } from "../settings/functions";
import { setUserPresets } from "../user/userSlice";
import {
  allSorts,
  arraySorts,
  dateSorts,
  pageSort,
  pageSortOrder,
  reverseSortDatePages,
  whitelistParams,
} from "./constants";
import { Preset, Whitelist } from "./constructors";
import {
  setContent,
  setCurrentPreset,
  setDefaultPreset,
  setList,
  setLoading,
  setSetGroups,
  setSetList,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setSearch as setMainSearch,
  mergeWhitelist,
  setAppPresets,
} from "./mainSlice";
import {
  ArraySortKeys,
  DateSortKeys,
  OldPresetType,
  PresetType,
  SetGroup,
  SetType,
  SortOrderType,
  SortType,
  VendorType,
  WhitelistType,
} from "./types";

const db = firebase.firestore();

const { dispatch } = store;

/**
 * Tests whether a set would be shown on each page.
 * @param set Set to be tested.
 * @param favorites Array of set IDs which are favourited.
 * @param hidden Array of set IDs which are hidden
 * @returns Object with page keys, containing a boolean of if that set would be shown on the page.
 */

export const pageConditions = (
  set: SetType,
  favorites: string[],
  hidden: string[]
): Record<typeof mainPages[number], boolean> => {
  const today = moment.utc();
  const yesterday = moment.utc().date(today.date() - 1);
  const startDate = moment.utc(set.gbLaunch, ["YYYY-MM-DD", "YYYY-MM"]);
  const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
  return {
    calendar: startDate > today || (startDate <= today && (endDate >= yesterday || !set.gbEnd)),
    live: startDate <= today && (endDate >= yesterday || !set.gbEnd),
    ic: !set.gbLaunch || set.gbLaunch.includes("Q"),
    previous: !!(endDate && endDate <= yesterday),
    timeline: !!(set.gbLaunch && !set.gbLaunch.includes("Q")),
    archive: true,
    favorites: favorites.includes(set.id),
    hidden: hidden.includes(set.id),
  };
};

export const getSetById = (id: string) => {
  const {
    main: { allSets },
  } = store.getState();
  const index = allSets.findIndex((set) => set.id === id);
  return index > -1 ? allSets[index] : null;
};

export const getData = () => {
  const {
    common: { page },
  } = store.getState();
  dispatch(setLoading(true));
  db.collection("keysets")
    .get()
    .then((querySnapshot) => {
      const sets: SetType[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().profile) {
          const lastOfMonth = moment(doc.data().gbLaunch, ["YYYY-MM-DD", "YYYY-MM"]).daysInMonth();
          const gbLaunch =
            doc.data().gbMonth && doc.data().gbLaunch ? doc.data().gbLaunch + "-" + lastOfMonth : doc.data().gbLaunch;
          const sales =
            typeof doc.data().sales === "string" ? { img: doc.data().sales, thirdParty: false } : doc.data().sales;
          sets.push({
            id: doc.id,
            profile: doc.data().profile,
            colorway: doc.data().colorway,
            designer: doc.data().designer,
            icDate: doc.data().icDate,
            details: doc.data().details,
            notes: doc.data().notes,
            sales: sales,
            image: doc.data().image,
            gbMonth: doc.data().gbMonth,
            gbLaunch: gbLaunch,
            gbEnd: doc.data().gbEnd,
            shipped: doc.data().shipped,
            vendors: doc.data().vendors,
          });
        }
      });

      alphabeticalSortProp(sets, "colorway");

      dispatch(setSetList({ name: "allSets", array: sets }));

      filterData(page, sets);
      generateLists(sets);
    })
    .catch((error) => {
      console.log("Error getting data: " + error);
      queue.notify({ title: "Error getting data: " + error });
      dispatch(setLoading(false));
      dispatch(setContent(false));
    });
};

export const testSets = (setsParam?: SetType[]) => {
  const {
    main: { allSets },
  } = store.getState();
  const sets = setsParam || allSets;

  const testValue = (set: SetType, key: string, value?: string) => {
    if (value) {
      const endSpace = /\s+$/m;
      const startSpace = /^\s+/;
      const commaNoSpace = /,[^ ]/;
      const stringInvalid = endSpace.test(value) || startSpace.test(value) || commaNoSpace.test(value);
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
        const value = set[key];
        if (typeof value === "string") {
          testValue(set, key, value);
        } else if (value instanceof Array) {
          value.forEach((item: string | VendorType) => {
            if (typeof item === "string") {
              testValue(set, key, item);
            } else if (typeof item === "object") {
              Object.keys(item).forEach((itemKey) => {
                if (hasKey(item, itemKey)) {
                  if (itemKey === "region") {
                    item[itemKey].split(", ").forEach((region) => {
                      if (!region) {
                        console.log(`${set.profile} ${set.colorway}: ${item.name} <empty region>`);
                      }
                      testValue(set, `${key} ${itemKey}`, region);
                    });
                  } else if (typeof item[itemKey] === "string") {
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

const generateLists = (setsParam?: SetType[]) => {
  const {
    main: { allSets, currentPreset },
  } = store.getState();
  const sets = setsParam || allSets;

  const allVendors = alphabeticalSort(
    uniqueArray(sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat())
  );

  const allVendorRegions = alphabeticalSort(
    uniqueArray([
      ...sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.region) : [])).flat(),
      ...sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.region.split(", ")) : [])).flat(2),
    ])
  );

  const allRegions = alphabeticalSort(
    uniqueArray(sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.region.split(", ")) : [])).flat(2))
  );

  const allDesigners = alphabeticalSort(uniqueArray(sets.map((set) => (set.designer ? set.designer : [])).flat()));

  const allProfiles = alphabeticalSort(uniqueArray(sets.map((set) => set.profile)));

  // create default preset

  const defaultWhitelist: WhitelistType = {
    ...new Whitelist(false, false, allProfiles, ["Shipped", "Not shipped"], allRegions, "exclude", []),
  };

  const defaultPreset: PresetType = { ...new Preset("Default", false, defaultWhitelist, "default") };

  dispatch(setDefaultPreset(defaultPreset));

  const lists = {
    allVendorRegions: allVendorRegions,
    allRegions: allRegions,
    allVendors: allVendors,
    allDesigners: allDesigners,
    allProfiles: allProfiles,
  } as const;

  Object.keys(lists).forEach((key) => {
    if (hasKey(lists, key)) {
      dispatch(setList({ name: key, array: lists[key] }));
    }
  });

  if (!currentPreset.name) {
    dispatch(setCurrentPreset(defaultPreset));
    setWhitelistMerge(defaultPreset.whitelist);
  }
};

export const filterData = (
  pageParam?: Page,
  setsParam?: SetType[],
  sortParam?: SortType,
  sortOrderParam?: SortOrderType,
  searchParam?: string,
  whitelistParam?: WhitelistType,
  favoritesParam?: string[],
  hiddenParam?: string[]
) => {
  const {
    common: { page: appPage },
    main: { allSets, sort: mainSort, sortOrder: mainSortOrder, search: mainSearch, whitelist: mainWhitelist },
    user: { user, favorites: userFavorites, hidden: userHidden },
  } = store.getState();

  const page = pageParam || appPage;
  const sets = setsParam || allSets;
  const sort = sortParam || mainSort;
  const sortOrder = sortOrderParam || mainSortOrder;
  const search = searchParam || mainSearch;
  const whitelist = whitelistParam || mainWhitelist;
  const favorites = favoritesParam || userFavorites;
  const hidden = hiddenParam || userHidden;

  // filter bool functions

  const hiddenBool = (set: SetType) => {
    if (page === "favorites") {
      return true;
    } else if ((whitelist.hidden && user.email) || page === "hidden") {
      return hidden.includes(set.id);
    } else {
      return !hidden.includes(set.id);
    }
  };

  const pageBool = (set: SetType): boolean => {
    if (arrayIncludes(mainPages, page)) {
      return pageConditions(set, favorites, hidden)[page];
    }
    return false;
  };

  const vendorBool = (set: SetType) => {
    if (set.vendors) {
      const included = set.vendors.some((vendor) => whitelist.vendors.includes(vendor.name));
      return whitelist.vendorMode === "exclude" ? !included : included;
    }
    return false;
  };

  const regionBool = (set: SetType) => {
    if (set.vendors) {
      return set.vendors.some((vendor) =>
        vendor.region.split(", ").some((region) => whitelist.regions.includes(region))
      );
    }
    return false;
  };

  const filterBool = (set: SetType) => {
    const shippedBool =
      (whitelist.shipped.includes("Shipped") && set.shipped) ||
      (whitelist.shipped.includes("Not shipped") && !set.shipped);
    const favoritesBool = user.email
      ? !whitelist.favorites || (whitelist.favorites && favorites.includes(set.id))
      : true;
    if (set.vendors && set.vendors.length > 0) {
      return (
        vendorBool(set) && regionBool(set) && whitelist.profiles.includes(set.profile) && shippedBool && favoritesBool
      );
    } else {
      if ((whitelist.vendors.length === 1 && whitelist.vendorMode === "include") || whitelist.regions.length === 1) {
        return false;
      } else {
        return whitelist.profiles.includes(set.profile) && shippedBool && favoritesBool;
      }
    }
  };

  const searchBool = (set: SetType) => {
    const setInfo = [
      set.profile,
      set.colorway,
      normalise(replaceFunction(set.colorway)),
      set.designer.join(" "),
      set.vendors ? set.vendors.map((vendor) => ` ${vendor.name} ${vendor.region}`) : "",
    ];
    const bool = search
      .toLowerCase()
      .split(" ")
      .every((term) => setInfo.join(" ").toLowerCase().includes(term.toLowerCase()));
    return search.length > 0 ? bool : true;
  };

  const filteredSets = sets.filter((set) => hiddenBool(set) && pageBool(set) && filterBool(set) && searchBool(set));

  createGroups(page, sort, sortOrder, filteredSets);

  dispatch(setSetList({ name: "filteredSets", array: filteredSets }));
  dispatch(setContent(filteredSets.length > 0));
  dispatch(setLoading(false));
};

const debouncedFilterData = debounce(filterData, 350, { trailing: true });

const sortData = (sortParam?: SortType, sortOrderParam?: SortOrderType, groupsParam?: SetGroup[]) => {
  const {
    main: { sort: mainSort, sortOrder: mainSortOrder, setGroups },
  } = store.getState();
  const sort = sortParam || mainSort;
  const sortOrder = sortOrderParam || mainSortOrder;
  const groups = groupsParam || setGroups;

  const array = [...groups];
  array.sort(function (x, y) {
    const a = x.title;
    const b = y.title;
    if (dateSorts.includes(sort)) {
      const aDate = moment.utc(a, "MMMM YYYY");
      const bDate = moment.utc(b, "MMMM YYYY");
      if (aDate < bDate) {
        return sortOrder === "ascending" ? -1 : 1;
      }
      if (aDate > bDate) {
        return sortOrder === "ascending" ? 1 : -1;
      }
    } else {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
      if (x < y) {
        return sortOrder === "ascending" ? -1 : 1;
      }
      if (x > y) {
        return sortOrder === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  dispatch(setSetGroups(array));
};

const createGroups = (
  pageParam?: Page,
  sortParam?: SortType,
  sortOrderParam?: SortOrderType,
  setsParam?: SetType[]
) => {
  const {
    common: { page: appPage },
    main: { sort: mainSort, sortOrder: mainSortOrder, filteredSets },
  } = store.getState();

  const page = pageParam || appPage;
  const sort = sortParam || mainSort;
  const sortOrder = sortOrderParam || mainSortOrder;
  const sets = setsParam || filteredSets;

  const createGroups = (sets: SetType[]): string[] => {
    if (dateSorts.includes(sort)) {
      return sets
        .map((set) => {
          const setDate = moment.utc(set[sort as DateSortKeys]);
          const setMonth = setDate.format("MMMM YYYY");
          return setMonth === "Invalid date" ? "" : setMonth;
        })
        .filter(Boolean);
    } else if (arraySorts.includes(sort)) {
      return sets.map((set) => set[sort as ArraySortKeys]).flat();
    } else if (sort === "vendor") {
      return sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat();
    } else {
      return sets.map((set) => (hasKey(set, sort) ? `${set[sort]}` : "")).filter(Boolean);
    }
  };
  const groups = uniqueArray(createGroups(sets));

  groups.sort(function (a, b) {
    if (dateSorts.includes(sort)) {
      const aDate = moment.utc(a, "MMMM YYYY");
      const bDate = moment.utc(b, "MMMM YYYY");
      if (aDate < bDate) {
        return sortOrder === "ascending" ? -1 : 1;
      }
      if (aDate > bDate) {
        return sortOrder === "ascending" ? 1 : -1;
      }
    } else {
      const x = a.toLowerCase();
      const y = b.toLowerCase();
      if (x < y) {
        return sortOrder === "ascending" ? -1 : 1;
      }
      if (x > y) {
        return sortOrder === "ascending" ? 1 : -1;
      }
    }
    return 0;
  });

  const filterSets = (sets: SetType[], group: string, sort: SortType) => {
    const filteredSets = sets.filter((set) => {
      if (hasKey(set, sort) || sort === "vendor") {
        if (dateSorts.includes(sort) && sort !== "vendor") {
          const val = set[sort];
          const setDate = typeof val === "string" ? moment.utc(val) : null;
          const setMonth = setDate ? setDate.format("MMMM YYYY") : null;
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
    const defaultSort = arrayIncludes(mainPages, page) ? pageSort[page] : "icDate";
    const defaultSortOrder = arrayIncludes(mainPages, page) ? pageSortOrder[page] : "descending";
    const alphabeticalSort = (a: string, b: string) => {
      if (a > b) {
        return 1;
      } else if (a < b) {
        return -1;
      }
      return 0;
    };
    const dateSort = (a: SetType, b: SetType, prop = sort, order = sortOrder) => {
      const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
      const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
      if (hasKey(a, prop) && hasKey(b, prop)) {
        const aProp = a[prop];
        const aDate = aProp && typeof aProp === "string" && !aProp.includes("Q") ? moment.utc(aProp) : null;
        const bProp = b[prop];
        const bDate = bProp && typeof bProp === "string" && !bProp.includes("Q") ? moment.utc(bProp) : null;
        const returnVal = order === "ascending" ? 1 : -1;
        if (aDate && bDate) {
          if (aDate > bDate) {
            return returnVal;
          } else if (aDate < bDate) {
            return -returnVal;
          }
          return alphabeticalSort(aName, bName);
        }
        return alphabeticalSort(aName, bName);
      }
      return alphabeticalSort(aName, bName);
    };
    filteredSets.sort((a, b) => {
      const aName = `${a.profile.toLowerCase()} ${a.colorway.toLowerCase()}`;
      const bName = `${b.profile.toLowerCase()} ${b.colorway.toLowerCase()}`;
      if (dateSorts.includes(sort)) {
        if (sort === "gbLaunch" && (a.gbMonth || b.gbMonth)) {
          if (a.gbMonth && b.gbMonth) {
            return alphabeticalSort(aName, bName);
          } else {
            return a.gbMonth ? 1 : -1;
          }
        }
        return dateSort(a, b, sort, sortOrder);
      } else if (dateSorts.includes(defaultSort)) {
        return dateSort(a, b, defaultSort, defaultSortOrder);
      }
      return alphabeticalSort(aName, bName);
    });
    return filteredSets;
  };

  const setGroups: SetGroup[] = groups.map((group) => {
    return {
      title: group,
      sets: filterSets(sets, group, sort),
    };
  });

  dispatch(setSetGroups(setGroups));
};

export const setSort = (sort: SortType, clearUrl = true) => {
  const {
    common: { page },
  } = store.getState();
  document.documentElement.scrollTop = 0;
  let sortOrder: SortOrderType = "ascending";
  if (arrayIncludes(dateSorts, sort) && reverseSortDatePages.includes(page)) {
    sortOrder = "descending";
  }
  if (arrayIncludes(allSorts, sort)) {
    dispatch(setMainSort(sort));
    dispatch(setMainSortOrder(sortOrder));
    createGroups(page, sort, sortOrder);
  }
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sort")) {
      params.delete("sort");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const setSortOrder = (sortOrder: SortOrderType, clearUrl = true) => {
  const {
    main: { sort },
  } = store.getState();
  document.documentElement.scrollTop = 0;
  dispatch(setMainSortOrder(sortOrder));
  sortData(sort, sortOrder);
  if (clearUrl) {
    const params = new URLSearchParams(window.location.search);
    if (params.has("sortOrder")) {
      params.delete("sortOrder");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  }
};

export const setSearch = (query: string) => {
  const {
    common: { page },
    main: { allSets, sort, sortOrder },
  } = store.getState();
  dispatch(setMainSearch(query));
  document.documentElement.scrollTop = 0;
  debouncedFilterData(page, allSets, sort, sortOrder, query);
};

export const setWhitelistMerge = (partialWhitelist: Partial<WhitelistType>, clearUrl = true) => {
  const {
    common: { page },
    main: { whitelist: mainWhitelist, sort, sortOrder, search, allSets },
  } = store.getState();
  const edited = Object.keys(partialWhitelist).filter((key) => {
    if (hasKey(partialWhitelist, key)) {
      const value = partialWhitelist[key];
      return value && value instanceof Array && value.length > 0;
    } else {
      return false;
    }
  });
  const whitelist = { ...mainWhitelist, ...partialWhitelist, edited: edited };
  dispatch(mergeWhitelist(partialWhitelist));
  document.documentElement.scrollTop = 0;
  if (allSets.length > 0) {
    filterData(page, allSets, sort, sortOrder, search, whitelist);
  }
  if (clearUrl) {
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
                  page: page,
                },
                "KeycapLendar: " + pageTitle[page],
                "?" + params.toString()
              );
            }
          } else {
            const questionParam = params.has("page") ? "?" + params.toString() : "/";
            window.history.pushState({}, "KeycapLendar", questionParam);
          }
        }
      });
    }
  }
};

export const setWhitelist = <T extends keyof WhitelistType>(prop: T, val: WhitelistType[T], clearUrl = true) => {
  const {
    common: { page },
    main: { whitelist: mainWhitelist, sort, sortOrder, search, allSets },
  } = store.getState();
  if (mainWhitelist.edited instanceof Array) {
    const edited = uniqueArray([...(mainWhitelist.edited || []), prop]);
    const whitelist = { ...mainWhitelist, [prop]: val, edited: edited };
    dispatch(mergeWhitelist({ [prop]: val }));
    document.documentElement.scrollTop = 0;
    if (allSets.length > 0) {
      filterData(page, allSets, sort, sortOrder, search, whitelist);
    }
  }
  if (clearUrl) {
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
                  page: page,
                },
                "KeycapLendar: " + pageTitle[page],
                "?" + params.toString()
              );
            }
          } else {
            const questionParam = params.has("page") ? "?" + params.toString() : "/";
            window.history.pushState({}, "KeycapLendar", questionParam);
          }
        }
      });
    }
  }
};

export const updatePreset = (preset: OldPresetType): PresetType => {
  const {
    main: { allRegions },
  } = store.getState();
  const regions =
    hasKey(preset.whitelist, "regions") && preset.whitelist.regions instanceof Array
      ? preset.whitelist.regions
      : allRegions;
  const updatedPreset: PresetType = { ...preset, whitelist: { ...preset.whitelist, regions: regions } };
  return updatedPreset;
};

export const findPreset = (prop: keyof PresetType, val: string): PresetType | undefined => {
  const {
    main: { appPresets },
    user: { userPresets },
  } = store.getState();
  const allPresets = [...appPresets, ...userPresets];
  const index = allPresets.findIndex((preset) => preset[prop] === val);
  return allPresets[index];
};

export const selectPreset = (id: string, write = true) => {
  const {
    main: { defaultPreset },
  } = store.getState();
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
  if (write) {
    setStorage("presetId", id);
  }
};

export const newPreset = (preset: PresetType) => {
  const {
    user: { userPresets },
  } = store.getState();
  preset.id = nanoid();
  const presets = [...userPresets, preset];
  alphabeticalSortProp(presets, "name", false);
  dispatch(setCurrentPreset(preset));
  dispatch(setUserPresets(presets));
  syncPresets(presets);
};

export const editPreset = (preset: PresetType) => {
  const {
    user: { userPresets },
  } = store.getState();
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
  syncPresets(presets);
};

export const deletePreset = (preset: PresetType) => {
  const {
    main: { defaultPreset },
    user: { userPresets },
  } = store.getState();
  const presets = userPresets.filter((filterPreset) => filterPreset.id !== preset.id);
  alphabeticalSortProp(presets, "name", false);
  dispatch(setCurrentPreset(defaultPreset));
  dispatch(setUserPresets(presets));
  syncPresets(presets);
};

export const syncPresets = (presetsParam: PresetType[]) => {
  const {
    user: { user, userPresets },
  } = store.getState();
  const presets = presetsParam || userPresets;
  const sortedPresets = alphabeticalSortProp([...presets], "name", false, "Default").map((preset) => ({
    ...preset,
  }));
  db.collection("users")
    .doc(user.id)
    .set({ filterPresets: sortedPresets }, { merge: true })
    .catch((error) => {
      console.log("Failed to sync presets: " + error);
      queue.notify({ title: "Failed to sync presets: " + error });
    });
};

export const newGlobalPreset = (preset: PresetType) => {
  const {
    main: { appPresets },
  } = store.getState();
  preset.id = nanoid();
  const presets = [...appPresets, preset];
  alphabeticalSortProp(presets, "name", false, "Default");
  dispatch(setCurrentPreset(preset));
  dispatch(setAppPresets(presets));
  syncGlobalPresets(presets);
};

export const editGlobalPreset = (preset: PresetType) => {
  const {
    main: { appPresets },
  } = store.getState();
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
  syncGlobalPresets(presets);
};

export const deleteGlobalPreset = (preset: PresetType) => {
  const {
    main: { appPresets, defaultPreset },
  } = store.getState();
  const presets = appPresets.filter((filterPreset) => filterPreset.id !== preset.id);
  alphabeticalSortProp(presets, "name", false, "Default");
  dispatch(setCurrentPreset(defaultPreset));
  dispatch(setAppPresets(presets));
  syncGlobalPresets(presets);
};

export const syncGlobalPresets = (presetsParam: PresetType[]) => {
  const {
    main: { appPresets },
  } = store.getState();
  const presets = presetsParam || appPresets;
  const filteredPresets = presets.filter((preset) => preset.id !== "default");
  const sortedPresets = alphabeticalSortProp(filteredPresets, "name", false).map((preset) => ({
    ...preset,
  }));
  db.collection("app")
    .doc("globals")
    .set({ filterPresets: sortedPresets }, { merge: true })
    .catch((error) => {
      console.log("Failed to sync presets: " + error);
      queue.notify({ title: "Failed to sync presets: " + error });
    });
};
