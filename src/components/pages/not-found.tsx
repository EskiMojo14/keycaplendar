import { Button } from "@rmwc/button";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Link } from "react-router-dom";
import { Footer } from "@c/common/footer";
import image from "@m/404.svg";
import "./not-found.scss";

export const NotFound = () => (
  <div className="not-found-page-container">
    <TopAppBar prominent>
      <TopAppBarRow>
        <TopAppBarSection>
          <TopAppBarTitle>KeycapLendar</TopAppBarTitle>
        </TopAppBarSection>
      </TopAppBarRow>
    </TopAppBar>
    <div className="message-container">
      <img className="image" src={image} />
      <Typography className="title" tag="h3" use="headline6">
        404: Page not found
      </Typography>
      <Typography className="subtitle" tag="p" use="body1">
        Unknown URL, please return to homepage.
      </Typography>
      <Link to="/">
        <Button label="Go to homepage" />
      </Link>
    </div>
    <Footer />
  </div>
);
