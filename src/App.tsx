import React, { useEffect } from "react";
import firebase from "./firebase";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "./app/hooks";
import { selectDevice, selectPage } from "./app/slices/common/commonSlice";
import { checkDevice, getGlobals, getURLQuery } from "./app/slices/common/coreFunctions";
import { addOrRemove, hasKey } from "./app/slices/common/functions";
import {
  selectAllSets,
  selectSearch,
  selectSort,
  selectSortOrder,
  selectTransition,
  selectWhitelist,
  setCurrentPreset,
} from "./app/slices/main/mainSlice";
import { whitelistParams } from "./app/slices/main/constants";
import { filterData, testSets, updatePreset, selectPreset, findPreset } from "./app/slices/main/functions";
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

  const mainSort = useAppSelector(selectSort);
  const mainSortOrder = useAppSelector(selectSortOrder);

  const allSets = useAppSelector(selectAllSets);

  const mainSearch = useAppSelector(selectSearch);
  const mainWhitelist = useAppSelector(selectWhitelist);

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
              <Content className={transitionClass} />
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
