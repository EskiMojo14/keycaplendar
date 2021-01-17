import React from "react";
import classNames from "classnames";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import "./ContentImages.scss";

export class ContentImages extends React.Component {
  render() {
    return (
      <>
        <TopAppBar fixed className={{ "bottom-app-bar": this.props.bottomNav }}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              <TopAppBarTitle>Images</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd></TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        {this.props.bottomNav ? null : <TopAppBarFixedAdjust />}
        <div className={classNames("content-container")}>
          <div className="main">
            <div className="image-grid"></div>
            <Footer />
          </div>
        </div>
        {this.props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      </>
    );
  }
}

export default ContentImages;
