import React, { useEffect, useState } from "react";
import firebase from "./firebase";
import moment from "moment";
import { nanoid } from "nanoid";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import debounce from "lodash.debounce";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectDevice, selectPage, setAppPage, setDevice } from "./app/slices/commonSlice";
import {
  selectUser,
  setUser,
  selectUserPresets,
  setUserPresets,
  selectFavorites,
  setFavorites,
  selectHidden,
  setHidden,
} from "./app/slices/userSlice";
import { selectSettings, setSettings } from "./app/slices/settingsSlice";
import { queue } from "./app/snackbarQueue";
import { SnackbarQueue } from "@rmwc/snackbar";
import { Content } from "./components/Content";
import { Login } from "./components/pages/Login";
import { NotFound } from "./components/pages/NotFound";
import { EntryGuide } from "./components/pages/guides/EntryGuide";
import { PrivacyPolicy } from "./components/pages/legal/Privacy";
import { TermsOfService } from "./components/pages/legal/Terms";
import { SnackbarCookies } from "./components/common/SnackbarCookies";
import {
  allPages,
  pageTitle,
  pageSort,
  whitelistParams,
  statsTabs,
  urlPages,
  dateSorts,
  arraySorts,
  pageSortOrder,
  reverseSortDatePages,
  mainPages,
  allSorts,
  sortBlacklist,
  whitelistShipped,
} from "./util/constants";
import { Interval, Preset, Whitelist } from "./util/constructors";
import { UserContext } from "./util/contexts";
import {
  addOrRemove,
  alphabeticalSort,
  alphabeticalSortProp,
  arrayEveryType,
  arrayIncludes,
  hasKey,
  mergeObject,
  normalise,
  pageConditions,
  replaceFunction,
  uniqueArray,
} from "./util/functions";
import {
  ArraySortKeys,
  DateSortKeys,
  WhitelistType,
  PresetType,
  SetType,
  SortOrderType,
  VendorType,
  UserPreferencesDoc,
  GlobalDoc,
  OldPresetType,
  SetGroup,
  Page,
  SortType,
  StatsTab,
  ViewType,
} from "./util/types";
import "./App.scss";

const db = firebase.firestore();

export const App = () => {
  const dispatch = useAppDispatch();

  const settings = useAppSelector(selectSettings);
  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);
  const userPresets = useAppSelector(selectUserPresets);
  const userFavorites = useAppSelector(selectFavorites);
  const userHidden = useAppSelector(selectHidden);

  const appPage = useAppSelector(selectPage);

  const [statisticsTab, setStatsTab] = useState<StatsTab>("summary");
  const [lists, setLists] = useState<{
    allDesigners: string[];
    allProfiles: string[];
    allRegions: string[];
    allVendors: string[];
    allVendorRegions: string[];
  }>({
    allDesigners: [],
    allProfiles: [],
    allRegions: [],
    allVendors: [],
    allVendorRegions: [],
  });
  const [setsInfo, setSetsInfo] = useState<{
    allSets: SetType[];
    filteredSets: SetType[];
    setGroups: SetGroup[];
  }>({
    allSets: [],
    filteredSets: [],
    setGroups: [],
  });
  const [sorts, setSorts] = useState<{
    sort: SortType;
    sortOrder: SortOrderType;
  }>({
    sort: "gbLaunch",
    sortOrder: "ascending",
  });
  const [filterInfo, setFilterInfo] = useState<{
    search: string;
    whitelist: WhitelistType;
    currentPreset: PresetType;
    appPresets: PresetType[];
  }>({
    search: "",
    whitelist: {
      edited: [],
      favorites: false,
      hidden: false,
      profiles: [],
      shipped: ["Shipped", "Not shipped"],
      regions: [],
      vendorMode: "exclude",
      vendors: [],
    },
    currentPreset: new Preset(),
    appPresets: [],
  });

  const [cookies, setCookies] = useState(false);

  const [lichTheme, setLichTheme] = useState(false);

  const [transition, setTransition] = useState(false);
  const [loading, setLoading] = useState(false);
  const [content, setContent] = useState(true);

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
            setSorts({ sort: pageSort[pageQuery], sortOrder: pageSortOrder[pageQuery] });
          } else {
            const sortQuery = params.get("sort");
            const sortOrderQuery = params.get("sortOrder");
            dispatch(setAppPage(pageQuery));
            setSorts({
              sort:
                arrayIncludes(allSorts, sortQuery) && !arrayIncludes(sortBlacklist[sortQuery], pageQuery)
                  ? sortQuery
                  : pageSort[pageQuery],
              sortOrder:
                sortOrderQuery && (sortOrderQuery === "ascending" || sortOrderQuery === "descending")
                  ? sortOrderQuery
                  : pageSortOrder[pageQuery],
            });
          }
        } else {
          dispatch(setAppPage(pageQuery));
        }
      }
    } else {
      dispatch(setAppPage("calendar"));
    }
    const whitelistObj: WhitelistType = { ...filterInfo.whitelist };
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
  const acceptCookies = () => {
    setCookies(true);
    setCookie("accepted", "true", 356);
  };
  const clearCookies = () => {
    setCookies(false);
    setCookie("accepted", "false", -1);
  };
  const setCookie = (cname: string, cvalue: string, exdays: number) => {
    if (cookies || cname === "accepted") {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
  };
  const getCookie = (cname: string) => {
    const name = cname + "=";
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(";");
    for (let i = 0; i < ca.length; i++) {
      let c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  };
  const setStorage = (name: string, value: any) => {
    if (cookies) {
      localStorage.setItem(name, JSON.stringify(value));
    }
  };
  const getStorage = (name: string) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : value;
  };
  const checkStorage = () => {
    const accepted = getCookie("accepted");
    if (accepted && accepted === "true") {
      setCookies(true);

      const convertCookie = (key: string, setFunction: (val: any, write: boolean) => void) => {
        const cookie = getCookie(key);
        if (cookie) {
          if (cookie !== "true" && cookie !== "false") {
            setTimeout(() => {
              setFunction(cookie, false);
              setStorage(key, cookie);
              setCookie(key, cookie, -1);
            }, 0);
          } else {
            const cookieBool = cookie === "true";
            setTimeout(() => {
              setFunction(cookieBool, false);
              setStorage(key, cookieBool);
              setCookie(key, cookie, -1);
            }, 0);
          }
        }
      };

      const fetchAndSet = (key: string, setFunction: (val: any, write: boolean) => void) => {
        const val = getStorage(key);
        if (val && hasKey(settings, key)) {
          const currentSetting = settings[key];
          if (val !== currentSetting) {
            setTimeout(() => {
              setFunction(val, false);
            }, 0);
          }
        }
      };

      Object.keys(settingFns).forEach((setting) => {
        if (hasKey(settingFns, setting)) {
          const func = settingFns[setting];
          fetchAndSet(setting, func);
          convertCookie(setting, func);
        }
      });

      const storedPreset = getStorage("presetId");
      const params = new URLSearchParams(window.location.search);
      const noUrlParams = !whitelistParams.some((param) => params.has(param));
      if (storedPreset && storedPreset !== "default" && noUrlParams) {
        selectPreset(storedPreset, false);
      }
    }
  };
  const setView = (view: ViewType, write = true) => {
    if (view !== settings.view && !loading) {
      setTransition(true);
      setTimeout(() => {
        document.documentElement.scrollTop = 0;
        dispatch(setSettings({ view: view }));
      }, 90);
      setTimeout(() => {
        setTransition(false);
      }, 300);
    } else {
      dispatch(setSettings({ view: view }));
    }
    if (write) {
      setStorage("view", view);
      syncSetting("view", view);
    }
  };
  const setPage = (page: Page) => {
    if (page !== appPage && !loading && arrayIncludes(allPages, page)) {
      setTransition(true);
      setTimeout(() => {
        if (arrayIncludes(mainPages, page)) {
          filterData(page, setsInfo.allSets, pageSort[page], pageSortOrder[page]);
          dispatch(setAppPage(page));
          setSorts({ sort: pageSort[page], sortOrder: pageSortOrder[page] });
        } else {
          dispatch(setAppPage(page));
        }
        setFilterInfo((filterInfo) => mergeObject(filterInfo, { search: "" }));
        document.documentElement.scrollTop = 0;
      }, 90);
      setTimeout(() => {
        setTransition(false);
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
  const isDarkTheme = () => {
    const manualBool = settings.applyTheme === "manual" && settings.manualTheme;
    const systemBool =
      settings.applyTheme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const currentDay = moment();
    const fromArray = settings.fromTimeTheme.split(":");
    const fromTime = moment().hours(parseInt(fromArray[0])).minutes(parseInt(fromArray[1]));
    const toArray = settings.toTimeTheme.split(":");
    const toTime = moment().hours(parseInt(toArray[0])).minutes(parseInt(toArray[1]));
    const timedBool = settings.applyTheme === "timed" && (currentDay >= fromTime || currentDay <= toTime);
    return manualBool || systemBool || timedBool;
  };
  const checkTheme = () => {
    const themeBool = isDarkTheme();
    const html = document.querySelector("html");
    if (html) {
      html.setAttribute("class", "");
      html.classList.add(lichTheme ? "lich" : themeBool === true ? settings.darkTheme : settings.lightTheme);
    }
    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) {
      meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
    }
  };
  const setApplyTheme = (applyTheme: string, write = true) => {
    dispatch(setSettings({ applyTheme: applyTheme }));
    const timed = new Interval(checkTheme, 1000 * 60);
    if (applyTheme === "system") {
      setTimeout(checkTheme, 1);
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        e.preventDefault();
        checkTheme();
      });
    } else {
      setTimeout(checkTheme, 1);
    }
    if (applyTheme !== "timed") {
      setTimeout(timed.clear, 1000 * 10);
    }
    if (write) {
      setStorage("applyTheme", applyTheme);
      syncSetting("applyTheme", applyTheme);
    }
  };
  const setLightTheme = (theme: string, write = true) => {
    dispatch(setSettings({ lightTheme: theme }));
    setTimeout(checkTheme, 1);
    if (write) {
      setStorage("lightTheme", theme);
      syncSetting("lightTheme", theme);
    }
  };
  const setDarkTheme = (theme: string, write = true) => {
    dispatch(setSettings({ darkTheme: theme }));
    setTimeout(checkTheme, 1);
    if (write) {
      setStorage("darkTheme", theme);
      syncSetting("darkTheme", theme);
    }
  };
  const setManualTheme = (bool: boolean, write = true) => {
    dispatch(setSettings({ manualTheme: bool }));
    setTimeout(checkTheme, 1);
    if (write) {
      setStorage("manualTheme", bool);
      syncSetting("manualTheme", bool);
    }
  };
  const setFromTimeTheme = (time: string, write = true) => {
    dispatch(setSettings({ fromTimeTheme: time }));
    setTimeout(checkTheme, 1);
    if (write) {
      setStorage("fromTimeTheme", time);
      syncSetting("fromTimeTheme", time);
    }
  };
  const setToTimeTheme = (time: string, write = true) => {
    dispatch(setSettings({ toTimeTheme: time }));
    setTimeout(checkTheme, 1);
    if (write) {
      setStorage("toTimeTheme", time);
      syncSetting("toTimeTheme", time);
    }
  };
  const toggleLichTheme = () => {
    setLichTheme((lichTheme) => !lichTheme);
    setTimeout(checkTheme, 1);
  };
  const setBottomNav = (value: boolean, write = true) => {
    document.documentElement.scrollTop = 0;
    dispatch(setSettings({ bottomNav: value }));
    if (write) {
      setStorage("bottomNav", value);
      syncSetting("bottomNav", value);
    }
  };

  const setDensity = (density: string, write = true) => {
    dispatch(setSettings({ density: density }));
    if (write) {
      setStorage("density", density);
      syncSetting("density", density);
    }
  };

  const settingFns: Record<string, (val: any, write: boolean) => void> = {
    view: setView,
    bottomNav: setBottomNav,
    applyTheme: setApplyTheme,
    lightTheme: setLightTheme,
    darkTheme: setDarkTheme,
    manualTheme: setManualTheme,
    fromTimeTheme: setFromTimeTheme,
    toTimeTheme: setToTimeTheme,
    density: setDensity,
  };

  const getData = () => {
    setLoading(true);
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

        setSetsInfo((setsInfo) => mergeObject(setsInfo, { allSets: sets }));

        filterData(appPage, sets);
        generateLists(sets);
      })
      .catch((error) => {
        console.log("Error getting data: " + error);
        queue.notify({ title: "Error getting data: " + error });
        setLoading(false);
        setContent(false);
      });
  };

  const testSets = (sets = setsInfo.allSets) => {
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

  const generateLists = (sets = setsInfo.allSets) => {
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

    const filteredPresets = filterInfo.appPresets.filter((preset) => preset.id !== "default");

    const defaultWhitelist: WhitelistType = new Whitelist(
      false,
      false,
      allProfiles,
      ["Shipped", "Not shipped"],
      allRegions,
      "exclude",
      []
    );

    const defaultPreset: PresetType = new Preset("Default", false, defaultWhitelist, "default");

    const presets = [defaultPreset, ...filteredPresets];

    setLists({
      allVendorRegions: allVendorRegions,
      allRegions: allRegions,
      allVendors: allVendors,
      allDesigners: allDesigners,
      allProfiles: allProfiles,
    });

    if (!filterInfo.currentPreset.name) {
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { appPresets: presets, currentPreset: defaultPreset }));
      setWhitelistMerge({ profiles: allProfiles, regions: allRegions });
    } else {
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { appPresets: presets }));
    }
  };

  const filterData = (
    page = appPage,
    sets = setsInfo.allSets,
    sort = sorts.sort,
    sortOrder = sorts.sortOrder,
    search = filterInfo.search,
    whitelist = filterInfo.whitelist,
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

    setSetsInfo((setsInfo) => mergeObject(setsInfo, { filteredSets: filteredSets }));
    setContent(true);
    setLoading(false);
  };

  const debouncedFilterData = debounce(filterData, 350, { trailing: true });

  const sortData = (sort = sorts.sort, sortOrder = sorts.sortOrder, setGroups = setsInfo.setGroups) => {
    const array = [...setGroups];
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

    setSetsInfo((setsInfo) => mergeObject(setsInfo, { setGroups: array }));
  };

  const createGroups = (
    page = appPage,
    sort = sorts.sort,
    sortOrder = sorts.sortOrder,
    sets = setsInfo.filteredSets
  ) => {
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

    setSetsInfo((setsInfo) => mergeObject(setsInfo, { setGroups: setGroups }));
  };

  const setSort = (sort: SortType, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    let sortOrder: SortOrderType = "ascending";
    if (arrayIncludes(dateSorts, sort) && reverseSortDatePages.includes(appPage)) {
      sortOrder = "descending";
    }
    if (arrayIncludes(allSorts, sort)) {
      setSorts({ sort: sort, sortOrder: sortOrder });
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
    setSorts((sorts) => mergeObject(sorts, { sortOrder: sortOrder }));
    sortData(sorts.sort, sortOrder);
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("sortOrder");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  const setSearch = (query: string) => {
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { search: query }));
    document.documentElement.scrollTop = 0;
    debouncedFilterData(appPage, setsInfo.allSets, sorts.sort, sorts.sortOrder, query);
  };
  const setStatisticsTab = (tab: StatsTab, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    setStatsTab(tab);
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("statisticsTab");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
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
    const whitelist = { ...filterInfo.whitelist, ...partialWhitelist, edited: edited };
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { whitelist: whitelist }));
    document.documentElement.scrollTop = 0;
    if (setsInfo.allSets.length > 0) {
      filterData(appPage, setsInfo.allSets, sorts.sort, sorts.sortOrder, filterInfo.search, whitelist);
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
    if (filterInfo.whitelist.edited instanceof Array) {
      const edited = filterInfo.whitelist.edited.includes(prop)
        ? filterInfo.whitelist.edited
        : [...filterInfo.whitelist.edited, prop];
      const whitelist = { ...filterInfo.whitelist, [prop]: val, edited: edited };
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { whitelist: whitelist }));
      document.documentElement.scrollTop = 0;
      if (setsInfo.allSets.length > 0) {
        filterData(appPage, setsInfo.allSets, sorts.sort, sorts.sortOrder, filterInfo.search, whitelist);
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
          const defaultPreset = findPreset("id", "default");
          const updatedPresets = filterPresets.map((preset) => updatePreset(preset));
          if (defaultPreset) {
            setFilterInfo((filterInfo) => mergeObject(filterInfo, { appPresets: [defaultPreset, ...updatedPresets] }));
          } else {
            setFilterInfo((filterInfo) => mergeObject(filterInfo, { appPresets: updatedPresets }));
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

            filterData(
              appPage,
              setsInfo.allSets,
              sorts.sort,
              sorts.sortOrder,
              filterInfo.search,
              filterInfo.whitelist,
              favorites,
              hidden
            );
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
      filterData(
        appPage,
        setsInfo.allSets,
        sorts.sort,
        sorts.sortOrder,
        filterInfo.search,
        filterInfo.whitelist,
        favorites
      );
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
    filterData(
      appPage,
      setsInfo.allSets,
      sorts.sort,
      sorts.sortOrder,
      filterInfo.search,
      filterInfo.whitelist,
      userFavorites,
      hidden
    );
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
  const setSyncSettings = (bool: boolean, write = true) => {
    dispatch(setSettings({ syncSettings: bool }));
    if (write) {
      const settingsObject: { [key: string]: any } = {};
      if (bool) {
        Object.keys(settingFns).forEach((setting) => {
          if (hasKey(settings, setting)) {
            settingsObject[setting] = settings[setting];
          }
        });
      }
      db.collection("users")
        .doc(user.id)
        .set({ syncSettings: bool, settings: settingsObject }, { merge: true })
        .catch((error) => {
          console.log("Failed to set sync setting: " + error);
          queue.notify({ title: "Failed to set sync setting: " + error });
        });
    }
  };
  const syncSetting = (setting: string, value: any) => {
    if (user.id && settings.syncSettings) {
      const userDocRef = db.collection("users").doc(user.id);
      userDocRef.get().then((doc) => {
        if (doc.exists) {
          sync();
        } else {
          userDocRef
            .set({ settings: {} }, { merge: true })
            .then(() => {
              sync();
            })
            .catch((error) => {
              console.log("Failed to create settings object: " + error);
              queue.notify({ title: "Failed to create settings object: " + error });
            });
        }
      });
      const sync = () => {
        const settingObject: { [key: string]: any } = {};
        settingObject[`settings.${setting}`] = value;
        userDocRef.update(settingObject).catch((error) => {
          console.log("Failed to sync settings: " + error);
          queue.notify({ title: "Failed to sync settings: " + error });
        });
      };
    }
  };
  const updatePreset = (preset: OldPresetType): PresetType => {
    const regions =
      hasKey(preset.whitelist, "regions") && preset.whitelist.regions instanceof Array
        ? preset.whitelist.regions
        : lists.allRegions;
    const updatedPreset: PresetType = { ...preset, whitelist: { ...preset.whitelist, regions: regions } };
    return updatedPreset;
  };
  const findPreset = (prop: keyof PresetType, val: string): PresetType | undefined => {
    const allPresets = [...filterInfo.appPresets, ...userPresets];
    const index = allPresets.findIndex((preset) => preset[prop] === val);
    return allPresets[index];
  };
  const selectPreset = (id: string, write = true) => {
    const preset = findPreset("id", id);
    if (preset) {
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: preset }));
      setWhitelistMerge(preset.whitelist);
    }
    if (write) {
      setStorage("presetId", id);
    }
  };
  const newPreset = (preset: PresetType) => {
    preset.id = nanoid();
    const presets = [...userPresets, preset];
    alphabeticalSortProp(presets, "name", false);
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: preset }));
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
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: preset }));
    dispatch(setUserPresets(presets));
    syncPresets(presets);
  };
  const deletePreset = (preset: PresetType) => {
    const presets = userPresets.filter((filterPreset) => filterPreset.id !== preset.id);
    alphabeticalSortProp(presets, "name", false);
    const defaultPreset = findPreset("id", "default");
    if (defaultPreset) {
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: defaultPreset }));
      dispatch(setUserPresets(presets));
    }
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
    const presets = [...filterInfo.appPresets, preset];
    alphabeticalSortProp(presets, "name", false, "Default");
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: preset }));
    dispatch(setUserPresets(presets));
    syncGlobalPresets(presets);
  };
  const editGlobalPreset = (preset: PresetType) => {
    const savedPreset = findPreset("id", preset.id);
    let presets: PresetType[];
    if (savedPreset) {
      const index = filterInfo.appPresets.indexOf(savedPreset);
      presets = [...filterInfo.appPresets];
      presets[index] = preset;
    } else {
      presets = [...filterInfo.appPresets, preset];
    }
    alphabeticalSortProp(presets, "name", false, "Default");
    setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: preset }));
    dispatch(setUserPresets(presets));
    syncGlobalPresets(presets);
  };
  const deleteGlobalPreset = (preset: PresetType) => {
    const presets = filterInfo.appPresets.filter((filterPreset) => filterPreset.id !== preset.id);
    alphabeticalSortProp(presets, "name", false, "Default");
    const defaultPreset = findPreset("id", "default");
    if (defaultPreset) {
      setFilterInfo((filterInfo) => mergeObject(filterInfo, { appPresets: presets, currentPreset: defaultPreset }));
    }
    syncGlobalPresets(presets);
  };
  const syncGlobalPresets = (presets = filterInfo.appPresets) => {
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
          setFilterInfo((filterInfo) => mergeObject(filterInfo, { currentPreset: defaultPreset }));
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
              favorites: userFavorites,
              toggleFavorite: toggleFavorite,
              hidden: userHidden,
              toggleHidden: toggleHidden,
              syncSettings: settings.syncSettings,
              setSyncSettings: setSyncSettings,
              preset: filterInfo.currentPreset,
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
              favorites: userFavorites,
              toggleFavorite: toggleFavorite,
              hidden: userHidden,
              toggleHidden: toggleHidden,
              syncSettings: settings.syncSettings,
              setSyncSettings: setSyncSettings,
              preset: filterInfo.currentPreset,
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
                sets={setsInfo.filteredSets}
                getData={getData}
                className={transitionClass}
                setPage={setPage}
                setView={setView}
                allSets={setsInfo.allSets}
                allProfiles={lists.allProfiles}
                allDesigners={lists.allDesigners}
                allVendors={lists.allVendors}
                allVendorRegions={lists.allVendorRegions}
                allRegions={lists.allRegions}
                appPresets={filterInfo.appPresets}
                setGroups={setsInfo.setGroups}
                loading={loading}
                sort={sorts.sort}
                setSort={setSort}
                sortOrder={sorts.sortOrder}
                setSortOrder={setSortOrder}
                content={content}
                search={filterInfo.search}
                setSearch={setSearch}
                setApplyTheme={setApplyTheme}
                setLightTheme={setLightTheme}
                setDarkTheme={setDarkTheme}
                setManualTheme={setManualTheme}
                setFromTimeTheme={setFromTimeTheme}
                setToTimeTheme={setToTimeTheme}
                toggleLichTheme={toggleLichTheme}
                setBottomNav={setBottomNav}
                setWhitelist={setWhitelist}
                setWhitelistMerge={setWhitelistMerge}
                whitelist={filterInfo.whitelist}
                statisticsTab={statisticsTab}
                setStatisticsTab={setStatisticsTab}
                setDensity={setDensity}
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
