import React, { useEffect } from "react";
import firebase from "./firebase";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectDevice, selectPage, setAppPage, setDevice } from "./app/slices/common/commonSlice";
import { allPages, mainPages, pageTitle, urlPages } from "./app/slices/common/constants";
import { addOrRemove, arrayEveryType, arrayIncludes, hasKey } from "./app/slices/common/functions";
import { GlobalDoc, Page } from "./app/slices/common/types";
import {
  selectAllSets,
  selectDefaultPreset,
  selectLoading,
  selectSearch,
  selectSort,
  selectSortOrder,
  selectTransition,
  selectWhitelist,
  setAppPresets,
  setCurrentPreset,
  setSearch as setMainSearch,
  setSort as setMainSort,
  setSortOrder as setMainSortOrder,
  setTransition,
} from "./app/slices/main/mainSlice";
import {
  allSorts,
  pageSort,
  pageSortOrder,
  sortBlacklist,
  whitelistParams,
  whitelistShipped,
} from "./app/slices/main/constants";
import {
  getData,
  filterData,
  setWhitelistMerge,
  testSets,
  updatePreset,
  selectPreset,
  findPreset,
} from "./app/slices/main/functions";
import { WhitelistType } from "./app/slices/main/types";
import {
  selectUser,
  setUser,
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
  const userFavorites = useAppSelector(selectFavorites);
  const userHidden = useAppSelector(selectHidden);

  const transition = useAppSelector(selectTransition);
  const loading = useAppSelector(selectLoading);

  const mainSort = useAppSelector(selectSort);
  const mainSortOrder = useAppSelector(selectSortOrder);

  const allSets = useAppSelector(selectAllSets);

  const mainSearch = useAppSelector(selectSearch);
  const mainWhitelist = useAppSelector(selectWhitelist);
  const defaultPreset = useAppSelector(selectDefaultPreset);

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
            }}
          >
            <div className={classNames("app", { [`density-${settings.density}`]: device === "desktop" })}>
              <Content className={transitionClass} setPage={setPage} />
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
