import classNames from "classnames";
import React from "react";
import { useAppSelector } from "../../app/hooks";
import { pageTitle } from "../../app/slices/common/constants";
import { selectBottomNav } from "../../app/slices/settings/settingsSlice";
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";

type ContentGuidesProps = {
  openNav: () => void;
};

export const ContentGuides = (props: ContentGuidesProps) => {
  const bottomNav = useAppSelector(selectBottomNav);
  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNav })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.guides}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd></TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar"></div>
      </div>
      <Footer />
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
