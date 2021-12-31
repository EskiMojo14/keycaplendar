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
        <img className="image" src={peach} alt="Peach" />
        <Typography className="title" use="headline6" tag="h3">
          Sign in
        </Typography>
        <Typography className="subtitle" use="body1" tag="p">
          Log in to gain access to features such as favorites, hiding sets, and
          filter presets.
        </Typography>
        <StyledFirebaseAuth
          uiConfig={uiConfig}
          firebaseAuth={firebase.auth()}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Login;
