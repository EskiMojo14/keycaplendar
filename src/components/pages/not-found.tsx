import { Button } from "@rmwc/button";
import { TopAppBar, TopAppBarRow, TopAppBarSection, TopAppBarTitle } from "@rmwc/top-app-bar";
import { Typography } from "@rmwc/typography";
import { Link } from "react-router-dom";
import { Footer } from "@c/common/footer";
import image from "@m/404.svg";
import "./not-found.scss";

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
