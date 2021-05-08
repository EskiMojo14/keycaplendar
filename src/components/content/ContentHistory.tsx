import React, { useEffect, useState } from "react";
import classNames from "classnames";
import firebase from "../../firebase";
import isEqual from "lodash.isequal";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import { auditProperties, historyTabs } from "../../util/constants";
import { Keyset } from "../../util/constructors";
import {
  alphabeticalSortProp,
  capitalise,
  closeModal,
  hasKey,
  iconObject,
  openModal,
  truncate,
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
import { Chip } from "@rmwc/chip";

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

  const [processedActions, setProcessedActions] = useState<ProcessedPublicActionType[]>([]);

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
  const [recentSets, setRecentSets] = useState<RecentSet[]>([]);

  const generateSets = (actions = processedActions) => {
    const ids = uniqueArray(actions.map((action) => action.documentId));
    const recentSets: RecentSet[] = ids.map((id) => {
      const filteredActions = alphabeticalSortProp(
        actions.filter((action) => action.documentId === id),
        "timestamp",
        true
      );
      const latestTimestamp = filteredActions[0].timestamp;
      const title = filteredActions[0].title;
      const designer = filteredActions[0].after.designer
        ? filteredActions[0].after.designer
        : filteredActions[0].before.designer
        ? filteredActions[0].before.designer
        : null;
      const deleted = filteredActions[0].action === "deleted";
      return {
        id: id,
        title: title,
        designer: designer,
        deleted: deleted,
        currentSet: getSetById(id),
        latestTimestamp: latestTimestamp,
      };
    });
    alphabeticalSortProp(recentSets, "latestTimestamp", true);
    setRecentSets(recentSets);
  };
  useEffect(generateSets, [JSON.stringify(props.allSets)]);

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

  const [filterSet, setFilterSet] = useState({ id: "", title: "" });

  const clearFilter = () => {
    setFilterSet({ id: "", title: "" });
  };

  const filterChangelog = (recentSet: RecentSet) => {
    const { id, title } = recentSet;
    if (id === filterSet.id) {
      clearFilter();
    } else {
      setFilterSet({ id, title });
      setTab("changelog");
      scrollTo(0, 0);
    }
  };

  const filteredActions = filterSet.id
    ? processedActions.filter((action) => action.documentId === filterSet.id)
    : processedActions;

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

  const clearFilterButton = filterSet.id ? (
    <TopAppBarSection alignEnd>
      <div className="clear-filter">
        <Chip
          label={truncate(filterSet.title, 20)}
          trailingIcon={iconObject(
            <svg
              xmlns="http://www.w3.org/2000/svg"
              xmlnsXlink="http://www.w3.org/1999/xlink"
              version="1.1"
              width="24"
              height="24"
              viewBox="0 0 24 24"
            >
              <path fill="none" d="M0,0h24v24H0V0z" />
              <path d="M21 8H3V6H21V8M13.81 16H10V18H13.09C13.21 17.28 13.46 16.61 13.81 16M18 11H6V13H18V11M21.12 15.46L19 17.59L16.88 15.46L15.47 16.88L17.59 19L15.47 21.12L16.88 22.54L19 20.41L21.12 22.54L22.54 21.12L20.41 19L22.54 16.88L21.12 15.46Z" />
            </svg>
          )}
          trailingIconRemovesChip={false}
          onTrailingIconInteraction={clearFilter}
        />
      </div>
    </TopAppBarSection>
  ) : null;

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
              filterChangelog={filterChangelog}
              filtered={recentSet.id === filterSet.id}
              selected={recentSet.id === detailSet.id}
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
              {filteredActions.map((action) => (
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
          {clearFilterButton}
        </TopAppBarRow>
        {props.bottomNav ? null : tabRow}
        <LinearProgress closed={props.allSets.length > 0 && !loading} />
      </TopAppBar>
      {props.bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className={classNames("main", { "extended-app-bar": filteredActions.length > 2 || tab !== "changelog" })}>
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
