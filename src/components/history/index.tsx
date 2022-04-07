import { useEffect, useMemo, useState } from "react";
import type { EntityId } from "@reduxjs/toolkit";
import { Card } from "@rmwc/card";
import { Chip } from "@rmwc/chip";
import { LinearProgress } from "@rmwc/linear-progress";
import { List } from "@rmwc/list";
import { Tab, TabBar } from "@rmwc/tabs";
import {
  TopAppBar,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import type { SlideRendererCallback } from "react-swipeable-views-utils";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { DialogSales } from "@c/main/dialog-sales";
import { DrawerDetails } from "@c/main/drawer-details";
import { pageTitle } from "@s/common/constants";
import {
  processedActionsAdapter,
  selectLoading,
  selectProcessedActions,
  selectRecentSetsIds,
  selectTab,
  setTab,
} from "@s/history";
import { historyTabs } from "@s/history/constants";
import { generateSets, getData } from "@s/history/functions";
import { selectAllSets } from "@s/main";
import { selectBottomNav } from "@s/settings";
import {
  capitalise,
  closeModal,
  iconObject,
  openModal,
  truncate,
} from "@s/util/functions";
import { FilterVariantRemove } from "@i";
import { ChangelogEntry } from "./changelog-entry";
import { RecentSetCard } from "./recent-set-card";
import "./index.scss";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentHistoryProps = {
  openNav: () => void;
};

export const ContentHistory = ({ openNav }: ContentHistoryProps) => {
  const dispatch = useAppDispatch();

  const bottomNav = useAppSelector(selectBottomNav);

  const allSets = useAppSelector(selectAllSets);

  const tab = useAppSelector(selectTab);
  const loading = useAppSelector(selectLoading);

  const processedActions = useAppSelector(selectProcessedActions);
  const recentSets = useAppSelector(selectRecentSetsIds);

  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (processedActions.length === 0) {
      getData();
    }
  }, []);
  useEffect(generateSets, [allSets, processedActions]);

  const [detailSet, setDetailSet] = useState<EntityId>("");
  const [detailsOpen, setDetailsOpen] = useState(false);
  const openDetails = (set: EntityId) => {
    openModal();
    setDetailSet(set);
    setDetailsOpen(true);
  };
  const closeDetails = () => {
    closeModal();
    setDetailsOpen(false);
    setTimeout(() => setDetailSet(""), 300);
  };

  const [salesSet, setSalesSet] = useState<EntityId>("");
  const [salesOpen, setSalesOpen] = useState(false);
  const openSales = (set: EntityId) => {
    setSalesSet(set);
    setSalesOpen(true);
  };
  const closeSales = () => {
    setSalesOpen(false);
    setTimeout(() => setSalesSet(""), 300);
  };

  const [filterSet, setFilterSet] = useState({ id: "", title: "" });

  const clearFilter = () => {
    setFilterSet({ id: "", title: "" });
  };

  const filterChangelog = ({ id, title }: { id: string; title: string }) => {
    if (id === filterSet.id) {
      clearFilter();
    } else {
      setFilterSet({ id, title });
      dispatch(setTab("changelog"));
    }
  };

  const filteredActions = useMemo(
    () =>
      filterSet.id
        ? processedActions
            .filter((action) => action.documentId === filterSet.id)
            .map(processedActionsAdapter.selectId)
        : processedActions.map(processedActionsAdapter.selectId),
    [filterSet.id, processedActions]
  );

  const tabRow = (
    <TopAppBarRow className="tab-row">
      <TopAppBarSection alignStart>
        <TabBar
          activeTabIndex={historyTabs.indexOf(tab)}
          onActivate={(e) => dispatch(setTab(historyTabs[e.detail.index]))}
        >
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
          onTrailingIconInteraction={clearFilter}
          trailingIcon={iconObject(<FilterVariantRemove />)}
          trailingIconRemovesChip={false}
        />
      </div>
    </TopAppBarSection>
  ) : null;

  const handleChangeIndex = (index: number) =>
    dispatch(setTab(historyTabs[index]));

  const slideRenderer: SlideRendererCallback = ({ index, key }) => {
    const { [index]: tab } = historyTabs;
    const tabs = {
      changelog: (
        <div key={key} className="history-tab changelog changelog-container">
          <Card
            className={classNames("changelog", {
              hidden: processedActions.length === 0,
            })}
          >
            <List className="three-line" twoLine>
              {filteredActions.map((action) => (
                <ChangelogEntry key={action} actionId={action} />
              ))}
            </List>
          </Card>
        </div>
      ),
      recent: (
        <div key={key} className="history-tab recent recent-grid">
          {recentSets.map((recentSet) => (
            <RecentSetCard
              key={recentSet}
              filterChangelog={filterChangelog}
              filtered={recentSet === filterSet.id}
              openDetails={openDetails}
              recentSetId={recentSet}
              selected={recentSet === detailSet}
            />
          ))}
        </div>
      ),
    };
    return tabs[tab] ?? <div key={key} />;
  };

  return (
    <>
      <TopAppBar className={classNames({ "bottom-app-bar": bottomNav })} fixed>
        {bottomNav ? tabRow : null}
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            <TopAppBarTitle>{pageTitle.history}</TopAppBarTitle>
          </TopAppBarSection>
          {clearFilterButton}
        </TopAppBarRow>
        {bottomNav ? null : tabRow}
        <LinearProgress closed={allSets.length > 0 && !loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div
          className={classNames("main", {
            "extended-app-bar":
              filteredActions.length > 2 || tab !== "changelog",
          })}
        >
          <DrawerDetails
            close={closeDetails}
            open={detailsOpen}
            openSales={openSales}
            set={detailSet}
          />
          <DialogSales close={closeSales} open={salesOpen} set={salesSet} />
          <VirtualizeSwipeableViews
            className={classNames(tab, { swiping })}
            index={historyTabs.indexOf(tab)}
            onChangeIndex={handleChangeIndex}
            onSwitching={() => setSwiping(true)}
            onTransitionEnd={() => setSwiping(false)}
            slideCount={historyTabs.length}
            slideRenderer={slideRenderer}
            springConfig={{
              delay: "0s",
              duration: "0.35s",
              easeFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            }}
          />
        </div>
      </div>
      <Footer />
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
