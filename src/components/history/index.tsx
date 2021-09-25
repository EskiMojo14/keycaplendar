import { useEffect, useState } from "react";
import classNames from "classnames";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { pageTitle } from "@s/common/constants";
import { selectLoading, selectProcessedActions, selectRecentSets, selectTab, setTab } from "@s/history";
import { historyTabs } from "@s/history/constants";
import { generateSets, getData } from "@s/history/functions";
import { RecentSet } from "@s/history/types";
import { selectAllSets } from "@s/main";
import { Keyset } from "@s/main/constructors";
import { SetType } from "@s/main/types";
import { selectBottomNav } from "@s/settings";
import { capitalise, closeModal, hasKey, iconObject, openModal, truncate } from "@s/util/functions";
import { Card } from "@rmwc/card";
import { Chip } from "@rmwc/chip";
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
import { Footer } from "@c/common/footer";
import { DialogSales } from "@c/main/dialog-sales";
import { DrawerDetails } from "@c/main/drawer-details";
import { ChangelogEntry } from "./changelog-entry";
import { RecentSetCard } from "./recent-set-card";
import "./index.scss";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentHistoryProps = {
  openNav: () => void;
};

export const ContentHistory = (props: ContentHistoryProps) => {
  const dispatch = useAppDispatch();

  const bottomNav = useAppSelector(selectBottomNav);

  const allSets = useAppSelector(selectAllSets);

  const tab = useAppSelector(selectTab);
  const loading = useAppSelector(selectLoading);

  const processedActions = useAppSelector(selectProcessedActions);
  const recentSets = useAppSelector(selectRecentSets);

  const [swiping, setSwiping] = useState(false);

  useEffect(() => {
    if (processedActions.length === 0) {
      getData();
    }
  }, []);
  useEffect(generateSets, [JSON.stringify(allSets), processedActions]);

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
      dispatch(setTab("changelog"));
    }
  };

  const filteredActions = filterSet.id
    ? processedActions.filter((action) => action.documentId === filterSet.id)
    : processedActions;

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
    dispatch(setTab(historyTabs[index]));
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
              key={recentSet.id}
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
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNav })}>
        {bottomNav ? tabRow : null}
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle>{pageTitle.history}</TopAppBarTitle>
          </TopAppBarSection>
          {clearFilterButton}
        </TopAppBarRow>
        {bottomNav ? null : tabRow}
        <LinearProgress closed={allSets.length > 0 && !loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="content-container">
        <div className={classNames("main", { "extended-app-bar": filteredActions.length > 2 || tab !== "changelog" })}>
          <DrawerDetails open={detailsOpen} close={closeDetails} set={detailSet} openSales={openSales} />
          <DialogSales open={salesOpen} close={closeSales} set={salesSet} />
          <VirtualizeSwipeableViews
            className={classNames(tab, { swiping })}
            springConfig={{
              duration: "0.35s",
              easeFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
              delay: "0s",
            }}
            slideCount={historyTabs.length}
            index={historyTabs.indexOf(tab)}
            onChangeIndex={handleChangeIndex}
            slideRenderer={slideRenderer}
            onSwitching={() => setSwiping(true)}
            onTransitionEnd={() => setSwiping(false)}
          />
        </div>
      </div>
      <Footer />
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};
