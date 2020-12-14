import React from "react";
import firebase from "./components/firebase";
import moment from "moment";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createSnackbarQueue, SnackbarQueue } from "@rmwc/snackbar";
import { DesktopContent, TabletContent, MobileContent } from "./components/Content";
import { Login } from "./components/admin/Login";
import { EntryGuide } from "./components/guides/Guides";
import { PrivacyPolicy, TermsOfService } from "./components/common/Legal";
import { SnackbarCookies } from "./components/common/SnackbarCookies";
import { UserContext, DeviceContext } from "./components/util/contexts";
import "./App.scss";

const db = firebase.firestore();

const queue = createSnackbarQueue();
const title = {
  calendar: "Calendar",
  live: "Live GBs",
  ic: "IC Tracker",
  previous: "Previous Sets",
  account: "Account",
  timeline: "Timeline",
  archive: "Archive",
  favorites: "Favorites",
  statistics: "Statistics",
  audit: "Audit Log",
  users: "Users",
  settings: "Settings",
};

const addOrRemove = (array, value) => {
  const index = array.indexOf(value);

  if (index === -1) {
    array.push(value);
  } else {
    array.splice(index, 1);
  }

  return array;
};

const settingsFunctions = {
  view: "setView",
  bottomNav: "setBottomNav",
  applyTheme: "setApplyTheme",
  lightTheme: "setLightTheme",
  darkTheme: "setDarkTheme",
  manualTheme: "setManualTheme",
  fromTimeTheme: "setFromTimeTheme",
  toTimeTheme: "setToTimeTheme",
  density: "setDensity",
};

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: "desktop",
      deviceEdited: false,
      bottomNav: false,
      page: "calendar",
      view: "card",
      transition: false,
      sort: "gbLaunch",
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
        email: null,
        name: null,
        avatar: null,
        isEditor: false,
        isAdmin: false,
        nickname: "",
        isDesigner: false,
        id: null,
      },
      favorites: [],
      whitelist: {
        edited: [],
        favorites: false,
        profiles: [],
        shipped: ["Shipped", "Not shipped"],
        vendorMode: "include",
        vendors: [],
      },
      cookies: true,
      applyTheme: "manual",
      lightTheme: "light",
      darkTheme: "deep",
      manualTheme: false,
      fromTimeTheme: "21:00",
      toTimeTheme: "06:00",
      lichTheme: false,
      statistics: {
        timeline: "gbLaunch",
        status: "profile",
        shipped: "profile",
        durationCat: "gbLaunch",
        durationGroup: "profile",
      },
      statisticsSort: { status: "alphabetical", shipped: "alphabetical", duration: "alphabetical" },
      statisticsTab: "timeline",
      density: "default",
      syncSettings: false,
    };
  }
  getURLQuery = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) {
      const pageQuery = params.get("page");
      const pages = [
        "calendar",
        "live",
        "ic",
        "previous",
        "timeline",
        "archive",
        "favorites",
        "statistics",
        "audit",
        "users",
        "settings",
      ];
      if (pages.includes(pageQuery)) {
        this.setState({ page: pageQuery });
        if (pageQuery === "calendar") {
          this.setState({ sort: "gbLaunch" });
        } else if (pageQuery === "live") {
          this.setState({ sort: "gbEnd" });
        } else if (pageQuery === "ic") {
          this.setState({ sort: "profile" });
        } else if (pageQuery === "previous") {
          this.setState({ sort: "gbLaunch" });
        } else if (pageQuery === "timeline") {
          this.setState({ sort: "gbLaunch" });
        } else if (pageQuery === "archive") {
          this.setState({ sort: "profile" });
        }
      }
    }
    if (params.has("profile") || params.has("profiles")) {
      if (params.has("profile")) {
        const profile = [params.get("profile")];
        this.setWhitelist("profiles", profile, false);
      } else {
        const profiles = params
          .get("profiles")
          .split(" ")
          .map((profile) => profile.replace("-", " "));
        this.setWhitelist("profiles", profiles, false);
      }
    }
    this.getData();
  };
  acceptCookies = () => {
    this.setState({ cookies: true });
    this.setCookie("accepted", true, 356);
  };
  clearCookies = () => {
    this.setState({ cookies: false });
    this.setCookie("accepted", false, -1);
  };
  setCookie(cname, cvalue, exdays) {
    if (this.state.cookies || cname === "accepted") {
      let d = new Date();
      d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
      const expires = "expires=" + d.toUTCString();
      document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    }
  }
  getCookie(cname) {
    var name = cname + "=";
    var decodedCookie = decodeURIComponent(document.cookie);
    var ca = decodedCookie.split(";");
    for (var i = 0; i < ca.length; i++) {
      var c = ca[i];
      while (c.charAt(0) === " ") {
        c = c.substring(1);
      }
      if (c.indexOf(name) === 0) {
        return c.substring(name.length, c.length);
      }
    }
    return "";
  }
  checkCookies = () => {
    const accepted = this.getCookie("accepted");
    if (accepted !== "" && accepted) {
      this.setState({ cookies: true });
      const checkCookie = (key, setFunction) => {
        const cookie = this.getCookie(key);
        if (cookie !== "") {
          if (cookie !== "true" && cookie !== "false") {
            setTimeout(() => {
              setFunction(cookie, false);
            }, 0);
          } else {
            const cookieBool = cookie === "true";
            setTimeout(() => {
              setFunction(cookieBool, false);
            }, 0);
          }
        }
      };

      // legacy theme cookie conversion

      const legacyTheme = this.getCookie("theme");
      if (legacyTheme !== "") {
        if (legacyTheme === "light") {
          this.setManualTheme(false);
        } else {
          this.setManualTheme(true);
          this.setDarkTheme(legacyTheme);
        }
        this.setCookie("theme", legacyTheme, -1);
      }
      Object.keys(settingsFunctions).forEach((setting) => {
        checkCookie(setting, this[settingsFunctions[setting]]);
      });
    } else {
      this.clearCookies();
    }
  };
  setView = (view, write = true) => {
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
      this.setCookie("view", view, 365);
      this.syncSetting("view", view);
    }
  };
  setPage = (page) => {
    if (page !== this.state.page && !this.state.loading) {
      this.setState({ transition: true });
      setTimeout(() => {
        this.setState({ page: page });
        this.setSearch("");
        if (page === "calendar") {
          this.setState({ sort: "gbLaunch" });
        } else if (page === "live") {
          this.setState({ sort: "gbEnd" });
        } else if (page === "ic") {
          this.setState({ sort: "profile" });
        } else if (page === "previous") {
          this.setState({ sort: "gbLaunch" });
        } else if (page === "timeline") {
          this.setState({ sort: "gbLaunch" });
        } else if (page === "archive") {
          this.setState({ sort: "profile" });
        } else if (page === "favorites") {
          this.setState({ sort: "profile" });
        }
        this.filterData(page);
        document.documentElement.scrollTop = 0;
      }, 90);
      setTimeout(() => {
        this.setState({ transition: false });
      }, 300);
      document.title = "KeycapLendar: " + title[page];
      const params = new URLSearchParams(window.location.search);
      params.set("page", page);
      window.history.pushState(
        {
          page: page,
        },
        "KeycapLendar: " + title[page],
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

    const currentDay = new Date();
    const fromArray = this.state.fromTimeTheme.split(":");
    const fromTime = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate(),
      parseInt(fromArray[0]),
      parseInt(fromArray[1]),
      "00"
    );
    const toArray = this.state.toTimeTheme.split(":");
    const toTime = new Date(
      currentDay.getFullYear(),
      currentDay.getMonth(),
      currentDay.getDate(),
      parseInt(toArray[0]),
      parseInt(toArray[1]),
      "00"
    );
    const timedBool = this.state.applyTheme === "timed" && (currentDay >= fromTime || currentDay <= toTime);
    return manualBool || systemBool || timedBool;
  };
  checkTheme = async () => {
    const themeBool = await this.isDarkTheme();
    document.querySelector("html").classList = this.state.lichTheme
      ? "lich"
      : themeBool === true || themeBool === "true"
      ? this.state.darkTheme
      : this.state.lightTheme;
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
  };
  setApplyTheme = (applyTheme, write = true) => {
    this.setState({
      applyTheme: applyTheme,
    });
    if (applyTheme === "system") {
      setTimeout(this.checkTheme, 1);
      window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", (e) => {
        e.preventDefault();
        this.checkTheme();
      });
    } else if (applyTheme === "timed") {
      setTimeout(this.checkTheme, 1);
      setInterval(this.checkTheme, 1000 * 60);
    } else {
      setTimeout(this.checkTheme, 1);
    }
    if (applyTheme !== "timed") {
      clearInterval(this.checkTheme);
    }
    if (write) {
      this.setCookie("applyTheme", applyTheme, 365);
      this.syncSetting("applyTheme", applyTheme);
    }
  };
  setLightTheme = (theme, write = true) => {
    this.setState({ lightTheme: theme });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setCookie("lightTheme", theme, 365);
      this.syncSetting("lightTheme", theme);
    }
  };
  setDarkTheme = (theme, write = true) => {
    this.setState({ darkTheme: theme });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setCookie("darkTheme", theme, 365);
      this.syncSetting("darkTheme", theme);
    }
  };
  setManualTheme = (bool, write = true) => {
    this.setState({ manualTheme: bool });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setCookie("manualTheme", bool, 365);
      this.syncSetting("manualTheme", bool);
    }
  };
  setFromTimeTheme = (time, write = true) => {
    this.setState({ fromTimeTheme: time });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setCookie("fromTimeTheme", time, 365);
      this.syncSetting("fromTimeTheme", time);
    }
  };
  setToTimeTheme = (time, write = true) => {
    this.setState({ toTimeTheme: time });
    setTimeout(this.checkTheme, 1);
    if (write) {
      this.setCookie("toTimeTheme", time, 365);
      this.syncSetting("toTimeTheme", time);
    }
  };
  toggleLichTheme = () => {
    this.setState((prevState) => {
      return { lichTheme: !prevState.lichTheme };
    });
    setTimeout(this.checkTheme, 1);
  };
  setBottomNav = (value, write = true) => {
    document.documentElement.scrollTop = 0;
    this.setState({ bottomNav: value });
    if (write) {
      this.setCookie("bottomNav", value, 365);
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
        let sets = [];
        querySnapshot.forEach((doc) => {
          if (doc.data().profile) {
            const lastOfMonth = moment(doc.data().gbLaunch).daysInMonth();
            const gbLaunch =
              doc.data().gbMonth && doc.data().gbLaunch !== ""
                ? doc.data().gbLaunch + "-" + lastOfMonth
                : doc.data().gbLaunch;
            sets.push({
              id: doc.id,
              profile: doc.data().profile,
              colorway: doc.data().colorway,
              designer: doc.data().designer,
              icDate: doc.data().icDate,
              details: doc.data().details,
              sales: doc.data().sales,
              image: doc.data().image,
              gbMonth: doc.data().gbMonth,
              gbLaunch: gbLaunch,
              gbEnd: doc.data().gbEnd,
              shipped: doc.data().shipped,
              vendors: doc.data().vendors,
            });
          }
        });

        sets.sort(function (a, b) {
          var x = a.colorway.toLowerCase();
          var y = b.colorway.toLowerCase();
          if (x < y) {
            return -1;
          }
          if (x > y) {
            return 1;
          }
          return 0;
        });

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
    search = this.state.search,
    whitelist = this.state.whitelist,
    favorites = this.state.favorites
  ) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let pageSets = [];
    let allRegions = [];
    let allVendors = [];
    let allProfiles = [];
    let allDesigners = [];
    let groups = [];

    // page logic
    if (page === "calendar") {
      pageSets = sets.filter((set) => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setUTCHours(23, 59, 59, 999);
        return startDate > today || (startDate <= today && (endDate >= yesterday || set.gbEnd === ""));
      });
    } else if (page === "live") {
      pageSets = sets.filter((set) => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setUTCHours(23, 59, 59, 999);
        return startDate <= today && (endDate >= yesterday || set.gbEnd === "");
      });
    } else if (page === "ic") {
      pageSets = sets.filter((set) => {
        const startDate = set.gbLaunch.includes("Q") || set.gbLaunch === "" ? set.gbLaunch : new Date(set.gbLaunch);
        return !startDate || startDate === "" || set.gbLaunch.includes("Q");
      });
    } else if (page === "previous") {
      pageSets = sets.filter((set) => {
        const endDate = new Date(set.gbEnd);
        endDate.setUTCHours(23, 59, 59, 999);
        return endDate <= yesterday;
      });
    } else if (page === "timeline") {
      pageSets = sets.filter((set) => {
        return set.gbLaunch !== "" && !set.gbLaunch.includes("Q");
      });
    } else if (page === "archive") {
      pageSets = sets;
    } else if (page === "favorites") {
      pageSets = sets.filter((set) => {
        return favorites.includes(set.id);
      });
    }

    // lists
    sets.forEach((set) => {
      if (set.vendors[0]) {
        set.vendors.forEach((vendor) => {
          if (!allVendors.includes(vendor.name)) {
            allVendors.push(vendor.name);
          }
          if (!allRegions.includes(vendor.region)) {
            allRegions.push(vendor.region);
          }
        });
      }
      set.designer.forEach((designer) => {
        if (!allDesigners.includes(designer)) {
          allDesigners.push(designer);
        }
      });
      if (!allProfiles.includes(set.profile)) {
        allProfiles.push(set.profile);
      }
    });

    allVendors.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    allRegions.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    allProfiles.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    allDesigners.sort(function (a, b) {
      var x = a.toLowerCase();
      var y = b.toLowerCase();
      if (x < y) {
        return -1;
      }
      if (x > y) {
        return 1;
      }
      return 0;
    });

    // whitelist logic
    const checkVendors = (set) => {
      let bool = whitelist.vendorMode === "exclude";
      Object.keys(set.vendors).forEach((key) => {
        const vendor = set.vendors[key];
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
      return bool;
    };
    const filteredSets = pageSets.filter((set) => {
      const shippedBool =
        (whitelist.shipped.includes("Shipped") && set.shipped) ||
        (whitelist.shipped.includes("Not shipped") && !set.shipped);
      const favoritesBool = !whitelist.favorites || (whitelist.favorites && favorites.includes(set.id));
      if (set.vendors.length > 0) {
        return checkVendors(set) && whitelist.profiles.includes(set.profile) && shippedBool && favoritesBool;
      } else {
        if (whitelist.vendors.length === 1 && whitelist.vendorMode === "include") {
          return false;
        } else {
          return whitelist.profiles.includes(set.profile) && shippedBool && favoritesBool;
        }
      }
    });

    // search logic

    const replaceChars = [
      ["β", "B"],
      ["æ", "ae"],
    ];

    const replaceFunction = (string) => {
      let val = string;
      replaceChars.forEach((set) => {
        val = val.replace(set[0], set[1]);
      });
      return val;
    };

    const searchSets = (search) => {
      return filteredSets.filter((set) => {
        let setInfo = [
          set.profile,
          set.colorway,
          replaceFunction(set.colorway)
            .normalize("NFD")
            .replace(/[^a-zA-Z0-9 ]/g, ""),
          set.designer.join(" "),
          set.vendors.map((vendor) => ` ${vendor.name} ${vendor.region}`),
        ];
        const array = search
          .toLowerCase()
          .split(" ")
          .map((term) => {
            return setInfo.join(" ").toLowerCase().includes(term.toLowerCase());
          });
        const bool = !array.includes(false);
        return bool;
      });
    };

    const searchedSets = search !== "" ? searchSets(search) : filteredSets;

    // group display
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    searchedSets.forEach((set) => {
      if (sort === "icDate" || sort === "gbLaunch" || sort === "gbEnd") {
        const setDate = new Date(set[sort]);
        let setMonth = `${months[setDate.getUTCMonth()]} ${setDate.getUTCFullYear()}`;
        if (!groups.includes(setMonth) && setMonth !== "undefined NaN") {
          groups.push(setMonth);
        }
      } else if (sort === "vendor") {
        if (set.vendors[0]) {
          if (!groups.includes(set.vendors[0].name)) {
            groups.push(set.vendors[0].name);
          }
        }
      } else if (sort === "designer") {
        if (set.designer[0]) {
          set.designer.forEach((designer) => {
            if (!groups.includes(designer)) {
              groups.push(designer);
            }
          });
        }
      } else {
        if (!groups.includes(set[sort])) {
          groups.push(set[sort]);
        }
      }
    });
    groups.sort(function (a, b) {
      if (sort === "icDate" || sort === "gbLaunch" || sort === "gbEnd") {
        const aMonth = "0" + (months.indexOf(a.slice(0, -5)) + 1);
        const bMonth = "0" + (months.indexOf(b.slice(0, -5)) + 1);
        const aDate = `${a.slice(-4)}-${aMonth.slice(-2)}-01`;
        const bDate = `${b.slice(-4)}-${bMonth.slice(-2)}-01`;
        if (page === "previous" || page === "ic") {
          if (aDate < bDate) {
            return 1;
          }
          if (aDate > bDate) {
            return -1;
          }
        } else {
          if (aDate < bDate) {
            return -1;
          }
          if (aDate > bDate) {
            return 1;
          }
        }
      } else {
        const x = a.toLowerCase();
        const y = b.toLowerCase();
        if (x < y) {
          return -1;
        }
        if (x > y) {
          return 1;
        }
      }
      return 0;
    });

    // set states
    this.setState({
      filteredSets: searchedSets,
      allRegions: allRegions,
      allVendors: allVendors,
      allDesigners: allDesigners,
      profiles: allProfiles,
      groups: groups,
      content: searchedSets.length > 0,
      loading: false,
    });

    if (!whitelist.edited.includes("vendors")) {
      this.setWhitelist("vendors", allVendors, false);
    }

    if (!whitelist.edited.includes("profiles")) {
      this.setWhitelist("profiles", allProfiles, false);
    }
  };
  setDensity = (density, write = true) => {
    this.setState({ density: density });
    if (write) {
      this.setCookie("density", density, 365);
      this.syncSetting("density", density);
    }
  };
  setSort = (sortBy) => {
    document.documentElement.scrollTop = 0;
    this.setState({ sort: sortBy });
    this.filterData(this.state.page, this.state.sets, sortBy);
  };
  setSearch = (query) => {
    this.setState({
      search: query,
    });
    document.documentElement.scrollTop = 0;
    this.filterData(this.state.page, this.state.sets, this.state.sort, query);
  };
  setUser = (user) => {
    const blankUser = {
      email: null,
      name: null,
      avatar: null,
      nickname: "",
      isDesigner: false,
      isEditor: false,
      isAdmin: false,
      id: null,
    };
    const newUser = user.email ? { ...blankUser, ...user } : blankUser;
    this.setState({ user: newUser });
  };
  setStatistics = (prop, query) => {
    this.setState({ statistics: { ...this.state.statistics, [prop]: query } });
  };
  setStatisticsSort = (prop, query) => {
    this.setState({ statisticsSort: { ...this.state.statisticsSort, [prop]: query } });
  };
  setStatisticsTab = (tab) => {
    document.documentElement.scrollTop = 0;
    this.setState({ statisticsTab: tab });
  };
  setWhitelist = (prop, val, clearUrl = true) => {
    if (prop === "all") {
      const edited = Object.keys(val);
      const whitelist = { ...this.state.whitelist, ...val, edited: edited };
      this.setState({ whitelist: whitelist });
      document.documentElement.scrollTop = 0;
      if (this.state.sets.length > 0) {
        this.filterData(this.state.page, this.state.sets, this.state.sort, this.props.search, whitelist);
      }
    } else {
      const edited = this.state.whitelist.edited.includes(prop)
        ? this.state.whitelist.edited
        : [...this.state.whitelist.edited, prop];
      const whitelist = { ...this.state.whitelist, [prop]: val, edited: edited };
      this.setState({
        whitelist: whitelist,
      });
      document.documentElement.scrollTop = 0;
      if (this.state.sets.length > 0) {
        this.filterData(this.state.page, this.state.sets, this.state.sort, this.props.search, whitelist);
      }
      if (clearUrl) {
        const params = new URLSearchParams(window.location.search);
        if (params.has("profile") || params.has("profiles")) {
          params.delete("profile");
          params.delete("profiles");
          if (params.has("page")) {
            const page = params.get("page");
            window.history.pushState(
              {
                page: page,
              },
              "KeycapLendar: " + title[page],
              "?" + params.toString()
            );
          } else {
            const questionParam = params.has("page") ? "?" + params.toString() : "/";
            window.history.pushState({}, "KeycapLendar", questionParam);
          }
        }
      }
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
        } else if (vw < 840 && vw >= 480) {
          device = "tablet";
        } else {
          device = "mobile";
        }
        this.setState({ device: device, deviceEdited: true });
        lastWidth = vw;
        i++;
      }
    };
    calculate();
    window.addEventListener("resize", calculate);
  };
  toggleFavorite = (id) => {
    const favorites = addOrRemove([...this.state.favorites], id);
    this.setState({ favorites: favorites });
    if (this.state.page === "favorites") {
      this.filterData(
        this.state.page,
        this.state.sets,
        this.state.sort,
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
        .then(() => {
          this.getFavorites();
        })
        .catch((error) => {
          console.log("Failed to sync favorites: " + error);
          queue.notify({ title: "Failed to sync favorites: " + error });
        });
    }
  };
  getFavorites = (id = this.state.user.id) => {
    if (id) {
      db.collection("users")
        .doc(id)
        .get()
        .then((doc) => {
          if (doc.exists && doc.data().favorites) {
            const favorites = doc.data().favorites;
            this.setState({ favorites: favorites });
            if (this.state.page === "favorites") {
              this.filterData(
                this.state.page,
                this.state.sets,
                this.state.sort,
                this.state.search,
                this.state.whitelist,
                favorites
              );
            }
          }
        })
        .catch((error) => {
          console.log("Failed to get favorites: " + error);
          queue.notify({ title: "Failed to get favorites: " + error });
        });
    }
  };
  setSyncSettings = (bool, write = true) => {
    this.setState({ syncSettings: bool });
    if (write) {
      let settingsObject = {};
      if (bool) {
        Object.keys(settingsFunctions).forEach((setting) => {
          settingsObject[setting] = this.state[setting];
        });
      }
      db.collection("users")
        .doc(this.state.user.id)
        .set({ syncSettings: bool, settings: settingsObject }, { merge: true })
        .then(() => {})
        .catch((error) => {
          console.log("Failed to set sync setting: " + error);
          queue.notify({ title: "Failed to set sync setting: " + error });
        });
    }
  };
  syncSetting = (setting, value) => {
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
        let settingObject = {};
        settingObject["settings." + setting] = value;
        userDocRef
          .update(settingObject)
          .then(() => {})
          .catch((error) => {
            console.log("Failed to sync settings: " + error);
            queue.notify({ title: "Failed to sync settings: " + error });
          });
      };
    }
  };
  getSettings = (id = this.state.user.id) => {
    if (id) {
      const userDocRef = db.collection("users").doc(id);
      userDocRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            const data = doc.data();
            if (data.syncSettings) {
              this.setState({ syncSettings: data.syncSettings });
              const getSetting = (setting, setFunction) => {
                if (data.settings && data.settings[setting]) {
                  setFunction(data.settings[setting], false);
                }
              };
              Object.keys(settingsFunctions).forEach((setting) => {
                getSetting(setting, this[settingsFunctions[setting]]);
              });
            }
          }
        })
        .catch((error) => {
          console.log("Failed to get settings: " + error);
          queue.notify({ title: "Failed to get settings: " + error });
        });
    }
  };
  componentDidMount() {
    this.setDevice();
    this.getURLQuery();
    this.checkCookies();
    this.checkTheme();
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
    document.querySelector("html").classList = this.state.theme;
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        const getClaimsFn = firebase.functions().httpsCallable("getClaims");
        getClaimsFn()
          .then((result) => {
            this.setUser({
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
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
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
              id: user.uid,
            });
          });
        this.getFavorites(user.uid);
        this.getSettings(user.uid);
      } else {
        this.setUser({});
      }
    });
  }
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const device = this.state.device;
    let content = this.state.deviceEdited ? (
      device === "desktop" ? (
        <DesktopContent
          allSets={this.state.sets}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          setPage={this.setPage}
          view={this.state.view}
          setView={this.setView}
          profiles={this.state.profiles}
          allDesigners={this.state.allDesigners}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          toggleLoading={this.toggleLoading}
          sort={this.state.sort}
          setSort={this.setSort}
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
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          statistics={this.state.statistics}
          setStatistics={this.setStatistics}
          statisticsSort={this.state.statisticsSort}
          setStatisticsSort={this.setStatisticsSort}
          statisticsTab={this.state.statisticsTab}
          setStatisticsTab={this.setStatisticsTab}
          density={this.state.density}
          setDensity={this.setDensity}
          snackbarQueue={queue}
        />
      ) : device === "tablet" ? (
        <TabletContent
          allSets={this.state.sets}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          setPage={this.setPage}
          view={this.state.view}
          setView={this.setView}
          profiles={this.state.profiles}
          allDesigners={this.state.allDesigners}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          toggleLoading={this.toggleLoading}
          sort={this.state.sort}
          setSort={this.setSort}
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
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          statistics={this.state.statistics}
          setStatistics={this.setStatistics}
          statisticsSort={this.state.statisticsSort}
          setStatisticsSort={this.setStatisticsSort}
          statisticsTab={this.state.statisticsTab}
          setStatisticsTab={this.setStatisticsTab}
          density={this.state.density}
          setDensity={this.setDensity}
          snackbarQueue={queue}
        />
      ) : (
        <MobileContent
          allSets={this.state.sets}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          setPage={this.setPage}
          view={this.state.view}
          setView={this.setView}
          profiles={this.state.profiles}
          allDesigners={this.state.allDesigners}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          toggleLoading={this.toggleLoading}
          sort={this.state.sort}
          setSort={this.setSort}
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
          bottomNav={this.state.bottomNav}
          setBottomNav={this.setBottomNav}
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          statistics={this.state.statistics}
          setStatistics={this.setStatistics}
          statisticsSort={this.state.statisticsSort}
          setStatisticsSort={this.setStatisticsSort}
          statisticsTab={this.state.statisticsTab}
          setStatisticsTab={this.setStatisticsTab}
          density={this.state.density}
          setDensity={this.setDensity}
          snackbarQueue={queue}
        />
      )
    ) : null;

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
                syncSettings: this.state.syncSettings,
                setSyncSettings: this.setSyncSettings,
              }}
            >
              <DeviceContext.Provider value={this.state.device}>
                <Login />
              </DeviceContext.Provider>
            </UserContext.Provider>
          </Route>
          <Route path="/privacy">
            <PrivacyPolicy />
          </Route>
          <Route path="/terms">
            <TermsOfService />
          </Route>
          <Route path="/guide/entries">
            <EntryGuide />
          </Route>
          <Route path="/">
            <UserContext.Provider
              value={{
                user: this.state.user,
                setUser: this.setUser,
                favorites: this.state.favorites,
                toggleFavorite: this.toggleFavorite,
                syncSettings: this.state.syncSettings,
                setSyncSettings: this.setSyncSettings,
              }}
            >
              <DeviceContext.Provider value={this.state.device}>
                <div className={"app density-" + this.state.density}>
                  {content}
                  <SnackbarQueue messages={queue.messages} />
                  <SnackbarCookies open={!this.state.cookies} accept={this.acceptCookies} clear={this.clearCookies} />
                </div>
              </DeviceContext.Provider>
            </UserContext.Provider>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
