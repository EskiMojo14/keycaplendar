import React, { useEffect } from "react";
import firebase from "~/app/slices/firebase/firebase";
import classNames from "classnames";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { selectDevice } from "~/app/slices/common/commonSlice";
import { allPages } from "~/app/slices/common/constants";
import { checkDevice, getGlobals, getURLQuery } from "~/app/slices/common/coreFunctions";
import { selectDefaultPreset, selectTransition, setCurrentPreset } from "~/app/slices/main/mainSlice";
import { testSets } from "~/app/slices/main/functions";
import { setUser, setUserPresets, setFavorites, setHidden, setShareName } from "~/app/slices/user/userSlice";
import { selectCookies, selectSettings } from "~/app/slices/settings/settingsSlice";
import { checkStorage, acceptCookies, clearCookies, checkTheme } from "~/app/slices/settings/functions";
import { getUserPreferences } from "~/app/slices/user/functions";
import { queue } from "~/app/snackbarQueue";
import { SnackbarQueue } from "@rmwc/snackbar";
import { Content } from "~/components/Content";
import { Login } from "~/components/pages/Login";
import { NotFound } from "~/components/pages/NotFound";
import { EntryGuide } from "~/components/pages/guides/EntryGuide";
import { PrivacyPolicy } from "~/components/pages/legal/Privacy";
import { TermsOfService } from "~/components/pages/legal/Terms";
import { SnackbarCookies } from "~/components/common/SnackbarCookies";
import "~/App.scss";

export const App = () => {
  const dispatch = useAppDispatch();

  const device = useAppSelector(selectDevice);

  const settings = useAppSelector(selectSettings);
  const cookies = useAppSelector(selectCookies);

  const transition = useAppSelector(selectTransition);

  const defaultPreset = useAppSelector(selectDefaultPreset);

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
        dispatch(setUserPresets([]));
        dispatch(setFavorites([]));
        dispatch(setHidden([]));
        dispatch(setShareName(""));
        if (defaultPreset.name) {
          dispatch(setCurrentPreset(defaultPreset));
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
          <Login />
        </Route>
        <Route path="/privacy" component={PrivacyPolicy} />
        <Route path="/terms" component={TermsOfService} />
        <Route path="/guide/entries">
          <EntryGuide />
        </Route>
        <Route exact path={["/", ...allPages.map((page: string) => `/${page}`)]}>
          <div className={classNames("app", { [`density-${settings.density}`]: device === "desktop" })}>
            <Content className={transitionClass} />
            <SnackbarQueue messages={queue.messages} />
            <SnackbarCookies open={!cookies} accept={acceptCookies} clear={clearCookies} />
          </div>
        </Route>
        <Route component={NotFound} />
      </Switch>
    </Router>
  );
};

export default App;
