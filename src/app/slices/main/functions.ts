import { debounce } from "lodash";
import { DateTime } from "luxon";
import { nanoid } from "nanoid";
import { is } from "typescript-is";
import { queue } from "~/app/snackbarQueue";
import store from "~/app/store";
import { selectPage } from "@s/common/commonSlice";
import { allPages, mainPages, pageTitle } from "@s/common/constants";
import {
  alphabeticalSort,
  alphabeticalSortProp,
  arrayIncludes,
  hasKey,
  normalise,
  replaceFunction,
  uniqueArray,
} from "@s/common/functions";
import { typedFirestore } from "@s/firebase/firestore";
import { UserId } from "@s/firebase/types";
import { setStorage } from "@s/settings/functions";
import { selectBought, selectFavorites, selectHidden, selectUserPresets, setUserPresets } from "@s/user/userSlice";
import {
  allSorts,
  arraySorts,
  dateSorts,
  pageSort,
  pageSortOrder,
  reverseSortDatePages,
  sortHiddenCheck,
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
  setURLWhitelist,
  selectAllSets,
  selectSort,
  selectSortOrder,
  selectSearch,
  selectWhitelist,
  selectSetGroups,
  selectFilteredSets,
  selectAppPresets,
} from "./mainSlice";
import {
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
  hidden: string[]
): Record<typeof mainPages[number], boolean> => {
  const {
    main: { linkedFavorites },
  } = store.getState();

  const today = DateTime.utc();
  const yesterday = today.minus({ days: 1 });
  const startDate = DateTime.fromISO(set.gbLaunch, {
    zone: "utc",
  });
  const endDate = DateTime.fromISO(set.gbEnd).set({
    hour: 23,
    minute: 59,
    second: 59,
    millisecond: 999,
  });
  return {
    calendar: startDate > today || (startDate <= today && (endDate >= yesterday || !set.gbEnd)),
    live: startDate <= today && (endDate >= yesterday || !set.gbEnd),
    ic: !set.gbLaunch || set.gbLaunch.includes("Q"),
    previous: !!(endDate && endDate <= yesterday),
    timeline: !!(set.gbLaunch && !set.gbLaunch.includes("Q")),
    archive: true,
    favorites: linkedFavorites.array.length > 0 ? linkedFavorites.array.includes(set.id) : favorites.includes(set.id),
    bought: bought.includes(set.id),
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
  typedFirestore
    .collection("keysets")
    .get()
    .then((querySnapshot) => {
      const sets: SetType[] = [];
      querySnapshot.forEach((doc) => {
        if (doc.data().profile) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { gbLaunch: docGbLaunch, sales: docSales, latestEditor, ...data } = doc.data();

          const lastInMonth = docGbLaunch ? DateTime.fromISO(docGbLaunch).daysInMonth : 0;
          const gbLaunch = doc.data().gbMonth && docGbLaunch ? docGbLaunch + "-" + lastInMonth : docGbLaunch;
          const sales = is<string>(docSales) ? { img: docSales, thirdParty: false } : docSales;

          sets.push({
            id: doc.id,
            ...data,
            gbLaunch,
            sales,
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

export const testSets = (sets = selectAllSets(store.getState())) => {
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
        if (is<string>(value)) {
          testValue(set, key, value);
        } else if (is<any[]>(value)) {
          value.forEach((item: string | VendorType) => {
            if (is<string>(item)) {
              testValue(set, key, item);
            } else if (is<VendorType>(item)) {
              Object.keys(item).forEach((itemKey) => {
                if (hasKey(item, itemKey)) {
                  if (itemKey === "region") {
                    item[itemKey].split(", ").forEach((region) => {
                      if (!region) {
                        console.log(`${set.profile} ${set.colorway}: ${item.name} <empty region>`);
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

const generateLists = (sets = selectAllSets(store.getState())) => {
  const {
    main: { currentPreset, urlWhitelist },
  } = store.getState();

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
    ...new Whitelist(false, false, false, allProfiles, ["Shipped", "Not shipped"], allRegions, "exclude", []),
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

  const params = new URLSearchParams(window.location.search);
  const noUrlParams = !whitelistParams.some((param) => params.has(param)) && Object.keys(urlWhitelist).length === 0;
  const urlParams = [...whitelistParams.filter((param) => params.has(param)), ...Object.keys(urlWhitelist)];
  if (!currentPreset.name && noUrlParams) {
    dispatch(setCurrentPreset(defaultPreset));
    setWhitelistMerge(defaultPreset.whitelist);
  } else if (!currentPreset.name && !noUrlParams) {
    dispatch(setCurrentPreset(defaultPreset));
    const partialWhitelist: Partial<WhitelistType> = {};
    const defaultParams = ["profiles", "regions"] as const;
    defaultParams.forEach((param) => {
      if (!urlParams.includes(param)) {
        partialWhitelist[param] = defaultPreset.whitelist[param];
      }
    });
    setWhitelistMerge(partialWhitelist, false);
  }
};

export const filterData = (
  page = selectPage(store.getState()),
  sets = selectAllSets(store.getState()),
  sort = selectSort(store.getState()),
  sortOrder = selectSortOrder(store.getState()),
  search = selectSearch(store.getState()),
  whitelist = selectWhitelist(store.getState()),
  favorites = selectFavorites(store.getState()),
  bought = selectBought(store.getState()),
  hidden = selectHidden(store.getState())
) => {
  const {
    user: { user },
  } = store.getState();
  console.log(favorites);

  // filter bool functions

  const hiddenBool = (set: SetType) => {
    if (page === "favorites" || page === "bought") {
      return true;
    } else if ((whitelist.hidden && user.email) || page === "hidden") {
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
    const boughtBool = user.email ? !whitelist.bought || (whitelist.bought && bought.includes(set.id)) : true;
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
      if ((whitelist.vendors.length === 1 && whitelist.vendorMode === "include") || whitelist.regions.length === 1) {
        return false;
      } else {
        return whitelist.profiles.includes(set.profile) && shippedBool && favoritesBool && boughtBool;
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

const sortData = (
  sort = selectSort(store.getState()),
  sortOrder = selectSortOrder(store.getState()),
  groups = selectSetGroups(store.getState())
) => {
  const array = [...groups];
  array.sort((x, y) => {
    const a = x.title;
    const b = y.title;
    if (arrayIncludes(dateSorts, sort)) {
      const aDate = DateTime.fromFormat(a, "MMMM yyyy", { zone: "utc" });
      const bDate = DateTime.fromFormat(b, "MMMM yyyy", { zone: "utc" });
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
  page = selectPage(store.getState()),
  sort = selectSort(store.getState()),
  sortOrder = selectSortOrder(store.getState()),
  sets = selectFilteredSets(store.getState())
) => {
  const createGroups = (sets: SetType[]): string[] => {
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
      return sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat();
    } else {
      return sets.map((set) => (hasKey(set, sort) ? `${set[sort]}` : "")).filter(Boolean);
    }
  };
  const groups = uniqueArray(createGroups(sets));

  groups.sort((a, b) => {
    if (arrayIncludes(dateSorts, sort)) {
      const aDate = DateTime.fromFormat(a, "MMMM yyyy", { zone: "utc" });
      const bDate = DateTime.fromFormat(b, "MMMM yyyy", { zone: "utc" });
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
        if (arrayIncludes(dateSorts, sort)) {
          const val = set[sort];
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
      if (arrayIncludes(dateSorts, prop)) {
        const aProp = a[prop];
        const aDate = aProp && !aProp.includes("Q") ? DateTime.fromISO(aProp, { zone: "utc" }) : null;
        const bProp = b[prop];
        const bDate = bProp && !bProp.includes("Q") ? DateTime.fromISO(bProp, { zone: "utc" }) : null;
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
      if (arrayIncludes(dateSorts, sort)) {
        if (sort === "gbLaunch" && (a.gbMonth || b.gbMonth)) {
          if (a.gbMonth && b.gbMonth) {
            return alphabeticalSort(aName, bName);
          } else {
            return a.gbMonth ? 1 : -1;
          }
        }
        return dateSort(a, b, sort, sortOrder);
      } else if (arrayIncludes(dateSorts, defaultSort)) {
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

  if (sortHiddenCheck[sort].includes(page)) {
    const allGroupedSets = uniqueArray(setGroups.map((group) => group.sets.map((set) => set.id)).flat());

    const diff = sets.length - allGroupedSets.length;

    if (diff > 0) {
      queue.notify({ title: diff + " sets hidden due to sort setting." });
    }
  }
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
      return value && is<any[]>(value) && value.length > 0;
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
  if (is<string[]>(mainWhitelist.edited)) {
    const edited = uniqueArray([...(mainWhitelist.edited || []), prop]);
    const whitelist = { ...mainWhitelist, [prop]: val, edited: edited };
    dispatch(mergeWhitelist({ [prop]: val }));
    document.documentElement.scrollTop = 0;
    if (allSets.length > 0) {
      filterData(page, allSets, sort, sortOrder, search, whitelist);
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

export const updatePreset = (preset: OldPresetType | PresetType): PresetType => {
  const {
    main: { allRegions },
  } = store.getState();
  const regions =
    hasKey(preset.whitelist, "regions") && is<string[]>(preset.whitelist.regions)
      ? preset.whitelist.regions
      : allRegions;
  const bought = hasKey(preset.whitelist, "bought") ? !!preset.whitelist.bought : false;
  const updatedPreset: PresetType = { ...preset, whitelist: { ...preset.whitelist, regions, bought } };
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

export const syncPresets = (presets = selectUserPresets(store.getState())) => {
  const {
    user: { user },
  } = store.getState();
  const sortedPresets = alphabeticalSortProp([...presets], "name", false, "Default").map((preset) => ({
    ...preset,
  }));
  typedFirestore
    .collection("users")
    .doc(user.id as UserId)
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

export const syncGlobalPresets = (presets = selectAppPresets(store.getState())) => {
  const filteredPresets = presets.filter((preset) => preset.id !== "default");
  const sortedPresets = alphabeticalSortProp(filteredPresets, "name", false).map((preset) => ({
    ...preset,
  }));
  typedFirestore
    .collection("app")
    .doc("globals")
    .set({ filterPresets: sortedPresets }, { merge: true })
    .catch((error) => {
      console.log("Failed to sync presets: " + error);
      queue.notify({ title: "Failed to sync presets: " + error });
    });
};
