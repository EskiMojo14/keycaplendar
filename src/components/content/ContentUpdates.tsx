import React, { useContext } from "react";
import classNames from "classnames";
import { DeviceContext, UserContext } from "../../util/contexts";
import { QueueType } from "../../util/types";
import { Fab } from "@rmwc/fab";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import { UpdateEntry } from "../updates/UpdateEntry";
import "./ContentUpdates.scss";

type ContentUpdatesProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
};

export const ContentUpdates = (props: ContentUpdatesProps) => {
  const { user } = useContext(UserContext);
  const device = useContext(DeviceContext);
  const indent =
    user.isAdmin && props.bottomNav ? (
      <TopAppBarSection className="indent" alignEnd>
        <svg xmlns="http://www.w3.org/2000/svg" width="128" height="56" viewBox="0 0 128 56">
          <path
            d="M107.3,0a8.042,8.042,0,0,0-7.9,6.6A36.067,36.067,0,0,1,64,36,36.067,36.067,0,0,1,28.6,6.6,8.042,8.042,0,0,0,20.7,0H0V56H128V0Z"
            fill="inherit"
          />
        </svg>
        <div className="fill"></div>
      </TopAppBarSection>
    ) : null;
  const fab = (
    <Fab
      className={classNames("create-fab", { middle: props.bottomNav })}
      icon="add"
      label={device === "desktop" ? "Create" : null}
    />
  );
  return (
    <>
      <TopAppBar
        fixed
        className={classNames({
          "bottom-app-bar": props.bottomNav,
          "bottom-app-bar--indent": props.bottomNav && user.isAdmin,
        })}
      >
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>Updates</TopAppBarTitle>
          </TopAppBarSection>
          {indent}
        </TopAppBarRow>
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar">
          <div className="update-container">
            <UpdateEntry />
            <UpdateEntry />
          </div>
        </div>
        {fab}
      </div>
      <Footer />
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
