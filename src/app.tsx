import { useEffect } from "react";
import { Portal } from "@rmwc/base";
import { SnackbarQueue } from "@rmwc/snackbar";
import classNames from "classnames";
import { ConnectedRouter } from "connected-react-router";
import { Route, Switch } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { historyObj } from "~/app/store";
import { SnackbarCookies } from "@c/common/snackbar-cookies";
import { Content } from "@c/content";
import { PrivacyPolicy } from "@c/pages/legal/privacy";
import { TermsOfService } from "@c/pages/legal/terms";
import { Login } from "@c/pages/login";
import { NotFound } from "@c/pages/not-found";
import { selectDevice } from "@s/common";
import { allPages } from "@s/common/constants";
import {
  checkDevice,
  getGlobals,
  getURLQuery,
  saveTheme,
} from "@s/common/thunks";
import firebase from "@s/firebase";
import {
  selectDefaultPreset,
  selectTransition,
  setCurrentPreset,
} from "@s/main";
import { testSets } from "@s/main/thunks";
import { selectCookies, selectSettings } from "@s/settings";
import {
  acceptCookies,
  checkStorage,
  checkTheme,
  clearCookies,
} from "@s/settings/thunks";
import { resetUser, setUser } from "@s/user";
import { getUserPreferences } from "@s/user/thunks";
import "./app.scss";

export const App = () => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const settings = useAppSelector(selectSettings);
  const cookies = useAppSelector(selectCookies);

  const transition = useAppSelector(selectTransition);

  const defaultPreset = useAppSelector(selectDefaultPreset);

  useEffect(() => {
    dispatch([
      saveTheme(),
      checkDevice(),
      getURLQuery(),
      checkStorage(),
      getGlobals(),
    ]);

    const checkThemeListener = (e: MediaQueryListEvent) => {
      e.preventDefault();
      dispatch(checkTheme());
    };

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
          queue.notify({ title: `Error verifying custom claims: ${error}` });
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
              [`density-${settings.density}`]: device === "desktop",
            })}
          >
            <Content
              className={classNames({ "view-transition": transition })}
            />
            <SnackbarQueue messages={queue.messages} />
            <SnackbarCookies
              accept={() => dispatch(acceptCookies())}
              clear={() => dispatch(clearCookies())}
              open={!cookies}
            />
            <Portal />
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </ConnectedRouter>
  );
};

export default App;
