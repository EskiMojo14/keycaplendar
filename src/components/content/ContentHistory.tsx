import React, { useEffect, useState } from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import isEqual from "lodash.isequal";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import { auditProperties, historyTabs } from "../../util/constants";
import { Keyset } from "../../util/constructors";
import {
  alphabeticalSort,
  alphabeticalSortProp,
  capitalise,
  closeModal,
  hasKey,
  openModal,
  uniqueArray,
} from "../../util/functions";
import { QueueType, PublicActionType, ProcessedPublicActionType, SetType, RecentSet } from "../../util/types";
import { Card } from "@rmwc/card";
import { LinearProgress } from "@rmwc/linear-progress";
import { List } from "@rmwc/list";
import { Tab, TabBar } from "@rmwc/tabs";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
} from "@rmwc/top-app-bar";
import { DialogSales } from "../main/DialogSales";
import { DrawerDetails } from "../main/DrawerDetails";
import { ChangelogEntry } from "../changelog/ChangelogEntry";
import { RecentSetCard } from "../changelog/RecentSetCard";
import { Footer } from "../common/Footer";
import "./ContentHistory.scss";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentHistoryProps = {
  bottomNav: boolean;
  openNav: () => void;
  setPage: (page: string) => void;
  snackbarQueue: QueueType;
  allSets: SetType[];
};

export const ContentHistory = (props: ContentHistoryProps) => {
  const [tab, setTab] = useState("recent");
  const [loading, setLoading] = useState(false);

  const [processedActions, setProcessedActions] = useState<ProcessedPublicActionType[]>([]);
  const [recentSets, setRecentSets] = useState<RecentSet[]>([]);

  const getData = () => {
    const cloudFn = firebase.functions().httpsCallable("getPublicAudit");
    setLoading(true);
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
    generateSets(processedActions);
    setLoading(false);
  };
  const getSetById = (id: string) => {
    const index = props.allSets.findIndex((set) => set.id === id);
    return index > -1 ? props.allSets[index] : null;
  };
  const generateSets = (actions = processedActions) => {
    const ids = uniqueArray(actions.map((action) => action.documentId));
    const recentSets: RecentSet[] = ids.map((id) => {
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
      };
    });
    alphabeticalSortProp(recentSets, "latestTimestamp", true);
    setRecentSets(recentSets);
  };
  useEffect(generateSets, [props.allSets]);

  const blankSet = new Keyset();

  const [detailSet, setDetailSet] = useState(blankSet);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openDetails = (set: SetType) => {
    openModal();
    setDetailSet(set);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    closeModal();
    setDetailsOpen(false);
    setTimeout(() => setDetailSet(blankSet), 300);
  };

  const [salesSet, setSalesSet] = useState(blankSet);
  const [salesOpen, setSalesOpen] = useState(false);
  const openSales = (set: SetType) => {
    setSalesSet(set);
    setSalesOpen(true);
  };
  const closeSales = () => {
    setSalesOpen(false);
    setTimeout(() => setSalesSet(blankSet), 300);
  };

  const tabRow = (
    <TopAppBarRow className="tab-row">
      <TopAppBarSection alignStart>
        <TabBar activeTabIndex={historyTabs.indexOf(tab)} onActivate={(e) => setTab(historyTabs[e.detail.index])}>
          {historyTabs.map((tab) => (
            <Tab key={tab}>{capitalise(tab)}</Tab>
          ))}
        </TabBar>
      </TopAppBarSection>
    </TopAppBarRow>
  );

  const handleChangeIndex = (index: number) => {
    setTab(historyTabs[index]);
  };

  const slideRenderer = (params: any) => {
    const { key, index } = params;
    const tab = historyTabs[index];
    const tabs = {
      recent: (
        <div className="history-tab recent recent-grid" key={key}>
          {recentSets.map((recentSet) => (
            <RecentSetCard
              recentSet={recentSet}
              detailSet={detailSet}
              openDetails={openDetails}
              setPage={props.setPage}
              key={recentSet.title}
            />
          ))}
        </div>
      ),
      changelog: (
        <div className="history-tab changelog changelog-container" key={key}>
          <Card className={classNames("changelog", { hidden: processedActions.length === 0 })}>
            <List twoLine className="three-line">
              {processedActions.map((action) => (
                <ChangelogEntry action={action} key={action.timestamp} />
              ))}
            </List>
          </Card>
        </div>
      ),
    };
    return hasKey(tabs, tab) && tabs[tab] ? tabs[tab] : <div key={key} />;
  };

  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": props.bottomNav })}>
        {props.bottomNav ? tabRow : null}
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>History</TopAppBarTitle>
          </TopAppBarSection>
        </TopAppBarRow>
        {props.bottomNav ? null : tabRow}
        <LinearProgress closed={props.allSets.length > 0 && !loading} />
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className="main extended-app-bar">
          <DrawerDetails
            open={detailsOpen}
            close={closeDetails}
            set={detailSet}
            openSales={openSales}
            device="mobile"
            view="compact"
          />
          <DialogSales open={salesOpen} close={closeSales} set={salesSet} />
          <VirtualizeSwipeableViews
            className={tab}
            springConfig={{
              duration: "0.35s",
              easeFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              delay: "0s",
            }}
            slideCount={historyTabs.length}
            index={historyTabs.indexOf(tab)}
            onChangeIndex={handleChangeIndex}
            slideRenderer={slideRenderer}
          />
        </div>
      </div>
      <Footer />
      {props.bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
