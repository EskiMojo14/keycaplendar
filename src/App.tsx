import React, { useEffect } from "react";
import firebase from "./firebase";
import moment from "moment";
import { nanoid } from "nanoid";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import debounce from "lodash.debounce";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectDevice, selectPage, setAppPage, setDevice } from "./app/slices/common/commonSlice";
import { allPages, mainPages, pageTitle, urlPages } from "./app/slices/common/constants";
import {
  addOrRemove,
  alphabeticalSort,
  alphabeticalSortProp,
  arrayEveryType,
  arrayIncludes,
  hasKey,
  normalise,
  replaceFunction,
  uniqueArray,
} from "./app/slices/common/functions";
import { GlobalDoc, Page } from "./app/slices/common/types";
import {
  allSorts,
  arraySorts,
  dateSorts,
  pageSort,
  pageSortOrder,
  reverseSortDatePages,
  sortBlacklist,
  whitelistParams,
  whitelistShipped,
} from "./app/slices/main/constants";
import {
  mergeWhitelist,
  selectAllRegions,
  selectAllSets,
  selectAppPresets,
  selectCurrentPreset,
  selectDefaultPreset,
  selectFilteredSets,
  selectLoading,
  selectSearch,
  selectSetGroups,
  selectSort,
  selectSortOrder,
  selectTransition,
  selectWhitelist,
  setAppPresets,
  setContent,
  setCurrentPreset,
  setDefaultPreset,
  setList,
  setLoading,
  setSearch as setMainSearch,
  setSetGroups,
  setSetList,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setTransition,
} from "./app/slices/main/mainSlice";
import { Preset, Whitelist } from "./app/slices/main/constructors";
import { pageConditions } from "./app/slices/main/functions";
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
} from "./app/slices/main/types";
import {
  selectUser,
  setUser,
  selectUserPresets,
  setUserPresets,
  selectFavorites,
  setFavorites,
  selectHidden,
  setHidden,
} from "./app/slices/user/userSlice";
import { UserPreferencesDoc } from "./app/slices/user/types";
import { selectCookies, selectSettings } from "./app/slices/settings/settingsSlice";
import {
  checkStorage,
  setStorage,
  setSyncSettings,
  getStorage,
  acceptCookies,
  clearCookies,
  settingFns,
  checkTheme,
} from "./app/slices/settings/functions";
import { statsTabs } from "./app/slices/statistics/constants";
import { setStatisticsTab } from "./app/slices/statistics/functions";
import { UserContext } from "./app/slices/user/contexts";
import { queue } from "./app/snackbarQueue";
import { SnackbarQueue } from "@rmwc/snackbar";
import { Content } from "./components/Content";
import { Login } from "./components/pages/Login";
import { NotFound } from "./components/pages/NotFound";
import { EntryGuide } from "./components/pages/guides/EntryGuide";
import { PrivacyPolicy } from "./components/pages/legal/Privacy";
import { TermsOfService } from "./components/pages/legal/Terms";
import { SnackbarCookies } from "./components/common/SnackbarCookies";
import "./App.scss";

const db = firebase.firestore();

export const App = () => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);
  const appPage = useAppSelector(selectPage);

  const settings = useAppSelector(selectSettings);
  const cookies = useAppSelector(selectCookies);

  const user = useAppSelector(selectUser);
  const userPresets = useAppSelector(selectUserPresets);
  const userFavorites = useAppSelector(selectFavorites);
  const userHidden = useAppSelector(selectHidden);

  const transition = useAppSelector(selectTransition);
  const loading = useAppSelector(selectLoading);

  const mainSort = useAppSelector(selectSort);
  const mainSortOrder = useAppSelector(selectSortOrder);

  const allRegions = useAppSelector(selectAllRegions);

  const allSets = useAppSelector(selectAllSets);
  const filteredSets = useAppSelector(selectFilteredSets);
  const setGroups = useAppSelector(selectSetGroups);

  const mainSearch = useAppSelector(selectSearch);
  const mainWhitelist = useAppSelector(selectWhitelist);
  const currentPreset = useAppSelector(selectCurrentPreset);
  const defaultPreset = useAppSelector(selectDefaultPreset);
  const appPresets = useAppSelector(selectAppPresets);

  const getURLQuery = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) {
      const pageQuery = params.get("page");
      if (
        arrayIncludes(urlPages, pageQuery) ||
        (arrayIncludes(allPages, pageQuery) && process.env.NODE_ENV === "development")
      ) {
        if (arrayIncludes(mainPages, pageQuery)) {
          if (pageQuery === "calendar") {
            dispatch(setAppPage(pageQuery));
            dispatch(setMainSort(pageSort[pageQuery]));
            dispatch(setMainSortOrder(pageSortOrder[pageQuery]));
          } else {
            const sortQuery = params.get("sort");
            const sortOrderQuery = params.get("sortOrder");
            dispatch(setAppPage(pageQuery));
            dispatch(
              setMainSort(
                arrayIncludes(allSorts, sortQuery) && !arrayIncludes(sortBlacklist[sortQuery], pageQuery)
                  ? sortQuery
                  : pageSort[pageQuery]
              )
            );
            dispatch(
              setMainSortOrder(
                sortOrderQuery && (sortOrderQuery === "ascending" || sortOrderQuery === "descending")
                  ? sortOrderQuery
                  : pageSortOrder[pageQuery]
              )
            );
          }
        } else {
          dispatch(setAppPage(pageQuery));
        }
      }
    } else {
      dispatch(setAppPage("calendar"));
    }
    const whitelistObj: WhitelistType = { ...mainWhitelist };
    whitelistParams.forEach((param, index, array) => {
      if (params.has(param)) {
        const val = params.get(param);
        if (val) {
          if (param === "profile" || param === "region" || param === "vendor") {
            const plural = `${param}s`;
            if (hasKey(whitelistObj, plural)) {
              whitelistObj[plural] = [val.replace("-", " ")] as never;
            }
          } else if (param === "profiles" || param === "shipped" || param === "vendors" || param === "regions") {
            const array = val.split(" ").map((item) => item.replace("-", " "));
            if (param === "shipped") {
              if (
                arrayEveryType<typeof whitelistShipped[number]>(array, (item) => arrayIncludes(whitelistShipped, item))
              ) {
                whitelistObj[param] = array;
              }
            } else {
              whitelistObj[param] = array;
            }
          } else if (param === "vendorMode" && (val === "include" || val === "exclude")) {
            whitelistObj[param] = val;
          }
        }
      }
      if (index === array.length - 1) {
        setWhitelistMerge(whitelistObj, false);
      }
    });
    if (params.has("statisticsTab")) {
      const urlTab = params.get("statisticsTab");
      if (urlTab && arrayIncludes(statsTabs, urlTab)) {
        setStatisticsTab(urlTab);
      }
    }
    getData();
  };

  const setPage = (page: Page) => {
    if (page !== appPage && !loading && arrayIncludes(allPages, page)) {
      dispatch(setTransition(true));
      setTimeout(() => {
        if (arrayIncludes(mainPages, page)) {
          filterData(page, allSets, pageSort[page], pageSortOrder[page]);
          dispatch(setAppPage(page));
          dispatch(setMainSort(pageSort[page]));
          dispatch(setMainSortOrder(pageSortOrder[page]));
        } else {
          dispatch(setAppPage(page));
        }
        dispatch(setMainSearch(""));
        document.documentElement.scrollTop = 0;
      }, 90);
      setTimeout(() => {
        dispatch(setTransition(true));
      }, 300);
      document.title = "KeycapLendar: " + pageTitle[page];
      const params = new URLSearchParams(window.location.search);
      params.set("page", page);
      window.history.pushState(
        {
          page: page,
        },
        "KeycapLendar: " + pageTitle[page],
        "?" + params.toString()
      );
    }
  };

  const getData = () => {
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

        filterData(appPage, sets);
        generateLists(sets);
      })
      .catch((error) => {
        console.log("Error getting data: " + error);
        queue.notify({ title: "Error getting data: " + error });
        dispatch(setLoading(false));
        dispatch(setContent(false));
      });
  };

  const testSets = (sets = allSets) => {
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

  const generateLists = (sets = allSets) => {
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
      uniqueArray(
        sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.region.split(", ")) : [])).flat(2)
      )
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
      setWhitelistMerge({ profiles: allProfiles, regions: allRegions });
    }
  };

  const filterData = (
    page = appPage,
    sets = allSets,
    sort = mainSort,
    sortOrder = mainSortOrder,
    search = mainSearch,
    whitelist = mainWhitelist,
    favorites = userFavorites,
    hidden = userHidden
  ) => {
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
    dispatch(setContent(true));
    dispatch(setLoading(false));
  };

  const debouncedFilterData = debounce(filterData, 350, { trailing: true });

  const sortData = (sort = mainSort, sortOrder = mainSortOrder, groups = setGroups) => {
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

  const createGroups = (page = appPage, sort = mainSort, sortOrder = mainSortOrder, sets = filteredSets) => {
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

  const setSort = (sort: SortType, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    let sortOrder: SortOrderType = "ascending";
    if (arrayIncludes(dateSorts, sort) && reverseSortDatePages.includes(appPage)) {
      sortOrder = "descending";
    }
    if (arrayIncludes(allSorts, sort)) {
      dispatch(setMainSort(sort));
      dispatch(setMainSortOrder(sortOrder));
      createGroups(appPage, sort, sortOrder);
    }
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("sort");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  const setSortOrder = (sortOrder: SortOrderType, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    dispatch(setMainSortOrder(sortOrder));
    sortData(mainSort, sortOrder);
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("sortOrder");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  const setSearch = (query: string) => {
    dispatch(setMainSearch(query));
    document.documentElement.scrollTop = 0;
    debouncedFilterData(appPage, allSets, mainSort, mainSortOrder, query);
  };
  const setWhitelistMerge = (partialWhitelist: Partial<WhitelistType>, clearUrl = true) => {
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
      filterData(appPage, allSets, mainSort, mainSortOrder, mainSearch, whitelist);
    }
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
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
  };
  const setWhitelist = <T extends keyof WhitelistType>(prop: T, val: WhitelistType[T], clearUrl = true) => {
    if (mainWhitelist.edited instanceof Array) {
      const edited = uniqueArray([...(mainWhitelist.edited || []), prop]);
      const whitelist = { ...mainWhitelist, [prop]: val, edited: edited };
      dispatch(mergeWhitelist({ [prop]: val }));
      document.documentElement.scrollTop = 0;
      if (allSets.length > 0) {
        filterData(appPage, allSets, mainSort, mainSortOrder, mainSearch, whitelist);
      }
    }
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
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
  };
  const checkDevice = () => {
    let i = 0;
    let lastWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    let lastDevice = "tablet";
    const calculate = () => {
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (vw !== lastWidth || i === 0) {
        if (vw >= 840) {
          if (lastDevice !== "desktop") {
            dispatch(setDevice("desktop"));
            lastDevice = "desktop";
          }
        } else if (vw < 840 && vw >= 480) {
          if (lastDevice !== "tablet") {
            dispatch(setDevice("tablet"));
            lastDevice = "tablet";
          }
        } else {
          if (lastDevice !== "mobile") {
            dispatch(setDevice("mobile"));
            lastDevice = "mobile";
          }
        }
        lastWidth = vw;
        i++;
      }
    };
    calculate();
    window.addEventListener("resize", calculate);
  };
  const getGlobals = () => {
    db.collection("app")
      .doc("globals")
      .get()
      .then((doc) => {
        const data = doc.data();
        const { filterPresets } = data as GlobalDoc;
        if (filterPresets) {
          const updatedPresets = filterPresets.map((preset) => updatePreset(preset));
          if (defaultPreset) {
            dispatch(setCurrentPreset(defaultPreset));
            dispatch(setAppPresets(updatedPresets));
          }
        }
      })
      .catch((error) => {
        console.log("Failed to get global settings: " + error);
        queue.notify({ title: "Failed to get global settings: " + error });
      });
  };
  const getUserPreferences = (id: string) => {
    if (id) {
      db.collection("users")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            const {
              favorites,
              hidden,
              settings: settingsPrefs,
              syncSettings,
              filterPresets,
            } = data as UserPreferencesDoc;

            if (favorites instanceof Array) {
              dispatch(setFavorites(favorites));
            }
            if (hidden instanceof Array) {
              dispatch(setHidden(hidden));
            }

            if (filterPresets) {
              const updatedPresets = filterPresets.map((preset) => updatePreset(preset));
              dispatch(setUserPresets(updatedPresets));
              const storedPreset = getStorage("presetId");
              const params = new URLSearchParams(window.location.search);
              const noUrlParams = !whitelistParams.some((param) => params.has(param));
              if (storedPreset && storedPreset !== "default" && noUrlParams) {
                selectPreset(storedPreset, false);
              }
            }

            if (typeof syncSettings === "boolean") {
              if (syncSettings !== settings.syncSettings) {
                setSyncSettings(syncSettings, false);
              }
              if (syncSettings) {
                const getSetting = (setting: string, setFunction: (val: any, write: boolean) => void) => {
                  if (settingsPrefs && hasKey(settingsPrefs, setting)) {
                    if (settingsPrefs[setting] !== settings[setting]) {
                      setFunction(settingsPrefs[setting], false);
                    }
                  }
                };
                Object.keys(settingFns).forEach((setting) => {
                  if (hasKey(settingFns, setting)) {
                    const func = settingFns[setting];
                    getSetting(setting, func);
                  }
                });
              }
            }

            filterData(appPage, allSets, mainSort, mainSortOrder, mainSearch, mainWhitelist, favorites, hidden);
          }
        })
        .catch((error) => {
          console.log("Failed to get user preferences: " + error);
          queue.notify({ title: "Failed to get user preferences: " + error });
        });
    }
  };
  const toggleFavorite = (id: string) => {
    const favorites = addOrRemove([...userFavorites], id);
    dispatch(setFavorites(favorites));
    if (appPage === "favorites") {
      filterData(appPage, allSets, mainSort, mainSortOrder, mainSearch, mainWhitelist, favorites);
    }
    if (user.id) {
      db.collection("users")
        .doc(user.id)
        .set(
          {
            favorites: favorites,
          },
          { merge: true }
        )
        .catch((error) => {
          console.log("Failed to sync favorites: " + error);
          queue.notify({ title: "Failed to sync favorites: " + error });
        });
    }
  };
  const toggleHidden = (id: string) => {
    const hidden = addOrRemove([...userHidden], id);
    dispatch(setHidden(hidden));
    filterData(appPage, allSets, mainSort, mainSortOrder, mainSearch, mainWhitelist, userFavorites, hidden);
    const isHidden = hidden.includes(id);
    queue.notify({
      title: `Set ${isHidden ? "hidden" : "unhidden"}.`,
      actions: [
        {
          label: "Undo",
          onClick: () => {
            toggleHidden(id);
          },
        },
      ],
      timeout: 2500,
      dismissesOnAction: true,
    });
    if (user.id) {
      db.collection("users")
        .doc(user.id)
        .set(
          {
            hidden: hidden,
          },
          { merge: true }
        )
        .catch((error) => {
          console.log("Failed to sync hidden sets: " + error);
          queue.notify({ title: "Failed to sync hidden sets: " + error });
        });
    }
  };
  const updatePreset = (preset: OldPresetType): PresetType => {
    const regions =
      hasKey(preset.whitelist, "regions") && preset.whitelist.regions instanceof Array
        ? preset.whitelist.regions
        : allRegions;
    const updatedPreset: PresetType = { ...preset, whitelist: { ...preset.whitelist, regions: regions } };
    return updatedPreset;
  };
  const findPreset = (prop: keyof PresetType, val: string): PresetType | undefined => {
    const allPresets = [...appPresets, ...userPresets];
    const index = allPresets.findIndex((preset) => preset[prop] === val);
    return allPresets[index];
  };
  const selectPreset = (id: string, write = true) => {
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
  const newPreset = (preset: PresetType) => {
    preset.id = nanoid();
    const presets = [...userPresets, preset];
    alphabeticalSortProp(presets, "name", false);
    dispatch(setCurrentPreset(preset));
    dispatch(setUserPresets(presets));
    syncPresets(presets);
  };
  const editPreset = (preset: PresetType) => {
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
  const deletePreset = (preset: PresetType) => {
    const presets = userPresets.filter((filterPreset) => filterPreset.id !== preset.id);
    alphabeticalSortProp(presets, "name", false);
    dispatch(setCurrentPreset(defaultPreset));
    dispatch(setUserPresets(presets));
    syncPresets(presets);
  };
  const syncPresets = (presets = userPresets) => {
    const sortedPresets = alphabeticalSortProp(presets, "name", false, "Default").map((preset) => ({
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
  const newGlobalPreset = (preset: PresetType) => {
    preset.id = nanoid();
    const presets = [...appPresets, preset];
    alphabeticalSortProp(presets, "name", false, "Default");
    dispatch(setCurrentPreset(preset));
    dispatch(setUserPresets(presets));
    syncGlobalPresets(presets);
  };
  const editGlobalPreset = (preset: PresetType) => {
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
    dispatch(setUserPresets(presets));
    syncGlobalPresets(presets);
  };
  const deleteGlobalPreset = (preset: PresetType) => {
    const presets = appPresets.filter((filterPreset) => filterPreset.id !== preset.id);
    alphabeticalSortProp(presets, "name", false, "Default");
    dispatch(setCurrentPreset(defaultPreset));
    dispatch(setAppPresets(presets));
    syncGlobalPresets(presets);
  };
  const syncGlobalPresets = (presets = appPresets) => {
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
  useEffect(() => {
    checkDevice();
    getURLQuery();
    checkStorage();
    checkTheme();
    getGlobals();

    const authObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const getClaimsFn = firebase.functions().httpsCallable("getClaims");
        getClaimsFn()
          .then((result) => {
            dispatch(
              setUser({
                email: user.email ? user.email : "",
                name: user.displayName ? user.displayName : "",
                avatar: user.photoURL ? user.photoURL : "",
                id: user.uid,
                nickname: result.data.nickname,
                isDesigner: result.data.designer,
                isEditor: result.data.editor,
                isAdmin: result.data.admin,
              })
            );
            if (result.data.admin) {
              testSets();
            }
          })
          .catch((error) => {
            queue.notify({ title: "Error verifying custom claims: " + error });
            dispatch(
              setUser({
                email: user.email ? user.email : "",
                name: user.displayName ? user.displayName : "",
                avatar: user.photoURL ? user.photoURL : "",
                id: user.uid,
              })
            );
          });
        getUserPreferences(user.uid);
      } else {
        dispatch(setUser({}));
        const defaultPreset = findPreset("id", "default");
        if (defaultPreset) {
          dispatch(setUserPresets([]));
          dispatch(setFavorites([]));
          dispatch(setHidden([]));
          dispatch(setCurrentPreset(defaultPreset));
        } else {
          dispatch(setUserPresets([]));
          dispatch(setFavorites([]));
          dispatch(setHidden([]));
        }
      }
    });
    return authObserver;
  }, []);
  const transitionClass = classNames({ "view-transition": transition });
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <UserContext.Provider
            value={{
              setUser: setUser,
              toggleFavorite: toggleFavorite,
              toggleHidden: toggleHidden,
              setSyncSettings: setSyncSettings,
              selectPreset: selectPreset,
              newPreset: newPreset,
              editPreset: editPreset,
              deletePreset: deletePreset,
              newGlobalPreset: newGlobalPreset,
              editGlobalPreset: editGlobalPreset,
              deleteGlobalPreset: deleteGlobalPreset,
            }}
          >
            <Login />
          </UserContext.Provider>
        </Route>
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/guide/entries">
          <EntryGuide />
        </Route>
        <Route exact path="/">
          <UserContext.Provider
            value={{
              setUser: setUser,
              toggleFavorite: toggleFavorite,
              toggleHidden: toggleHidden,
              setSyncSettings: setSyncSettings,
              selectPreset: selectPreset,
              newPreset: newPreset,
              editPreset: editPreset,
              deletePreset: deletePreset,
              newGlobalPreset: newGlobalPreset,
              editGlobalPreset: editGlobalPreset,
              deleteGlobalPreset: deleteGlobalPreset,
            }}
          >
            <div className={classNames("app", { [`density-${settings.density}`]: device === "desktop" })}>
              <Content
                getData={getData}
                className={transitionClass}
                setPage={setPage}
                setSort={setSort}
                setSortOrder={setSortOrder}
                setSearch={setSearch}
                setWhitelist={setWhitelist}
                setWhitelistMerge={setWhitelistMerge}
              />
              <SnackbarQueue messages={queue.messages} />
              <SnackbarCookies open={!cookies} accept={acceptCookies} clear={clearCookies} />
            </div>
          </UserContext.Provider>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;
