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
import { useParams } from "react-router-dom";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import type { SlideRendererCallback } from "react-swipeable-views-utils";
import { Footer } from "@c/common/footer";
import { DialogSales } from "@c/main/dialog-sales";
import { DrawerDetails } from "@c/main/drawer-details";
import { useAppDispatch, useAppSelector } from "@h";
import useBottomNav from "@h/use-bottom-nav";
import useDelayedValue from "@h/use-delayed-value";
import {
  processedActionsAdapter,
  selectLoading,
  selectProcessedActions,
  selectRecentSetsIds,
} from "@s/history";
import { historyTabs } from "@s/history/constants";
import { getData } from "@s/history/thunks";
import type { HistoryTab } from "@s/history/types";
import { selectAllSets, selectKeysetByString } from "@s/main";
import { replace } from "@s/router";
import { pageTitle } from "@s/router/constants";
import {
  arrayIncludes,
  capitalise,
  iconObject,
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

  const bottomNav = useBottomNav();

  const allSets = useAppSelector(selectAllSets);

  const { keyset = "", tab } =
    useParams<{ keyset?: string; tab?: HistoryTab }>();

  const originalUrlSet = useAppSelector((state) =>
    selectKeysetByString(state, keyset)
  );

  const urlSet = useDelayedValue(originalUrlSet, 300, { delayed: [undefined] });

  const openDetails = (set: EntityId) =>
    dispatch(replace(`/history/recent/${set}`));
  const closeDetails = () => dispatch(replace(`/history/${tab}`));

  useEffect(() => {
    if (!tab || !arrayIncludes(historyTabs, tab)) {
      dispatch(replace("/history/recent"));
    }
  }, [tab]);

  const loading = useAppSelector(selectLoading);

  const processedActions = useAppSelector(selectProcessedActions);
  const recentSets = useAppSelector(selectRecentSetsIds);

  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (processedActions.length === 0) {
      dispatch(getData());
    }
  }, []);

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

  const clearFilter = () => dispatch(replace(`/history/${tab}`));

  const filterChangelog = (id: EntityId) => {
    if (id === originalUrlSet?.id) {
      clearFilter();
    } else {
      dispatch(replace(`/history/changelog/${id}`));
    }
  };

  const filteredActions = useMemo(
    () =>
      originalUrlSet?.id
        ? processedActions
            .filter((action) => action.documentId === originalUrlSet?.id)
            .map(processedActionsAdapter.selectId)
        : processedActions.map(processedActionsAdapter.selectId),
    [originalUrlSet?.id, processedActions]
  );

  const tabRow = (
    <TopAppBarRow className="tab-row">
      <TopAppBarSection alignStart>
        <TabBar
          activeTabIndex={tab ? historyTabs.indexOf(tab) : 0}
          onActivate={(e) => {
            const { [e.detail.index]: newTab } = historyTabs;
            dispatch(
              replace(
                `/history/${newTab}${
                  newTab === "changelog" && keyset ? `/${keyset}` : ""
                }`
              )
            );
          }}
        >
          {historyTabs.map((tab) => (
            <Tab key={tab}>{capitalise(tab)}</Tab>
          ))}
        </TabBar>
      </TopAppBarSection>
    </TopAppBarRow>
  );

  const clearFilterButton = originalUrlSet && (
    <TopAppBarSection alignEnd>
      <div className="clear-filter">
        <Chip
          label={truncate(
            `${originalUrlSet.profile} ${originalUrlSet.colorway}`,
            20
          )}
          onTrailingIconInteraction={clearFilter}
          trailingIcon={iconObject(<FilterVariantRemove />)}
          trailingIconRemovesChip={false}
        />
      </div>
    </TopAppBarSection>
  );

  const handleChangeIndex = (index: number) =>
    dispatch(replace(`/history/${historyTabs[index]}`));

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
              openDetails={openDetails}
              recentSetId={recentSet}
              selected={recentSet === urlSet?.id}
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
        {bottomNav && tabRow}
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            <TopAppBarTitle>{pageTitle.history}</TopAppBarTitle>
          </TopAppBarSection>
          {clearFilterButton}
        </TopAppBarRow>
        {!bottomNav && tabRow}
        <LinearProgress closed={allSets.length > 0 && !loading} />
      </TopAppBar>
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div
          className={classNames("main", {
            "extended-app-bar":
              filteredActions.length > 2 || tab !== "changelog",
          })}
        >
          <DrawerDetails
            close={closeDetails}
            open={!!originalUrlSet && tab === "recent"}
            openSales={openSales}
            set={urlSet}
          />
          <DialogSales close={closeSales} open={salesOpen} set={salesSet} />
          <VirtualizeSwipeableViews
            className={classNames(tab, { swiping })}
            index={tab ? historyTabs.indexOf(tab) : 0}
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
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};
