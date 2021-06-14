import React from "react";
import { Link } from "react-router-dom";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Button } from "@rmwc/button";
import { Footer } from "../common/Footer";
import "./NotFound.scss";
import image from "../../media/404.svg";

export const NotFound = () => {
  return (
    <div className="not-found-page-container">
      <TopAppBar prominent>
        <TopAppBarRow>
          <TopAppBarSection>
            <TopAppBarTitle>KeycapLendar</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      <div className="message-container">
        <img src={image} className="image" />
        <Typography className="title" use="headline6" tag="h3">
          404: Page not found
        </Typography>
        <Typography className="subtitle" use="body1" tag="p">
          Unknown URL, please return to homepage.
        </Typography>
        <Link to="/">
          <Button label="Go to homepage" />
        </Link>
      </div>
      <Footer />
    </div>
  );
};
