import { useEffect } from "react";
import firebase from "@s/firebase";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { allPages } from "@s/common/constants";
import { checkDevice, getGlobals, getURLQuery, saveTheme } from "@s/common/functions";
import { selectDefaultPreset, selectTransition, setCurrentPreset } from "@s/main";
import { testSets } from "@s/main/functions";
import { setUser, setUserPresets, setFavorites, setHidden, setShareName } from "@s/user";
import { selectCookies, selectSettings } from "@s/settings";
import { checkStorage, acceptCookies, clearCookies, checkTheme } from "@s/settings/functions";
import { getUserPreferences } from "@s/user/functions";
import { queue } from "~/app/snackbar-queue";
import { Portal } from "@rmwc/base";
import { SnackbarQueue } from "@rmwc/snackbar";
import { Content } from "@c/Content";
import { Login } from "@c/pages/Login";
import { NotFound } from "@c/pages/not-found";
import { PrivacyPolicy } from "@c/pages/legal/Privacy";
import { TermsOfService } from "@c/pages/legal/Terms";
import { SnackbarCookies } from "@c/common/snackbar-cookies";
import "./App.scss";

export const App = () => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const settings = useAppSelector(selectSettings);
  const cookies = useAppSelector(selectCookies);

  const transition = useAppSelector(selectTransition);

  const defaultPreset = useAppSelector(selectDefaultPreset);

  useEffect(() => {
    saveTheme();
    checkDevice();
    getURLQuery();
    checkStorage();
    checkTheme();
    getGlobals();

    const checkThemeListener = (e: MediaQueryListEvent) => {
      e.preventDefault();
      checkTheme();
    };

    window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", checkThemeListener);

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
        dispatch(setUserPresets([]));
        dispatch(setFavorites([]));
        dispatch(setHidden([]));
        dispatch(setShareName(""));
        if (defaultPreset.name) {
          dispatch(setCurrentPreset(defaultPreset));
        }
      }
    });
    return () => {
      authObserver();
      window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", checkThemeListener);
    };
  }, []);
  const transitionClass = classNames({ "view-transition": transition });
  return (
    <Router>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route exact path={["/", ...allPages.map((page: string) => `/${page}`)]}>
          <div className={classNames("app", { [`density-${settings.density}`]: device === "desktop" })}>
            <Content className={transitionClass} />
            <SnackbarQueue messages={queue.messages} />
            <SnackbarCookies open={!cookies} accept={acceptCookies} clear={clearCookies} />
            <Portal />
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;
