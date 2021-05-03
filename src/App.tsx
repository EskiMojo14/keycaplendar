import React from "react";
import firebase from "./firebase";
import moment from "moment";
import { nanoid } from "nanoid";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import debounce from "lodash.debounce";
import { createSnackbarQueue, SnackbarQueue } from "@rmwc/snackbar";
import { Content } from "./components/Content";
import { Login } from "./components/pages/Login";
import { NotFound } from "./components/pages/NotFound";
import { EntryGuide } from "./components/pages/guides/EntryGuide";
import { PrivacyPolicy } from "./components/pages/legal/Privacy";
import { TermsOfService } from "./components/pages/legal/Terms";
import { SnackbarCookies } from "./components/common/SnackbarCookies";
import {
  pageTitle,
  settingsFunctions,
  pageSort,
  whitelistParams,
  statsTabs,
  urlPages,
  dateSorts,
  arraySorts,
  pageSortOrder,
  reverseSortDatePages,
} from "./util/constants";
import { Interval, Preset } from "./util/constructors";
import { UserContext, DeviceContext } from "./util/contexts";
import {
  addOrRemove,
  alphabeticalSort,
  alphabeticalSortProp,
  hasKey,
  normalise,
  replaceFunction,
  uniqueArray,
} from "./util/functions";
import {
  ArraySortKeys,
  CurrentUserType,
  DateSortKeys,
  WhitelistType,
  PresetType,
  SetType,
  SortOrderType,
  VendorType,
  UserPreferencesDoc,
  GlobalDoc,
} from "./util/types";
import "./App.scss";

const db = firebase.firestore();

const queue = createSnackbarQueue();

type AppProps = Record<string, never>;

type AppState = {
  device: string;
  bottomNav: boolean;
  page: string;
  statisticsTab: string;
  view: string;
  transition: boolean;
  sort: string;
  sortOrder: SortOrderType;
  allDesigners: string[];
  allVendors: string[];
  allRegions: string[];
  sets: SetType[];
  profiles: string[];
  filteredSets: SetType[];
  groups: string[];
  loading: boolean;
  content: boolean;
  search: string;
  user: CurrentUserType;
  favorites: string[];
  hidden: string[];
  whitelist: WhitelistType;
  cookies: boolean;
  applyTheme: string;
  lightTheme: string;
  darkTheme: string;
  manualTheme: boolean;
  fromTimeTheme: string;
  toTimeTheme: string;
  lichTheme: boolean;
  density: string;
  syncSettings: boolean;
  currentPreset: PresetType;
  appPresets: PresetType[];
  userPresets: PresetType[];
};

class App extends React.Component<AppProps, AppState> {
  state: AppState = {
    device: "tablet",
    bottomNav: false,
    page: "calendar",
    statisticsTab: "summary",
    view: "card",
    transition: false,
    sort: "gbLaunch",
    sortOrder: "ascending",
    allDesigners: [],
    allVendors: [],
    allRegions: [],
    sets: [],
    profiles: [],
    filteredSets: [],
    groups: [],
    loading: false,
    content: true,
    search: "",
    user: {
      email: "",
      name: "",
      avatar: "",
      isEditor: false,
      isAdmin: false,
      nickname: "",
      isDesigner: false,
      id: "",
    },
    favorites: [],
    hidden: [],
    whitelist: {
      edited: [],
      favorites: false,
      hidden: false,
      profiles: [],
      shipped: ["Shipped", "Not shipped"],
      vendorMode: "exclude",
      vendors: [],
    },
    cookies: false,
    applyTheme: "manual",
    lightTheme: "light",
    darkTheme: "deep",
    manualTheme: false,
    fromTimeTheme: "21:00",
    toTimeTheme: "06:00",
    lichTheme: false,
    density: "default",
    syncSettings: false,
    currentPreset: new Preset(),
    appPresets: [],
    userPresets: [],
  };
  constructor(props: AppProps) {
    super(props);
    this.debouncedFilterData = debounce(this.filterData, 350, { trailing: true });
  }
  getURLQuery = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) {
      const pageQuery = params.get("page");
      if ((pageQuery && urlPages.includes(pageQuery)) || (pageQuery && process.env.NODE_ENV === "development")) {
        if (pageQuery !== "calendar") {
          const sortQuery = params.get("sort");
          const sortOrderQuery = params.get("sortOrder");
          this.setState({
            page: pageQuery,
            sort: sortQuery ? sortQuery : pageSort[pageQuery],
            sortOrder:
              sortOrderQuery && (sortOrderQuery === "ascending" || sortOrderQuery === "descending")
                ? sortOrderQuery
                : pageSortOrder[pageQuery],
          });
        } else {
          this.setState({ page: pageQuery, sort: pageSort[pageQuery], sortOrder: pageSortOrder[pageQuery] });
        }
      }
    }
    const whitelistObj: WhitelistType = { ...this.state.whitelist };
    whitelistParams.forEach((param, index, array) => {
      if (params.has(param)) {
        const val = params.get(param);
        if (val) {
          if (param === "profile") {
            whitelistObj.profiles = [val];
          } else if (param === "profiles" || param === "shipped" || param === "vendors") {
            const array = val.split(" ").map((item) => item.replace("-", " "));
            whitelistObj[param] = array;
          } else if (param === "vendorMode" && (val === "include" || val === "exclude")) {
            whitelistObj[param] = val;
          }
        }
      }
      if (index === array.length - 1) {
        this.setWhitelist("all", whitelistObj, false);
      }
    });
    if (params.has("statisticsTab")) {
      const urlTab = params.get("statisticsTab");
      if (urlTab && statsTabs.includes(urlTab)) {
        this.setStatisticsTab(urlTab);
      }
    }
    this.getData();
  };
  acceptCookies = () => {
    this.setState({ cookies: true });
    this.setCookie("accepted", "true", 356);
  };
  clearCookies = () => {
    this.setState({ cookies: false });
    this.setCookie("accepted", "false", -1);
  };
  setCookie(cname: string, cvalue: string, exdays: number) {
    if (this.state.cookies || cname === "accepted") {
      const d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
  }
  getCookie(cname: string) {
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
  }
  setStorage = (name: string, value: any) => {
    if (this.state.cookies) {
      localStorage.setItem(name, JSON.stringify(value));
    }
  };
  getStorage = (name: string) => {
    const value = localStorage.getItem(name);
    return value ? JSON.parse(value) : value;
  };
  checkStorage = () => {
    const accepted = this.getCookie("accepted");
    if (accepted && accepted === "true") {
      this.setState({ cookies: true });

      const convertCookie = (key: string, setFunction: (val: any, write: boolean) => void) => {
        const cookie = this.getCookie(key);
        if (cookie) {
          if (cookie !== "true" && cookie !== "false") {
            setTimeout(() => {
              setFunction(cookie, false);
              this.setStorage(key, cookie);
              this.setCookie(key, cookie, -1);
            }, 0);
          } else {
            const cookieBool = cookie === "true";
            setTimeout(() => {
              setFunction(cookieBool, false);
              this.setStorage(key, cookieBool);
              this.setCookie(key, cookie, -1);
            }, 0);
          }
        }
      };

      const fetchAndSet = (key: string, setFunction: (val: any, write: boolean) => void) => {
        const val = this.getStorage(key);
        if (val) {
          setTimeout(() => {
            setFunction(val, false);
          }, 0);
        }
      };

      Object.keys(settingsFunctions).forEach((setting) => {
        if (hasKey(settingsFunctions, setting)) {
          const funcName = settingsFunctions[setting];
          if (hasKey<App>(this, funcName)) {
            const func = this[funcName];
            fetchAndSet(setting, func);
            convertCookie(setting, func);
          }
        }
      });

      const storedPreset = this.getStorage("presetId");
      if (storedPreset && storedPreset !== "default") {
        this.selectPreset(storedPreset, false);
      }
    }
  };
  setView = (view: string, write = true) => {
    if (view !== this.state.view && !this.state.loading) {
      this.setState({ transition: true });
      setTimeout(() => {
        document.documentElement.scrollTop = 0;
        this.setState({ view: view });
      }, 90);
      setTimeout(() => {
        this.setState({ transition: false });
      }, 300);
    } else {
      this.setState({ view: view });
    }
    if (write) {
      this.setStorage("view", view);
      this.syncSetting("view", view);
    }
  };
  setPage = (page: string) => {
    if (page !== this.state.page && !this.state.loading) {
      this.setState({ transition: true });
      setTimeout(() => {
        this.setState({ page: page, sort: pageSort[page], sortOrder: pageSortOrder[page] });
        this.setSearch("");
        this.filterData(page, this.state.sets, pageSort[page], pageSortOrder[page]);
        document.documentElement.scrollTop = 0;
      }, 90);
      setTimeout(() => {
        this.setState({ transition: false });
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
  isDarkTheme = () => {
    const manualBool = this.state.applyTheme === "manual" && this.state.manualTheme;
    const systemBool =
      this.state.applyTheme === "system" &&
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: dark)").matches;

    const currentDay = moment();
    const fromArray = this.state.fromTimeTheme.split(":");
    const fromTime = moment().hours(parseInt(fromArray[0])).minutes(parseInt(fromArray[1]));
    const toArray = this.state.toTimeTheme.split(":");
    const toTime = moment().hours(parseInt(toArray[0])).minutes(parseInt(toArray[1]));
    const timedBool = this.state.applyTheme === "timed" && (currentDay >= fromTime || currentDay <= toTime);
    return manualBool || systemBool || timedBool;
  };
  checkTheme = async () => {
    const themeBool = await this.isDarkTheme();
    const html = document.querySelector("html");
    if (html) {
      html.setAttribute("class", "");
      html.classList.add(
        this.state.lichTheme ? "lich" : themeBool === true ? this.state.darkTheme : this.state.lightTheme
      );
    }
    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) {
      meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
    }
  };
  setApplyTheme = (applyTheme: string, write = true) => {
    this.setState({
      applyTheme: applyTheme,
    });
    const timed = new Interval(this.checkTheme, 1000 * 60);
    if (applyTheme === "system") {
      setTimeout(this.checkTheme, 1);
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        e.preventDefault();
        this.checkTheme();
      });
    } else {
      setTimeout(this.checkTheme, 1);
    }
    if (applyTheme !== "timed") {
      setTimeout(timed.clear, 1000 * 10);
    }
    if (write) {
      this.setStorage("applyTheme", applyTheme);
      this.syncSetting("applyTheme", applyTheme);
    }
  };
  setLightTheme = (theme: string, write = true) => {
    this.setState({ lightTheme: theme });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setStorage("lightTheme", theme);
      this.syncSetting("lightTheme", theme);
    }
  };
  setDarkTheme = (theme: string, write = true) => {
    this.setState({ darkTheme: theme });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setStorage("darkTheme", theme);
      this.syncSetting("darkTheme", theme);
    }
  };
  setManualTheme = (bool: boolean, write = true) => {
    this.setState({ manualTheme: bool });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setStorage("manualTheme", bool);
      this.syncSetting("manualTheme", bool);
    }
  };
  setFromTimeTheme = (time: string, write = true) => {
    this.setState({ fromTimeTheme: time });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setStorage("fromTimeTheme", time);
      this.syncSetting("fromTimeTheme", time);
    }
  };
  setToTimeTheme = (time: string, write = true) => {
    this.setState({ toTimeTheme: time });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setStorage("toTimeTheme", time);
      this.syncSetting("toTimeTheme", time);
    }
  };
  toggleLichTheme = () => {
    this.setState((prevState) => {
      return { lichTheme: !prevState.lichTheme };
    });
    setTimeout(this.checkTheme, 1);
  };
  setBottomNav = (value: boolean, write = true) => {
    document.documentElement.scrollTop = 0;
    this.setState({ bottomNav: value });
    if (write) {
      this.setStorage("bottomNav", value);
      this.syncSetting("bottomNav", value);
    }
  };
  toggleLoading = () => {
    this.setState((prevState) => {
      return { loading: !prevState.loading };
    });
  };
  getData = () => {
    this.setState({ loading: true });
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

        this.setState({
          sets: sets,
        });
        this.filterData(this.state.page, sets);
      })
      .catch((error) => {
        console.log("Error getting data: " + error);
        queue.notify({ title: "Error getting data: " + error });
        this.setState({ loading: false, content: false });
      });
  };

  filterData = (
    page = this.state.page,
    sets = this.state.sets,
    sort = this.state.sort,
    sortOrder = this.state.sortOrder,
    search = this.state.search,
    whitelist = this.state.whitelist,
    favorites = this.state.favorites,
    hidden = this.state.hidden
  ) => {
    const today = moment.utc();
    const yesterday = moment.utc().date(today.date() - 1);

    // console log sets with space at end of string
    if (this.state.user.isAdmin) {
      const testValue = (set: SetType, key: string, value?: string) => {
        if (value) {
          const regex = /\s+$/m;
          const regex2 = /^\s+/;
          const bool = regex.test(value) || regex2.test(value);
          if (bool) {
            console.log(
              `${set.profile} ${set.colorway} - ${key}: ${value.replace(regex, "<space>").replace(regex2, "<space>")}`
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
                      if (typeof item[itemKey] === "string") {
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
    }

    // lists
    const allVendors = alphabeticalSort(
      uniqueArray(sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.name) : [])).flat())
    );

    const allRegions = alphabeticalSort(
      uniqueArray(sets.map((set) => (set.vendors ? set.vendors.map((vendor) => vendor.region) : [])).flat())
    );
    const allDesigners = alphabeticalSort(uniqueArray(sets.map((set) => (set.designer ? set.designer : [])).flat()));

    const allProfiles = alphabeticalSort(uniqueArray(sets.map((set) => set.profile)));

    // filter bool functions

    const hiddenBool = (set: SetType) => {
      if (page === "favorites") {
        return true;
      } else if ((whitelist.hidden && this.state.user.email) || page === "hidden") {
        return hidden.includes(set.id);
      } else {
        return !hidden.includes(set.id);
      }
    };

    const pageBool = (set: SetType): boolean => {
      if (page === "calendar") {
        const startDate = moment.utc(set.gbLaunch, ["YYYY-MM-DD", "YYYY-MM"]);
        const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
        return startDate > today || (startDate <= today && (endDate >= yesterday || !set.gbEnd));
      } else if (page === "live") {
        const startDate = moment.utc(set.gbLaunch, ["YYYY-MM-DD", "YYYY-MM"]);
        const endDate = moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 });
        return startDate <= today && (endDate >= yesterday || !set.gbEnd);
      } else if (page === "ic") {
        return !set.gbLaunch || set.gbLaunch.includes("Q");
      } else if (page === "previous") {
        const endDate = set.gbEnd ? moment.utc(set.gbEnd).set({ h: 23, m: 59, s: 59, ms: 999 }) : null;
        return !!(endDate && endDate <= yesterday);
      } else if (page === "timeline") {
        return !!(set.gbLaunch && !set.gbLaunch.includes("Q"));
      } else if (page === "archive") {
        return true;
      } else if (page === "favorites") {
        return favorites.includes(set.id);
      } else if (page === "hidden") {
        return hidden.includes(set.id);
      }
      return false;
    };

    const vendorBool = (set: SetType) => {
      let bool = whitelist.vendorMode === "exclude";
      const vendors = set.vendors;
      if (vendors) {
        vendors.forEach((vendor) => {
          if (whitelist.vendorMode === "exclude") {
            if (whitelist.vendors.includes(vendor.name)) {
              bool = false;
            }
          } else {
            if (whitelist.vendors.includes(vendor.name)) {
              bool = true;
            }
          }
        });
      }
      return bool;
    };

    const filterBool = (set: SetType) => {
      const shippedBool =
        (whitelist.shipped.includes("Shipped") && set.shipped) ||
        (whitelist.shipped.includes("Not shipped") && !set.shipped);
      const favoritesBool = this.state.user.email
        ? !whitelist.favorites || (whitelist.favorites && favorites.includes(set.id))
        : true;
      if (set.vendors && set.vendors.length > 0) {
        return vendorBool(set) && whitelist.profiles.includes(set.profile) && shippedBool && favoritesBool;
      } else {
        if (whitelist.vendors.length === 1 && whitelist.vendorMode === "include") {
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
      const array = search
        .toLowerCase()
        .split(" ")
        .map((term) => {
          return setInfo.join(" ").toLowerCase().includes(term.toLowerCase());
        });
      const bool = !array.includes(false);
      return search.length > 0 ? bool : true;
    };

    const filteredSets = sets.filter((set) => hiddenBool(set) && pageBool(set) && filterBool(set) && searchBool(set));

    this.createGroups(sort, sortOrder, filteredSets);

    // create default preset

    const filteredPresets = this.state.appPresets.filter((preset) => preset.id !== "default");

    const defaultPreset = new Preset(
      "Default",
      false,
      false,
      false,
      allProfiles,
      ["Shipped", "Not shipped"],
      "exclude",
      [],
      "default"
    );

    const presets = [defaultPreset, ...filteredPresets];

    // set states
    this.setState({
      filteredSets: filteredSets,
      allRegions: allRegions,
      allVendors: allVendors,
      allDesigners: allDesigners,
      profiles: allProfiles,
      content: filteredSets.length > 0,
      loading: false,
      appPresets: presets,
    });

    if (!this.state.currentPreset.name) {
      this.setState({ currentPreset: defaultPreset });
    }

    if (whitelist.edited && !whitelist.edited.includes("profiles")) {
      this.setWhitelist("profiles", allProfiles, false);
    }
  };

  /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */
  debouncedFilterData = (
    _page = this.state.page,
    _sets = this.state.sets,
    _sort = this.state.sort,
    _sortOrder = this.state.sortOrder,
    _search = this.state.search,
    _whitelist = this.state.whitelist,
    _favorites = this.state.favorites,
    _hidden = this.state.hidden
  ) => {
    // placeholder - gets overwritten in constructor
  };
  /* eslint-disable no-unused-vars, @typescript-eslint/no-unused-vars */

  sortData = (sort = this.state.sort, sortOrder = this.state.sortOrder, groups = this.state.groups) => {
    const array = [...groups];
    array.sort(function (a, b) {
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
    this.setState({ groups: array });
  };

  createGroups = (sort = this.state.sort, sortOrder = this.state.sortOrder, sets = this.state.filteredSets) => {
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
    this.setState({ groups: groups });
  };

  setDensity = (density: string, write = true) => {
    this.setState({ density: density });
    if (write) {
      this.setStorage("density", density);
      this.syncSetting("density", density);
    }
  };
  setSort = (sort: string, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    let sortOrder: SortOrderType = "ascending";
    if (dateSorts.includes(sort) && reverseSortDatePages.includes(this.state.page)) {
      sortOrder = "descending";
    }
    this.setState({ sort: sort, sortOrder: sortOrder });
    this.createGroups(sort, sortOrder);
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("sort");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  setSortOrder = (sortOrder: SortOrderType, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    this.setState({ sortOrder: sortOrder });
    this.sortData(this.state.sort, sortOrder);
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("sortOrder");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  setSearch = (query: string) => {
    this.setState({
      search: query,
    });
    document.documentElement.scrollTop = 0;
    this.debouncedFilterData(this.state.page, this.state.sets, this.state.sort, this.state.sortOrder, query);
  };
  setUser = (user: Partial<CurrentUserType>) => {
    const blankUser = {
      email: "",
      name: "",
      avatar: "",
      nickname: "",
      isDesigner: false,
      isEditor: false,
      isAdmin: false,
      id: "",
    };
    const newUser = user.email ? { ...blankUser, ...user } : blankUser;
    this.setState({ user: newUser });
  };
  setStatisticsTab = (tab: string, clearUrl = true) => {
    document.documentElement.scrollTop = 0;
    this.setState({ statisticsTab: tab });
    if (clearUrl) {
      const params = new URLSearchParams(window.location.search);
      params.delete("statisticsTab");
      const questionParam = params.has("page") ? "?" + params.toString() : "/";
      window.history.pushState({}, "KeycapLendar", questionParam);
    }
  };
  setWhitelist = (prop: string, val: WhitelistType | WhitelistType[keyof WhitelistType], clearUrl = true) => {
    if (prop === "all" && typeof val === "object" && !(val instanceof Array)) {
      const edited = Object.keys(val).filter((key) => {
        if (hasKey(val, key)) {
          const value = val[key];
          return value && value instanceof Array && value.length > 0;
        } else {
          return false;
        }
      });
      const whitelist = { ...this.state.whitelist, ...val, edited: edited };
      this.setState({ whitelist: whitelist });
      document.documentElement.scrollTop = 0;
      if (this.state.sets.length > 0) {
        this.filterData(
          this.state.page,
          this.state.sets,
          this.state.sort,
          this.state.sortOrder,
          this.state.search,
          whitelist
        );
      }
    } else if (this.state.whitelist.edited) {
      const edited = this.state.whitelist.edited.includes(prop)
        ? this.state.whitelist.edited
        : [...this.state.whitelist.edited, prop];
      const whitelist = { ...this.state.whitelist, [prop]: val, edited: edited };
      this.setState({
        whitelist: whitelist,
      });
      document.documentElement.scrollTop = 0;
      if (this.state.sets.length > 0) {
        this.filterData(
          this.state.page,
          this.state.sets,
          this.state.sort,
          this.state.sortOrder,
          this.state.search,
          whitelist
        );
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
            if (page) {
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
  setDevice = () => {
    let i = 0;
    let device;
    let lastWidth = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
    const calculate = () => {
      const vw = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
      if (vw !== lastWidth || i === 0) {
        if (vw >= 840) {
          device = "desktop";
          if (this.state.device !== device) {
            this.setState({ device: device });
          }
        } else if (vw < 840 && vw >= 480) {
          device = "tablet";
          if (this.state.device !== device) {
            this.setState({ device: device });
          }
        } else {
          device = "mobile";
          if (this.state.device !== device) {
            this.setState({ device: device });
          }
        }
        lastWidth = vw;
        i++;
      }
    };
    calculate();
    window.addEventListener("resize", calculate);
  };
  getGlobals = () => {
    db.collection("app")
      .doc("globals")
      .get()
      .then((doc) => {
        const data = doc.data();
        const { filterPresets } = data as GlobalDoc;
        if (filterPresets) {
          const defaultPreset = this.findPreset("name", "Default");
          if (defaultPreset) {
            this.setState({ appPresets: [defaultPreset, ...filterPresets] });
          } else {
            this.setState({ appPresets: filterPresets });
          }
        }
      })
      .catch((error) => {
        console.log("Failed to get global settings: " + error);
        queue.notify({ title: "Failed to get global settings: " + error });
      });
  };
  getUserPreferences = (id: string) => {
    if (id) {
      db.collection("users")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            const { favorites, hidden, settings, syncSettings, filterPresets } = data as UserPreferencesDoc;

            if (favorites instanceof Array) {
              this.setState({ favorites: favorites });
            }
            if (hidden instanceof Array) {
              this.setState({ hidden: hidden });
            }

            if (filterPresets) {
              this.setState({ userPresets: filterPresets });
              const storedPreset = this.getStorage("presetId");
              if (storedPreset && storedPreset !== "default") {
                this.selectPreset(storedPreset, false);
              }
            }

            if (typeof syncSettings === "boolean") {
              this.setSyncSettings(syncSettings, false);
              if (syncSettings) {
                console.log(settings);
                const getSetting = (setting: string, setFunction: (val: any, write: boolean) => void) => {
                  if (settings && hasKey(settings, setting)) {
                    setFunction(settings[setting], false);
                  }
                };
                Object.keys(settingsFunctions).forEach((setting) => {
                  if (hasKey(settingsFunctions, setting)) {
                    const key = settingsFunctions[setting];
                    if (hasKey<App>(this, key)) {
                      const func = this[key];
                      getSetting(setting, func);
                    }
                  }
                });
              }
            }

            this.filterData(
              this.state.page,
              this.state.sets,
              this.state.sort,
              this.state.sortOrder,
              this.state.search,
              this.state.whitelist,
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
  toggleFavorite = (id: string) => {
    const favorites = addOrRemove([...this.state.favorites], id);
    this.setState({ favorites: favorites });
    if (this.state.page === "favorites") {
      this.filterData(
        this.state.page,
        this.state.sets,
        this.state.sort,
        this.state.sortOrder,
        this.state.search,
        this.state.whitelist,
        favorites
      );
    }
    if (this.state.user.id) {
      db.collection("users")
        .doc(this.state.user.id)
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
  toggleHidden = (id: string) => {
    const hidden = addOrRemove([...this.state.hidden], id);
    this.setState({ hidden: hidden });
    this.filterData(
      this.state.page,
      this.state.sets,
      this.state.sort,
      this.state.sortOrder,
      this.state.search,
      this.state.whitelist,
      this.state.favorites,
      hidden
    );
    const setHidden = hidden.includes(id);
    queue.notify({
      title: `Set ${setHidden ? "hidden" : "unhidden"}.`,
      actions: [
        {
          label: "Undo",
          onClick: () => {
            this.toggleHidden(id);
          },
        },
      ],
      timeout: 2500,
      dismissesOnAction: true,
    });
    if (this.state.user.id) {
      db.collection("users")
        .doc(this.state.user.id)
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
  setSyncSettings = (bool: boolean, write = true) => {
    this.setState({ syncSettings: bool });
    if (write) {
      const settingsObject: { [key: string]: any } = {};
      if (bool) {
        Object.keys(settingsFunctions).forEach((setting) => {
          if (hasKey(this.state, setting)) {
            settingsObject[setting] = this.state[setting];
          }
        });
      }
      db.collection("users")
        .doc(this.state.user.id)
        .set({ syncSettings: bool, settings: settingsObject }, { merge: true })
        .catch((error) => {
          console.log("Failed to set sync setting: " + error);
          queue.notify({ title: "Failed to set sync setting: " + error });
        });
    }
  };
  syncSetting = (setting: string, value: any) => {
    if (this.state.user.id && this.state.syncSettings) {
      const userDocRef = db.collection("users").doc(this.state.user.id);
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
  findPreset = (prop: keyof PresetType, val: string): PresetType | undefined => {
    const allPresets = [...this.state.appPresets, ...this.state.userPresets];
    const preset = allPresets.filter((preset) => preset[prop] === val)[0];
    return preset;
  };
  selectPreset = (id: string, write = true) => {
    const preset = this.findPreset("id", id);
    if (preset) {
      this.setState({ currentPreset: preset });
      this.setWhitelist("all", preset.whitelist);
    }
    if (write) {
      this.setStorage("presetId", id);
    }
  };
  newPreset = (preset: PresetType) => {
    preset.id = nanoid();
    const presets = [...this.state.userPresets, preset];
    alphabeticalSortProp(presets, "name", false);
    this.setState({ userPresets: presets, currentPreset: preset });
    this.syncPresets(presets);
  };
  editPreset = (preset: PresetType) => {
    const savedPreset = this.findPreset("id", preset.id);
    let presets: PresetType[];
    if (savedPreset) {
      const index = this.state.userPresets.indexOf(savedPreset);
      presets = [...this.state.userPresets];
      presets[index] = preset;
    } else {
      presets = [...this.state.userPresets, preset];
    }
    alphabeticalSortProp(presets, "name", false);
    this.setState({ userPresets: presets, currentPreset: preset });
    this.syncPresets(presets);
  };
  deletePreset = (preset: PresetType) => {
    const presets = this.state.userPresets.filter((filterPreset) => filterPreset.id !== preset.id);
    alphabeticalSortProp(presets, "name", false);
    const defaultPreset = this.findPreset("id", "default");
    if (defaultPreset) {
      this.setState({
        userPresets: presets,
        currentPreset: defaultPreset,
      });
    }
    this.syncPresets(presets);
  };
  syncPresets = (presets = this.state.userPresets) => {
    const sortedPresets = alphabeticalSortProp(presets, "name", false, "Default").map((preset) => ({
      ...preset,
    }));
    db.collection("users")
      .doc(this.state.user.id)
      .set({ filterPresets: sortedPresets }, { merge: true })
      .catch((error) => {
        console.log("Failed to sync presets: " + error);
        queue.notify({ title: "Failed to sync presets: " + error });
      });
  };
  newGlobalPreset = (preset: PresetType) => {
    preset.id = nanoid();
    const presets = [...this.state.appPresets, preset];
    alphabeticalSortProp(presets, "name", false, "Default");
    this.setState({ appPresets: presets, currentPreset: preset });
    this.syncGlobalPresets(presets);
  };
  editGlobalPreset = (preset: PresetType) => {
    const savedPreset = this.findPreset("id", preset.id);
    let presets: PresetType[];
    if (savedPreset) {
      const index = this.state.appPresets.indexOf(savedPreset);
      presets = [...this.state.appPresets];
      presets[index] = preset;
    } else {
      presets = [...this.state.appPresets, preset];
    }
    alphabeticalSortProp(presets, "name", false, "Default");
    this.setState({ appPresets: presets, currentPreset: preset });
    this.syncGlobalPresets(presets);
  };
  deleteGlobalPreset = (preset: PresetType) => {
    const presets = this.state.appPresets.filter((filterPreset) => filterPreset.id !== preset.id);
    alphabeticalSortProp(presets, "name", false, "Default");
    const defaultPreset = this.findPreset("id", "default");
    if (defaultPreset) {
      this.setState({
        appPresets: presets,
        currentPreset: defaultPreset,
      });
    }
    this.syncGlobalPresets(presets);
  };
  syncGlobalPresets = (presets = this.state.appPresets) => {
    const filteredPresets = presets.filter((preset) => preset.name !== "Default");
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
  unregisterAuthObserver = () => {
    // placeholder - gets defined when component mounts
  };
  componentDidMount() {
    this.setDevice();
    this.getURLQuery();
    this.checkStorage();
    this.checkTheme();
    this.getGlobals();
    const meta = document.querySelector("meta[name=theme-color]");
    if (meta) {
      meta.setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
    }
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const getClaimsFn = firebase.functions().httpsCallable("getClaims");
        getClaimsFn()
          .then((result) => {
            this.setUser({
              email: user.email ? user.email : "",
              name: user.displayName ? user.displayName : "",
              avatar: user.photoURL ? user.photoURL : "",
              id: user.uid,
              nickname: result.data.nickname,
              isDesigner: result.data.designer,
              isEditor: result.data.editor,
              isAdmin: result.data.admin,
            });
          })
          .catch((error) => {
            queue.notify({ title: "Error verifying custom claims: " + error });
            this.setUser({
              email: user.email ? user.email : "",
              name: user.displayName ? user.displayName : "",
              avatar: user.photoURL ? user.photoURL : "",
              id: user.uid,
            });
          });
        this.getUserPreferences(user.uid);
      } else {
        this.setUser({});
        const defaultPreset = this.findPreset("id", "default");
        const defaultSettings: Partial<AppState> = {
          favorites: [],
          hidden: [],
          userPresets: [],
        };
        if (defaultPreset) {
          this.setState<never>({ preset: defaultPreset, ...defaultSettings });
        } else {
          this.setState<never>(defaultSettings);
        }
      }
    });
  }
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const transitionClass = classNames({ "view-transition": this.state.transition });
    return (
      <Router>
        <Switch>
          <Route path="/login">
            <UserContext.Provider
              value={{
                user: this.state.user,
                setUser: this.setUser,
                favorites: this.state.favorites,
                toggleFavorite: this.toggleFavorite,
                hidden: this.state.hidden,
                toggleHidden: this.toggleHidden,
                syncSettings: this.state.syncSettings,
                setSyncSettings: this.setSyncSettings,
                preset: this.state.currentPreset,
                presets: this.state.userPresets,
                selectPreset: this.selectPreset,
                newPreset: this.newPreset,
                editPreset: this.editPreset,
                deletePreset: this.deletePreset,
                newGlobalPreset: this.newGlobalPreset,
                editGlobalPreset: this.editGlobalPreset,
                deleteGlobalPreset: this.deleteGlobalPreset,
              }}
            >
              <DeviceContext.Provider value={this.state.device}>
                <Login />
              </DeviceContext.Provider>
            </UserContext.Provider>
          </Route>
          <Route path="/privacy" component={PrivacyPolicy} />
          <Route path="/terms" component={TermsOfService} />
          <Route path="/guide/entries">
            <DeviceContext.Provider value={this.state.device}>
              <EntryGuide />
            </DeviceContext.Provider>
          </Route>
          <Route exact path="/">
            <UserContext.Provider
              value={{
                user: this.state.user,
                setUser: this.setUser,
                favorites: this.state.favorites,
                toggleFavorite: this.toggleFavorite,
                hidden: this.state.hidden,
                toggleHidden: this.toggleHidden,
                syncSettings: this.state.syncSettings,
                setSyncSettings: this.setSyncSettings,
                preset: this.state.currentPreset,
                presets: this.state.userPresets,
                selectPreset: this.selectPreset,
                newPreset: this.newPreset,
                editPreset: this.editPreset,
                deletePreset: this.deletePreset,
                newGlobalPreset: this.newGlobalPreset,
                editGlobalPreset: this.editGlobalPreset,
                deleteGlobalPreset: this.deleteGlobalPreset,
              }}
            >
              <DeviceContext.Provider value={this.state.device}>
                <div
                  className={classNames("app", { [`density-${this.state.density}`]: this.state.device === "desktop" })}
                >
                  <Content
                    allSets={this.state.sets}
                    getData={this.getData}
                    className={transitionClass}
                    page={this.state.page}
                    setPage={this.setPage}
                    view={this.state.view}
                    setView={this.setView}
                    profiles={this.state.profiles}
                    allDesigners={this.state.allDesigners}
                    allVendors={this.state.allVendors}
                    allRegions={this.state.allRegions}
                    appPresets={this.state.appPresets}
                    sets={this.state.filteredSets}
                    groups={this.state.groups}
                    loading={this.state.loading}
                    toggleLoading={this.toggleLoading}
                    sort={this.state.sort}
                    setSort={this.setSort}
                    sortOrder={this.state.sortOrder}
                    setSortOrder={this.setSortOrder}
                    content={this.state.content}
                    search={this.state.search}
                    setSearch={this.setSearch}
                    applyTheme={this.state.applyTheme}
                    setApplyTheme={this.setApplyTheme}
                    lightTheme={this.state.lightTheme}
                    setLightTheme={this.setLightTheme}
                    darkTheme={this.state.darkTheme}
                    setDarkTheme={this.setDarkTheme}
                    manualTheme={this.state.manualTheme}
                    setManualTheme={this.setManualTheme}
                    fromTimeTheme={this.state.fromTimeTheme}
                    setFromTimeTheme={this.setFromTimeTheme}
                    toTimeTheme={this.state.toTimeTheme}
                    setToTimeTheme={this.setToTimeTheme}
                    toggleLichTheme={this.toggleLichTheme}
                    bottomNav={this.state.bottomNav && this.state.device === "mobile"}
                    setBottomNav={this.setBottomNav}
                    setWhitelist={this.setWhitelist}
                    whitelist={this.state.whitelist}
                    statisticsTab={this.state.statisticsTab}
                    setStatisticsTab={this.setStatisticsTab}
                    density={this.state.density}
                    setDensity={this.setDensity}
                    snackbarQueue={queue}
                  />
                  <SnackbarQueue messages={queue.messages} />
                  <SnackbarCookies open={!this.state.cookies} accept={this.acceptCookies} clear={this.clearCookies} />
                </div>
              </DeviceContext.Provider>
            </UserContext.Provider>
          </Route>
          <Route component={NotFound} />
        </Switch>
      </Router>
    );
  }
}

export default App;
