import React from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import { Tooltip } from "@rmwc/tooltip";
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
import { QueueType, PublicActionType } from "../../util/types";

type ContentChangelogProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
};

type ContentChangelogState = {
  allActions: PublicActionType[];
};

export class ContentChangelog extends React.Component<ContentChangelogProps> {
  state: ContentChangelogState = {
    allActions: [],
  };
  componentDidMount() {
    this.getData();
  }
  getData = () => {
    const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
    cloudFn({ num: 25 })
      .then((result) => {
        const data = result.data;
        this.setState({ allActions: data });
      })
      .catch((error) => {
        console.log(error);
        this.props.snackbarQueue.notify({ title: "Failed to get changelog: " + error });
      });
  };
  render() {
    return (
      <>
        <TopAppBar fixed className={classNames({ "bottom-app-bar": this.props.bottomNav })}>
          <TopAppBarRow>
            <TopAppBarSection alignStart>
              <TopAppBarNavigationIcon icon="menu" onClick={this.props.openNav} />
              <TopAppBarTitle>Changelog</TopAppBarTitle>
            </TopAppBarSection>
            <TopAppBarSection alignEnd></TopAppBarSection>
          </TopAppBarRow>
        </TopAppBar>
        {this.props.bottomNav ? null : <TopAppBarFixedAdjust />}
        <div className={"content-container"}>
          <div className="main extended-app-bar"></div>
        </div>
        <Footer />
        {this.props.bottomNav ? <TopAppBarFixedAdjust /> : null}
      </>
    );
  }
}
