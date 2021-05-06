import React from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import isEqual from "lodash.isequal";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import { auditProperties } from "../../util/constants";
import { alphabeticalSort, alphabeticalSortProp, uniqueArray } from "../../util/functions";
import { QueueType, PublicActionType, ProcessedPublicActionType, SetType } from "../../util/types";

type ContentChangelogProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
  allSets: SetType[];
};

type GroupedAction = {
  id: string;
  title: string;
  currentSet: SetType | null;
  latestTimestamp: string;
  actions: ProcessedPublicActionType[];
};

type ContentChangelogState = {
  processedActions: ProcessedPublicActionType[];
  groupedActions: GroupedAction[];
};

export class ContentChangelog extends React.Component<ContentChangelogProps> {
  state: ContentChangelogState = {
    processedActions: [],
    groupedActions: [],
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
    const processedActions: ProcessedPublicActionType[] = [...actions].map((action) => {
      const { before, after, ...restAction } = action;
      const title =
        action.action !== "deleted"
          ? `${action.after.profile} ${action.after.colorway}`
          : `${action.before.profile} ${action.before.colorway}`;
      if (before && after) {
        auditProperties.forEach((prop) => {
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
        title,
      };
    });
    this.setState({ processedActions: processedActions });
    this.groupBySet(processedActions);
  };
  getSetInfo = (id: string) => {
    const index = this.props.allSets.findIndex((set) => set.id === id);
    return index > -1 ? this.props.allSets[index] : null;
  };
  groupBySet = (actions: ProcessedPublicActionType[]) => {
    const ids = uniqueArray(actions.map((action) => action.documentId));
    const groupedActions: GroupedAction[] = ids.map((id) => {
      const filteredActions = actions.filter((action) => action.documentId === id);
      const latestTimestamp = alphabeticalSort(
        filteredActions.map((action) => action.timestamp),
        true
      )[0];
      const title = filteredActions[filteredActions.findIndex((action) => action.timestamp === latestTimestamp)].title;
      return {
        id: id,
        title: title,
        currentSet: this.getSetInfo(id),
        latestTimestamp: latestTimestamp,
        actions: filteredActions,
      };
    });
    alphabeticalSortProp(groupedActions, "latestTimestamp", true);
    this.setState({ groupedActions: groupedActions });
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
