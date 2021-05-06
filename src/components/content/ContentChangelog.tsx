import React, { useEffect, useState } from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import isEqual from "lodash.isequal";
import { auditProperties } from "../../util/constants";
import { alphabeticalSort, alphabeticalSortProp, iconObject, uniqueArray } from "../../util/functions";
import { QueueType, PublicActionType, ProcessedPublicActionType, SetType } from "../../util/types";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";

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
  view: "chronological" | "grouped";
};

export const ContentChangelog = (props: ContentChangelogProps) => {
  const [processedActions, setProcessedActions] = useState<ProcessedPublicActionType[]>([]);
  const [groupedActions, setGroupedActions] = useState<GroupedAction[]>([]);
  const [view, setView] = useState<"chronological" | "grouped">("grouped");
  const getData = () => {
    const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
    cloudFn({ num: 0 })
      .then((result) => {
        const actions: PublicActionType[] = result.data;
        processActions(actions);
      })
      .catch((error) => {
        console.log(error);
        props.snackbarQueue.notify({ title: "Failed to get changelog: " + error });
      });
  };
  useEffect(getData, []);
  const processActions = (actions: PublicActionType[]) => {
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
    setProcessedActions(processedActions);
    groupBySet(processedActions);
  };
  const getSetById = (id: string) => {
    const index = props.allSets.findIndex((set) => set.id === id);
    return index > -1 ? props.allSets[index] : null;
  };
  const groupBySet = (actions: ProcessedPublicActionType[]) => {
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
        currentSet: getSetById(id),
        latestTimestamp: latestTimestamp,
        actions: filteredActions,
      };
    });
    alphabeticalSortProp(groupedActions, "latestTimestamp", true);
    setGroupedActions(groupedActions);
  };
  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": props.bottomNav })}>
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>Changelog</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            <SegmentedButton toggle>
              <SegmentedButtonSegment
                label="Grouped"
                icon={iconObject(
                  <svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px">
                    <path d="M0 0h24v24H0V0z" fill="none" />
                    <path d="M5 5h4v6H5zm10 8h4v6h-4zM5 17h4v2H5zM15 5h4v2h-4z" opacity=".3" />
                    <path d="M3 13h8V3H3v10zm2-8h4v6H5V5zm8 16h8V11h-8v10zm2-8h4v6h-4v-6zM13 3v6h8V3h-8zm6 4h-4V5h4v2zM3 21h8v-6H3v6zm2-4h4v2H5v-2z" />
                  </svg>
                )}
                selected={view === "grouped"}
                onClick={() => setView("grouped")}
              />
              <SegmentedButtonSegment
                label="All"
                icon="history"
                selected={view === "chronological"}
                onClick={() => setView("chronological")}
              />
            </SegmentedButton>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className={"content-container"}>
        <div className="main extended-app-bar"></div>
      </div>
      <Footer />
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
