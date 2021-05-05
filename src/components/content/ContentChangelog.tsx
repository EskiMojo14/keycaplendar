import React from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import { QueueType, PublicActionType, ActionSetType } from "../../util/types";
import isEqual from "lodash.isequal";

type ContentChangelogProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
};

type ContentChangelogState = {
  processedActions: PublicActionType[];
};

export class ContentChangelog extends React.Component<ContentChangelogProps> {
  state: ContentChangelogState = {
    processedActions: [],
  };
  componentDidMount() {
    this.getData();
  }
  getData = () => {
    const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
    cloudFn({ num: 25 })
      .then((result) => {
        const actions: PublicActionType[] = result.data;
        this.processActions(actions);
      })
      .catch((error) => {
        console.log(error);
        this.props.snackbarQueue.notify({ title: "Failed to get changelog: " + error });
      });
  };
  processActions = (actions: PublicActionType[]) => {
    const properties = [
      "profile",
      "colorway",
      "designer",
      "icDate",
      "details",
      "notes",
      "gbMonth",
      "gbLaunch",
      "gbEnd",
      "image",
      "shipped",
      "vendors",
      "sales",
    ] as const;
    const processedActions: PublicActionType[] = [...actions].map((action) => {
      const { before, after, ...restAction } = action;
      if (before && after) {
        properties.forEach((prop) => {
          const beforeProp = before[prop];
          const afterProp = after[prop];
          if (isEqual(beforeProp, afterProp)) {
            delete before[prop];
            delete after[prop];
          }
        });
      }
      return {
        ...restAction,
        before,
        after,
      };
    });
    console.log(processedActions);
    this.setState({ processedActions: processedActions });
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
