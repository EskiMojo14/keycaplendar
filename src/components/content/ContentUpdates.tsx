import React from "react";
import classNames from "classnames";
import { QueueType } from "../../util/types";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import "./ContentUpdates.scss";

type ContentUpdatesProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
};

export const ContentUpdates = (props: ContentUpdatesProps) => {
  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": props.bottomNav })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>Updates</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar"></div>
      </div>
      <Footer />
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
