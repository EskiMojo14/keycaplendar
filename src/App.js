import React from "react";
import firebase from "./components/firebase";
import moment from "moment";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { createSnackbarQueue, SnackbarQueue } from "@rmwc/snackbar";
import { DesktopContent, TabletContent, MobileContent } from "./components/Content";
import { Login } from "./components/admin/Login";
import { Users } from "./components/admin/users/Users";
import { AuditLog } from "./components/admin/audit_log/AuditLog";
import { EntryGuide } from "./components/guides/Guides";
import { PrivacyPolicy, TermsOfService } from "./components/common/Legal";
import { SnackbarCookies } from "./components/common/SnackbarCookies";
import "./App.scss";

const queue = createSnackbarQueue();
class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      device: "desktop",
      bottomNav: false,
      page: "calendar",
      view: "card",
      transition: false,
      sort: "gbLaunch",
      allDesigners: [],
      allVendors: [],
      allRegions: [],
      vendors: [],
      sets: [],
      profiles: [],
      filteredSets: [],
      groups: [],
      loading: false,
      content: true,
      failed: false,
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
      whitelist: { vendors: [], profiles: [], edited: false },
      cookies: true,
      applyTheme: "manual",
      darkTheme: "deep",
      manualTheme: false,
      fromTimeTheme: "21:00",
      toTimeTheme: "06:00",
      lichTheme: false,
      statistics: { timeline: "gbLaunch", status: "profile", shipped: "profile" },
      statisticsSort: { status: "alphabetical", shipped: "alphabetical" },
      statisticsTab: "timeline",
    };
  }
  getURLQuery = () => {
    const params = new URLSearchParams(window.location.search);
    if (params.has("page")) {
      const pageQuery = params.get("page");
      const pages = ["calendar", "live", "ic", "previous", "timeline", "statistics"];
      if (pages.indexOf(pageQuery) > -1) {
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
        }
      }
      this.getData();
    } else {
      this.getData();
    }
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
    let d = new Date();
    d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000);
    const expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
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
              setFunction(cookie);
            }, 0);
          } else {
            const cookieBool = cookie === "true";
            setTimeout(() => {
              setFunction(cookieBool);
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
      checkCookie("view", this.changeView);
      checkCookie("bottomNav", this.changeBottomNav);
      checkCookie("applyTheme", this.changeApplyTheme);
      checkCookie("darkTheme", this.setDarkTheme);
      checkCookie("manualTheme", this.setManualTheme);
      checkCookie("fromTimeTheme", this.setFromTimeTheme);
      checkCookie("toTimeTheme", this.setToTimeTheme);
    } else {
      this.clearCookies();
    }
  };
  changeView = (view) => {
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
    if (this.state.cookies) {
      this.setCookie("view", view, 365);
    }
  };
  changePage = (page) => {
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
        }
        this.filterData(page);
        document.documentElement.scrollTop = 0;
      }, 90);
      setTimeout(() => {
        this.setState({ transition: false });
      }, 300);
      const title = {
        calendar: "Calendar",
        live: "Live GBs",
        ic: "IC Tracker",
        previous: "Previous Sets",
        account: "Account",
        timeline: "Timeline",
        statistics: "Statistics",
      };
      document.title = "KeycapLendar: " + title[page];
      window.history.pushState(
        {
          page: page,
        },
        "KeycapLendar: " + title[page],
        "?page=" + page
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
    document.querySelector("html").classList =
      themeBool === true || themeBool === "true" ? this.state.darkTheme : this.state.lichTheme ? "lich" : "light";
    document
      .querySelector("meta[name=theme-color]")
      .setAttribute("content", getComputedStyle(document.documentElement).getPropertyValue("--meta-color"));
  };
  changeApplyTheme = (applyTheme) => {
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
    if (this.state.cookies) {
      this.setCookie("applyTheme", applyTheme, 365);
    }
  };
  setDarkTheme = (theme) => {
    this.setState({ darkTheme: theme });
    setTimeout(this.checkTheme, 1);
    if (this.state.cookies) {
      this.setCookie("darkTheme", theme, 365);
    }
  };
  setManualTheme = (bool) => {
    this.setState({ manualTheme: bool });
    setTimeout(this.checkTheme, 1);
    if (this.state.cookies) {
      this.setCookie("manualTheme", bool, 365);
    }
  };
  setFromTimeTheme = (time) => {
    this.setState({ fromTimeTheme: time });
    setTimeout(this.checkTheme, 1);
    if (this.state.cookies) {
      this.setCookie("fromTimeTheme", time, 365);
    }
  };
  setToTimeTheme = (time) => {
    this.setState({ toTimeTheme: time });
    setTimeout(this.checkTheme, 1);
    setTimeout(this.checkTheme, 1);
    if (this.state.cookies) {
      this.setCookie("toTimeTheme", time, 365);
    }
  };
  toggleLichTheme = () => {
    this.setState({ lichTheme: !this.state.lichTheme });
    setTimeout(this.checkTheme, 1);
  };
  changeBottomNav = (value) => {
    document.documentElement.scrollTop = 0;
    this.setState({ bottomNav: value });
    if (this.state.cookies) {
      this.setCookie("bottomNav", value, 365);
    }
  };
  toggleLoading = () => {
    this.setState({ loading: !this.state.loading });
  };
  getData = () => {
    this.setState({ loading: true });
    const db = firebase.firestore();
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
        this.setState({ loading: false, content: false, failed: true });
      });
  };
  filterData = (
    page = this.state.page,
    sets = this.state.sets,
    sort = this.state.sort,
    search = this.state.search,
    whitelist = this.state.whitelist
  ) => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    let pageSets = [];
    let allRegions = [];
    let allVendors = [];
    let usVendors = [];
    let allProfiles = [];
    let allDesigners = [];
    let groups = [];

    // page logic
    if (page === "calendar") {
      pageSets = sets.filter((set) => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return startDate > today || (startDate <= today && (endDate >= yesterday || set.gbEnd === ""));
      });
    } else if (page === "live") {
      pageSets = sets.filter((set) => {
        const startDate = new Date(set.gbLaunch);
        const endDate = new Date(set.gbEnd);
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
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
        endDate.setHours(23);
        endDate.setMinutes(59);
        endDate.setSeconds(59);
        endDate.setMilliseconds(999);
        return endDate <= yesterday;
      });
    } else if (page === "timeline") {
      pageSets = sets.filter((set) => {
        return set.gbLaunch !== "" && !set.gbLaunch.includes("Q");
      });
    }

    // lists
    sets.forEach((set) => {
      if (set.vendors[0]) {
        if (!usVendors.includes(set.vendors[0].name)) {
          usVendors.push(set.vendors[0].name);
        }
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

    usVendors.sort(function (a, b) {
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

    if (!whitelist.edited) {
      this.setWhitelist("vendors", allVendors);
      this.setWhitelist("profiles", allProfiles);
    }

    const filteredSets = pageSets.filter((set) => {
      if (set.vendors.length > 0) {
        return whitelist.vendors.indexOf(set.vendors[0].name) > -1 && whitelist.profiles.indexOf(set.profile) > -1;
      } else {
        if (whitelist.vendors.length === 1) {
          return false;
        } else {
          return whitelist.profiles.indexOf(set.profile) > -1;
        }
      }
    });

    // search logic

    const searchSets = (search) => {
      return filteredSets.filter((set) => {
        let setInfo =
          set.profile +
          " " +
          set.colorway +
          " " +
          set.colorway.normalize("NFD").replace(/[^a-zA-Z0-9]/g, "") +
          " " +
          set.vendors.map((vendor) => {
            return " " + vendor.name + " " + vendor.region;
          }) +
          " " +
          set.designer.toString();
        return setInfo.toLowerCase().indexOf(search.toLowerCase()) > -1;
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
        let setMonth = months[setDate.getUTCMonth()] + " " + setDate.getUTCFullYear();
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
      vendors: usVendors,
      profiles: allProfiles,
      groups: groups,
      content: searchedSets.length > 0,
      loading: false,
    });
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
    this.setState({ user: user });
  };
  setStatistics = (prop, query) => {
    let objectCopy = Object.assign({}, this.state.statistics);
    objectCopy[prop] = query;
    this.setState({ statistics: objectCopy });
  };
  setStatisticsSort = (prop, query) => {
    let objectCopy = Object.assign({}, this.state.statisticsSort);
    objectCopy[prop] = query;
    this.setState({ statisticsSort: objectCopy });
  };
  setStatisticsTab = (tab) => {
    document.documentElement.scrollTop = 0;
    this.setState({ statisticsTab: tab });
  };
  setWhitelist = (property, values) => {
    let whitelistCopy = this.state.whitelist;
    whitelistCopy[property] = values;
    whitelistCopy.edited = true;
    this.setState({
      whitelist: whitelistCopy,
    });
    document.documentElement.scrollTop = 0;
    this.filterData(this.state.page, this.state.sets, this.state.sort, this.props.search, whitelistCopy);
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
        this.setState({ device: device });
        lastWidth = vw;
        i++;
      }
    };
    calculate();
    window.addEventListener("resize", calculate);
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
              nickname: result.data.nickname,
              isDesigner: result.data.designer,
              isEditor: result.data.editor,
              isAdmin: result.data.admin,
              id: result.data.id,
            });
          })
          .catch((error) => {
            queue.notify({ title: "Error verifying custom claims: " + error });
            this.setUser({
              email: user.email,
              name: user.displayName,
              avatar: user.photoURL,
              nickname: "",
              isDesigner: false,
              isEditor: false,
              isAdmin: false,
              id: null,
            });
          });
      } else {
        this.setUser({
          email: null,
          name: null,
          avatar: null,
          isEditor: false,
          isAdmin: false,
        });
      }
    });
  }
  // Make sure we un-register Firebase observers when the component unmounts.
  componentWillUnmount() {
    this.unregisterAuthObserver();
  }

  render() {
    const device = this.state.device;
    let content;
    if (device === "desktop") {
      content = (
        <DesktopContent
          allSets={this.state.sets}
          user={this.state.user}
          setUser={this.setUser}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          changePage={this.changePage}
          view={this.state.view}
          changeView={this.changeView}
          profiles={this.state.profiles}
          vendors={this.state.vendors}
          allDesigners={this.state.allDesigners}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          sort={this.state.sort}
          setSort={this.setSort}
          content={this.state.content}
          failed={this.state.failed}
          editor={this.state.user.isEditor}
          search={this.state.search}
          setSearch={this.setSearch}
          applyTheme={this.state.applyTheme}
          changeApplyTheme={this.changeApplyTheme}
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
          snackbarQueue={queue}
        />
      );
    } else if (device === "tablet") {
      content = (
        <TabletContent
          allSets={this.state.sets}
          user={this.state.user}
          setUser={this.setUser}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          changePage={this.changePage}
          view={this.state.view}
          changeView={this.changeView}
          profiles={this.state.profiles}
          vendors={this.state.vendors}
          allDesigners={this.state.allDesigners}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          sort={this.state.sort}
          setSort={this.setSort}
          content={this.state.content}
          failed={this.state.failed}
          editor={this.state.user.isEditor}
          search={this.state.search}
          setSearch={this.setSearch}
          applyTheme={this.state.applyTheme}
          changeApplyTheme={this.changeApplyTheme}
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
          snackbarQueue={queue}
        />
      );
    } else {
      content = (
        <MobileContent
          allSets={this.state.sets}
          user={this.state.user}
          setUser={this.setUser}
          getData={this.getData}
          className={this.state.transition ? "view-transition" : ""}
          page={this.state.page}
          changePage={this.changePage}
          view={this.state.view}
          changeView={this.changeView}
          profiles={this.state.profiles}
          vendors={this.state.vendors}
          allDesigners={this.state.allDesigners}
          allVendors={this.state.allVendors}
          allRegions={this.state.allRegions}
          sets={this.state.filteredSets}
          groups={this.state.groups}
          loading={this.state.loading}
          sort={this.state.sort}
          setSort={this.setSort}
          content={this.state.content}
          failed={this.state.failed}
          editor={this.state.user.isEditor}
          search={this.state.search}
          setSearch={this.setSearch}
          applyTheme={this.state.applyTheme}
          changeApplyTheme={this.changeApplyTheme}
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
          changeBottomNav={this.changeBottomNav}
          setWhitelist={this.setWhitelist}
          whitelist={this.state.whitelist}
          statistics={this.state.statistics}
          setStatistics={this.setStatistics}
          statisticsSort={this.state.statisticsSort}
          setStatisticsSort={this.setStatisticsSort}
          statisticsTab={this.state.statisticsTab}
          setStatisticsTab={this.setStatisticsTab}
          snackbarQueue={queue}
        />
      );
    }
    return (
      <Router>
        <Switch>
          <Route path="/users">
            <div>
              <Users
                admin={this.state.user.isAdmin}
                user={this.state.user}
                snackbarQueue={queue}
                allDesigners={this.state.allDesigners}
                device={this.state.device}
              />
              <SnackbarQueue messages={queue.messages} />
            </div>
          </Route>
          <Route path="/login">
            <Login device={this.state.device} user={this.state.user} setUser={this.setUser} />
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
          <Route path="/audit">
            <div>
              <AuditLog device={this.state.device} snackbarQueue={queue} />
              <SnackbarQueue messages={queue.messages} />
            </div>
          </Route>
          <Route path="/">
            <div className="app">
              {content}
              <SnackbarQueue messages={queue.messages} />
              <SnackbarCookies open={!this.state.cookies} accept={this.acceptCookies} clear={this.clearCookies} />
            </div>
          </Route>
        </Switch>
      </Router>
    );
  }
}

export default App;
