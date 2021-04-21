import React, { useContext } from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../../firebase";
import { UserContext, DeviceContext } from "../../util/contexts";
import { Redirect } from "react-router-dom";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Footer } from "../common/Footer";
import "./Login.scss";
import peach from "../../media/peach.svg";

export const Login = () => {
  const { user } = useContext(UserContext);

  const device = useContext(DeviceContext);

  const uiConfig: firebaseui.auth.Config = {
    // Popup signin flow rather than redirect flow.
    signInFlow: device === "desktop" ? "popup" : "redirect",
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: "/",
    // We will display Google and Facebook as auth providers.
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false,
    },
  };

  if (user.email) {
    return <Redirect to="/" />;
  }

  return (
    <div className="login-page-container">
      <TopAppBar prominent>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarTitle>KeycapLendar</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <div className="login-container">
        <img className="image" src={peach} alt="Peach" />
        <Typography className="title" use="headline6" tag="h3">
          Sign in
        </Typography>
        <Typography className="subtitle" use="body1" tag="p">
          Log in to gain access to features such as favourites, hiding sets, and filter presets.
        </Typography>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
