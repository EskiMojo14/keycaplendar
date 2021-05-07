import React, { useEffect, useState } from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import isEqual from "lodash.isequal";
import { auditProperties } from "../../util/constants";
import { Keyset } from "../../util/constructors";
import { alphabeticalSort, alphabeticalSortProp, iconObject, uniqueArray } from "../../util/functions";
import { QueueType, PublicActionType, ProcessedPublicActionType, SetType, GroupedAction } from "../../util/types";
import { Card } from "@rmwc/card";
import { List } from "@rmwc/list";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { ChangelogEntry } from "../changelog/ChangelogEntry";
import { SetChangelog } from "../changelog/SetChangelog";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";
import { DrawerDetails } from "../main/DrawerDetails";
import { Footer } from "../common/Footer";
import "./ContentChangelog.scss";

type ContentChangelogProps = {
  bottomNav: boolean;
  openNav: () => void;
  snackbarQueue: QueueType;
  allSets: SetType[];
};

export const ContentChangelog = (props: ContentChangelogProps) => {
  const [view, setView] = useState<"all" | "grouped">("grouped");

  const [processedActions, setProcessedActions] = useState<ProcessedPublicActionType[]>([]);
  const [groupedActions, setGroupedActions] = useState<GroupedAction[]>([]);

  const getData = () => {
    const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
    cloudFn({ num: 25 })
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
    if (props.allSets.length > 0) {
      groupBySet(processedActions);
    }
  };
  const getSetById = (id: string) => {
    const index = props.allSets.findIndex((set) => set.id === id);
    return index > -1 ? props.allSets[index] : null;
  };
  const groupBySet = (actions = processedActions) => {
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
  useEffect(groupBySet, [props.allSets]);

  const blankSet = new Keyset();
  const [detailSet, setDetailSet] = useState(blankSet);
  const openDetails = (set: SetType) => {
    setDetailSet(set);
  };
  const closeDetails = () => {
    setDetailSet(blankSet);
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
                selected={view === "all"}
                onClick={() => setView("all")}
              />
            </SegmentedButton>
          </TopAppBarSection>
        </TopAppBarRow>
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar">
          <DrawerDetails open={!!detailSet.id} close={closeDetails} set={detailSet} device="mobile" view="compact" />
          {view === "grouped" ? (
            <div className="changelog-grid">
              {groupedActions.map((groupedAction) => (
                <SetChangelog
                  groupedAction={groupedAction}
                  detailSet={detailSet}
                  openDetails={openDetails}
                  key={groupedAction.title}
                />
              ))}
            </div>
          ) : (
            <div className="changelog-container">
              <Card className={classNames("changelog", { hidden: processedActions.length === 0 })}>
                <List twoLine className="three-line">
                  {processedActions.map((action) => (
                    <ChangelogEntry action={action} key={action.timestamp} />
                  ))}
                </List>
              </Card>
            </div>
          )}
        </div>
      </div>
      <Footer />
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
