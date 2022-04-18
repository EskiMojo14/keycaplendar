import { useEffect } from "react";
import { Portal } from "@rmwc/base";
import { DialogQueue } from "@rmwc/dialog";
import { SnackbarQueue } from "@rmwc/snackbar";
import classNames from "classnames";
import { ConnectedRouter } from "connected-react-router";
import { Route, Switch } from "react-router-dom";
import { dialogQueue } from "~/app/dialog-queue";
import { notify, snackbarQueue } from "~/app/snackbar-queue";
import { historyObj } from "~/app/store";
import { Content } from "@c/content";
import { PrivacyPolicy } from "@c/pages/legal/privacy";
import { TermsOfService } from "@c/pages/legal/terms";
import { Login } from "@c/pages/login";
import { NotFound } from "@c/pages/not-found";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import { selectTheme, setSystemTheme, setTimed } from "@s/common";
import { allPages } from "@s/common/constants";
import { getGlobals, getURLQuery } from "@s/common/thunks";
import firebase from "@s/firebase";
import {
  selectDefaultPreset,
  selectTransition,
  setCurrentPreset,
} from "@s/main";
import { testSets } from "@s/main/thunks";
import {
  selectCookies,
  selectDensity,
  selectFromTimeTheme,
  selectToTimeTheme,
} from "@s/settings";
import { acceptCookies, checkStorage } from "@s/settings/thunks";
import { resetUser, setUser } from "@s/user";
import { getUserPreferences } from "@s/user/thunks";
import { Interval } from "@s/util/constructors";
import { isBetweenTimes } from "@s/util/functions";
import "./app.scss";

export const App = () => {
  const dispatch = useAppDispatch();

  const device = useDevice();
  const theme = useAppSelector(selectTheme);
  useEffect(() => {
    const { documentElement: html } = document;
    html.setAttribute("class", theme);
    const meta = document.querySelector("meta[name=theme-color]");
    meta?.setAttribute(
      "content",
      getComputedStyle(html).getPropertyValue("--theme-meta")
    );
  }, [theme]);

  const fromTimeTheme = useAppSelector(selectFromTimeTheme);
  const toTimeTheme = useAppSelector(selectToTimeTheme);
  useEffect(() => {
    dispatch(setTimed(isBetweenTimes(fromTimeTheme, toTimeTheme)));
    const syncTime = new Interval(() => {
      dispatch(setTimed(isBetweenTimes(fromTimeTheme, toTimeTheme)));
    }, 60000);
    return () => syncTime.clear();
  }, [dispatch, fromTimeTheme, toTimeTheme]);

  const density = useAppSelector(selectDensity);

  const cookies = useAppSelector(selectCookies);
  useEffect(() => {
    if (!cookies) {
      notify({
        actions: [
          { label: "Accept", onClick: () => dispatch(acceptCookies()) },
        ],
        dismissesOnAction: true,
        onClose: () => dispatch(acceptCookies()),
        timeout: 200000,
        title:
          "By using this site, you consent to use of cookies to store preferences.",
      });
    }
  }, [cookies]);

  const transition = useAppSelector(selectTransition);

  const defaultPreset = useAppSelector(selectDefaultPreset);

  useEffect(() => {
    dispatch([getURLQuery(), checkStorage(), getGlobals()]);

    const checkThemeListener = (e: MediaQueryListEvent) => {
      e.preventDefault();
      dispatch(setSystemTheme(e.matches));
    };

    dispatch(
      setSystemTheme(window.matchMedia("(prefers-color-scheme: dark)").matches)
    );
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", checkThemeListener);

    const authObserver = firebase.auth().onAuthStateChanged(async (user) => {
      if (user) {
        const getClaimsFn = firebase.functions().httpsCallable("getClaims");
        try {
          const result = await getClaimsFn();
          dispatch(
            setUser({
              avatar: user.photoURL ?? "",
              email: user.email ?? "",
              id: user.uid,
              isAdmin: result.data.admin,
              isDesigner: result.data.designer,
              isEditor: result.data.editor,
              name: user.displayName ?? "",
              nickname: result.data.nickname,
            })
          );
          if (result.data.admin) {
            dispatch(testSets());
          }
        } catch (error) {
          notify({ title: `Error verifying custom claims: ${error}` });
          dispatch(
            setUser({
              avatar: user.photoURL ?? "",
              email: user.email ?? "",
              id: user.uid,
              name: user.displayName ?? "",
            })
          );
        }
        dispatch(getUserPreferences(user.uid));
      } else {
        dispatch(resetUser());
        if (defaultPreset.name) {
          dispatch(setCurrentPreset("default"));
        }
      }
    });
    return () => {
      authObserver();
      window
        .matchMedia("(prefers-color-scheme: dark)")
        .removeEventListener("change", checkThemeListener);
    };
  }, []);
  return (
    <ConnectedRouter history={historyObj}>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route component={PrivacyPolicy} path="/privacy" />
        <Route component={TermsOfService} path="/terms" />
        <Route
          exact
          path={["/", ...allPages.map((page: string) => `/${page}`)]}
        >
          <div
            className={classNames("app", {
              [`density-${density}`]: device === "desktop",
            })}
          >
            <Content
              className={classNames({ "view-transition": transition })}
            />
            <SnackbarQueue messages={snackbarQueue.messages} />
            <DialogQueue dialogs={dialogQueue.dialogs} />
            <Portal />
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </ConnectedRouter>
  );
};

export default App;
