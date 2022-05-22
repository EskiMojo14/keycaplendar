import { useEffect } from "react";
import { Portal } from "@rmwc/base";
import { DialogQueue } from "@rmwc/dialog";
import { SnackbarQueue } from "@rmwc/snackbar";
import classNames from "classnames";
import { Router } from "react-router";
import { Redirect, Route, Switch } from "react-router-dom";
import { dialogQueue } from "~/app/dialog-queue";
import { history } from "~/app/history";
import { notify, snackbarQueue } from "~/app/snackbar-queue";
import { Content } from "@c/content";
import { PrivacyPolicy } from "@c/pages/legal/privacy";
import { TermsOfService } from "@c/pages/legal/terms";
import { Login } from "@c/pages/login";
import { NotFound } from "@c/pages/not-found";
import { useAppDispatch, useAppSelector } from "@h";
import useDevice from "@h/use-device";
import {
  selectTheme,
  setupSystemThemeListener,
  setupTimedListener,
  useGetGlobalsQuery,
} from "@s/common";
import { selectTransition } from "@s/main";
import { getData } from "@s/main/thunks";
import { addRouterListener, setupLocationChangeListener } from "@s/router";
import { routes } from "@s/router/constants";
import { handleLegacyParams } from "@s/router/functions";
import {
  selectCookies,
  selectDensity,
  selectFromTimeTheme,
  selectToTimeTheme,
} from "@s/settings";
import { acceptCookies, checkStorage } from "@s/settings/thunks";
import { selectUser, useGetUserDocQuery } from "@s/user";
import { setupAuthListener } from "@s/user/thunks";
import "./app.scss";

export const App = () => {
  const dispatch = useAppDispatch();
  useEffect(
    () => setupLocationChangeListener(history, dispatch),
    [history, dispatch]
  );
  useEffect(() => dispatch(addRouterListener(history)), [history]);

  const user = useAppSelector(selectUser);
  useGetUserDocQuery(user.id);

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
  useEffect(
    () => dispatch(setupTimedListener(fromTimeTheme, toTimeTheme)),
    [dispatch, fromTimeTheme, toTimeTheme]
  );

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

  useGetGlobalsQuery(undefined, { selectFromResult: () => ({}) });

  useEffect(() => {
    dispatch([getData(), checkStorage()]);
    const checkThemeListener = dispatch(setupSystemThemeListener());
    const authObserver = dispatch(setupAuthListener());
    return () => {
      authObserver();
      checkThemeListener();
    };
  }, []);
  return (
    <Router history={history}>
      <Switch>
        <Route path="/login">
          <Login />
        </Route>
        <Route component={PrivacyPolicy} path="/privacy" />
        <Route component={TermsOfService} path="/terms" />
        <Route path={Object.values(routes)}>
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
        <Route exact path="/">
          <Redirect to={routes.calendar.replace("/:keyset?", "")} />
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;

handleLegacyParams(history);
