import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import StyledFirebaseAuth from "react-firebaseui/StyledFirebaseAuth";
import { Redirect } from "react-router-dom";
import { useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { selectDevice } from "@s/common";
import firebase from "@s/firebase";
import { selectUser } from "@s/user";
import peach from "@m/peach.svg";
import "./login.scss";

export const Login = () => {
  const device = useAppSelector(selectDevice);

  const user = useAppSelector(selectUser);

  const uiConfig: firebaseui.auth.Config = {
    // Popup signin flow rather than redirect flow.
    signInFlow: device === "desktop" ? "popup" : "redirect",
    // Redirect to /signedIn after sign in is successful. Alternatively you can provide a callbacks.signInSuccess function.
    signInSuccessUrl: "/",
    // We will display Google and Facebook as auth providers.
    signInOptions: [
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.GithubAuthProvider.PROVIDER_ID,
      firebase.auth.TwitterAuthProvider.PROVIDER_ID,
    ],
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
        <img alt="Peach" className="image" src={peach} />
        <Typography className="title" tag="h3" use="headline6">
          Sign in
        </Typography>
        <Typography className="subtitle" tag="p" use="body1">
          Log in to gain access to features such as favorites, hiding sets, and
          filter presets.
        </Typography>
        <StyledFirebaseAuth
          firebaseAuth={firebase.auth()}
          uiConfig={uiConfig}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
