import React from "react";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import firebase from "../firebase";
import { Redirect } from "react-router-dom";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Footer } from "../common/Footer";
import "./Login.scss";
import peach from "../../peach.svg";

export const Login = (props) => {
  const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: props.device === "desktop" ? "popup" : "redirect",
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: "/",
    // We will display Google and Facebook as auth providers.
    signInOptions: [firebase.auth.GoogleAuthProvider.PROVIDER_ID],
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: () => false,
    },
  };

  if (props.user.name) {
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
          To allow editor access, please verify your account below.
        </Typography>
        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()} />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
