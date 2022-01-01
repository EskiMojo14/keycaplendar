import { useEffect, useState } from "react";
import { LinearProgress } from "@rmwc/linear-progress";
import { Tab, TabBar } from "@rmwc/tabs";
import {
  TopAppBar,
  TopAppBarActionItem,
  TopAppBarFixedAdjust,
  TopAppBarNavigationIcon,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarTitle,
} from "@rmwc/top-app-bar";
import classNames from "classnames";
import SwipeableViews from "react-swipeable-views";
import type { SlideRendererCallback } from "react-swipeable-views-utils";
import { virtualize } from "react-swipeable-views-utils";
import { VirtuosoGrid } from "react-virtuoso";
import { useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import firebase from "@s/firebase";
import { selectBottomNav } from "@s/settings";
import {
  selectData,
  selectLoading,
  selectSettings,
  selectSort,
  selectTab,
} from "@s/statistics";
import { statsTabs } from "@s/statistics/constants";
import {
  getData,
  setSetting,
  setSort,
  setStatisticsTab,
} from "@s/statistics/functions";
import type { StatisticsType } from "@s/statistics/types";
import {
  capitalise,
  hasKey,
  iconObject,
  useBoolStates,
} from "@s/util/functions";
import {
  Category,
  DateRange,
  SortAlphabeticalVariant,
  SortNumericVariant,
} from "@i";
import { CalendarCard, CalendarSummaryCard } from "./calendar-card";
import { DialogStatistics } from "./dialog-statistics";
import { StatusCard, StatusSummaryCard } from "./pie-card";
import { TableCard, TableSummaryCard } from "./table-card";
import {
  ShippedCard,
  ShippedSummaryCard,
  TimelinesCard,
  TimelinesSummaryCard,
} from "./timeline-card";
import "./index.scss";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentStatisticsProps = {
  openNav: () => void;
};

export const ContentStatistics = ({ openNav }: ContentStatisticsProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const statisticsTab = useAppSelector(selectTab);
  const loading = useAppSelector(selectLoading);
  const statisticsData = useAppSelector(selectData);
  const settings = useAppSelector(selectSettings);
  const statisticsSort = useAppSelector(selectSort);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [closeCategoryDialog, openCategoryDialog] = useBoolStates(
    setCategoryDialogOpen
  );

  useEffect(() => {
    if (statisticsData.timelines.icDate.summary.months.length === 0) {
      getData();
    }
  }, []);

  const handleChangeIndex = (index: number) => {
    setStatisticsTab(statsTabs[index]);
  };

  const tooltipAlign = bottomNav ? "top" : "bottom";

  const categoryButtons = (tab: keyof StatisticsType) =>
    device === "desktop" ? (
      <SegmentedButton toggle>
        <SegmentedButtonSegment
          label="Profile"
          onClick={() => {
            setSetting(tab, "profile");
          }}
          selected={settings[tab] === "profile"}
        />
        <SegmentedButtonSegment
          label="Designer"
          onClick={() => {
            setSetting(tab, "designer");
          }}
          selected={settings[tab] === "designer"}
        />
        <SegmentedButtonSegment
          label="Vendor"
          onClick={() => {
            setSetting(tab, "vendor");
          }}
          selected={settings[tab] === "vendor"}
        />
      </SegmentedButton>
    ) : (
      withTooltip(
        <TopAppBarActionItem
          className="category-button"
          icon={iconObject(<Category />)}
          onClick={openCategoryDialog}
          style={{ "--animation-delay": 0 }}
        />,
        "Category",
        { align: tooltipAlign }
      )
    );

  const genericButtons = (
    <>
      <SegmentedButton toggle>
        {withTooltip(
          <SegmentedButtonSegment
            icon={iconObject(<SortNumericVariant />)}
            onClick={() => {
              if (hasKey(statisticsSort, statisticsTab)) {
                setSort(statisticsTab, "total");
              }
            }}
            selected={
              hasKey(statisticsSort, statisticsTab) &&
              statisticsSort[statisticsTab] === "total"
            }
          />,
          "Sort by total",
          { align: tooltipAlign }
        )}
        {withTooltip(
          <SegmentedButtonSegment
            icon={iconObject(<SortAlphabeticalVariant />)}
            onClick={() => {
              if (hasKey(statisticsSort, statisticsTab)) {
                setSort(statisticsTab, "alphabetical");
              }
            }}
            selected={
              hasKey(statisticsSort, statisticsTab) &&
              statisticsSort[statisticsTab] === "alphabetical"
            }
          />,
          "Sort alphabetically",
          { align: tooltipAlign }
        )}
      </SegmentedButton>
      {hasKey(settings, statisticsTab) ? categoryButtons(statisticsTab) : null}
    </>
  );

  const buttons = {
    calendar: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortNumericVariant />)}
              onClick={() => {
                setSort("calendar", "total");
              }}
              selected={statisticsSort.calendar === "total"}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortAlphabeticalVariant />)}
              onClick={() => {
                setSort("calendar", "alphabetical");
              }}
              selected={statisticsSort.calendar === "alphabetical"}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            label="IC"
            onClick={() => {
              setSetting("calendarCat", "icDate");
            }}
            selected={settings.calendarCat === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() => {
              setSetting("calendarCat", "gbLaunch");
            }}
            selected={settings.calendarCat === "gbLaunch"}
          />
        </SegmentedButton>
        {categoryButtons("calendarGroup")}
      </>
    ),
    duration: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortNumericVariant />)}
              onClick={() => {
                setSort("duration", "total");
              }}
              selected={statisticsSort.duration === "total"}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortNumericVariant />)}
              onClick={() => {
                setSort("duration", "alphabetical");
              }}
              selected={statisticsSort.duration === "alphabetical"}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<DateRange />)}
              onClick={() => {
                setSort("duration", "duration");
              }}
              selected={statisticsSort.duration === "duration"}
            />,
            "Sort by duration",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            label="IC"
            onClick={() => {
              setSetting("durationCat", "icDate");
            }}
            selected={settings.durationCat === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() => {
              setSetting("durationCat", "gbLaunch");
            }}
            selected={settings.durationCat === "gbLaunch"}
          />
        </SegmentedButton>
        {categoryButtons("durationGroup")}
      </>
    ),
    shipped: genericButtons,
    status: genericButtons,
    summary: (
      <>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            label="IC"
            onClick={() => {
              setSetting("summary", "icDate");
            }}
            selected={settings.summary === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() => {
              setSetting("summary", "gbLaunch");
            }}
            selected={settings.summary === "gbLaunch"}
          />
        </SegmentedButton>
      </>
    ),
    timelines: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortNumericVariant />)}
              onClick={() => {
                setSort("timelines", "total");
              }}
              selected={statisticsSort.timelines === "total"}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortAlphabeticalVariant />)}
              onClick={() => {
                setSort("timelines", "alphabetical");
              }}
              selected={statisticsSort.timelines === "alphabetical"}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            label="IC"
            onClick={() => {
              setSetting("timelinesCat", "icDate");
            }}
            selected={settings.timelinesCat === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() => {
              setSetting("timelinesCat", "gbLaunch");
            }}
            selected={settings.timelinesCat === "gbLaunch"}
          />
        </SegmentedButton>
        {categoryButtons("timelinesGroup")}
      </>
    ),
    vendors: genericButtons,
  };

  const categoryDialog =
    statisticsTab !== "summary" && device !== "desktop" ? (
      <DialogStatistics
        onClose={closeCategoryDialog}
        open={categoryDialogOpen}
      />
    ) : null;

  const tabRow = (
    <TopAppBarRow className="tab-row">
      <TopAppBarSection alignStart>
        <TabBar
          activeTabIndex={statsTabs.indexOf(statisticsTab)}
          onActivate={(e) => setStatisticsTab(statsTabs[e.detail.index])}
        >
          {statsTabs.map((tab) => (
            <Tab key={tab}>{capitalise(tab)}</Tab>
          ))}
        </TabBar>
      </TopAppBarSection>
    </TopAppBarRow>
  );

  const slideRenderer: SlideRendererCallback = ({ index, key }) => {
    const { [index]: tab } = statsTabs;
    const tabs = {
      calendar: (
        <div key={key} className="stats-tab calendar">
          <VirtuosoGrid
            itemClassName="stats-grid-item half-span"
            itemContent={(index) => {
              const {
                calendar: {
                  [settings.calendarCat]: {
                    breakdown: {
                      [settings.calendarGroup]: { [index]: data },
                    },
                  },
                },
              } = statisticsData;
              return (
                <CalendarCard
                  data={data}
                  end={statisticsData.calendar[settings.calendarCat].end}
                  start={statisticsData.calendar[settings.calendarCat].start}
                  unit={settings.calendarCat === "gbLaunch" ? "GB" : "IC"}
                />
              );
            }}
            listClassName="stats-grid"
            overscan={1000}
            totalCount={
              statisticsData.calendar[settings.calendarCat].breakdown[
                settings.calendarGroup
              ].length
            }
            useWindowScroll
          />
        </div>
      ),
      duration: (
        <div key={key} className="stats-tab duration">
          <VirtuosoGrid
            itemClassName="stats-grid-item full-span"
            itemContent={(index) => {
              const {
                duration: {
                  [settings.durationCat]: {
                    breakdown: {
                      [settings.durationGroup]: { [index]: data },
                    },
                  },
                },
              } = statisticsData;
              return (
                <TableCard
                  data={data}
                  tab="duration"
                  unit={`Time ${
                    settings.durationCat === "icDate" ? "(months)" : "(days)"
                  }`}
                />
              );
            }}
            listClassName="stats-grid"
            overscan={1000}
            totalCount={
              statisticsData.duration[settings.durationCat].breakdown[
                settings.durationGroup
              ].length
            }
            useWindowScroll
          />
        </div>
      ),
      shipped: (
        <div key={key} className="stats-tab shipped">
          <VirtuosoGrid
            itemClassName="stats-grid-item full-span"
            itemContent={(index) => {
              const {
                shipped: {
                  breakdown: {
                    [settings.shipped]: { [index]: data },
                  },
                },
              } = statisticsData;
              return (
                <ShippedCard
                  data={data}
                  months={statisticsData.shipped.months}
                />
              );
            }}
            listClassName="stats-grid"
            overscan={1000}
            totalCount={
              statisticsData.shipped.breakdown[settings.shipped].length
            }
            useWindowScroll
          />
        </div>
      ),
      status: (
        <div key={key} className="stats-tab status">
          <VirtuosoGrid
            itemClassName="stats-grid-item"
            itemContent={(index) => {
              const {
                status: {
                  breakdown: {
                    [settings.status]: { [index]: data },
                  },
                },
              } = statisticsData;
              return <StatusCard data={data} />;
            }}
            listClassName="stats-grid"
            overscan={1000}
            totalCount={statisticsData.status.breakdown[settings.status].length}
            useWindowScroll
          />
        </div>
      ),
      summary: (
        <div key={key} className="stats-tab stats-grid summary">
          <div className="stats-grid-item full-span">
            <TimelinesSummaryCard
              breakdownData={
                statisticsData.timelines[settings.summary].breakdown.profile
              }
              category={settings.summary}
              chartKeys={["summary"]}
              data={statisticsData.timelines[settings.summary].summary}
              months={statisticsData.timelines[settings.summary].months}
              note="Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are
            included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019."
              overline="Timelines"
              singleTheme="secondary"
            />
          </div>
          <div className="stats-grid-item full-span">
            <TimelinesSummaryCard
              category={settings.summary}
              chartKeys={statisticsData.timelines[settings.summary].allProfiles}
              data={statisticsData.timelines[settings.summary].summary}
              months={statisticsData.timelines[settings.summary].months}
              overline="Timelines"
            />
          </div>
          <div className="stats-grid-item full-span">
            <CalendarSummaryCard
              breakdownData={
                statisticsData.calendar[settings.summary].breakdown.profile
              }
              category={settings.summary}
              data={statisticsData.calendar[settings.summary].summary}
              end={statisticsData.calendar[settings.summary].end}
              overline="Calendar"
              start={statisticsData.calendar[settings.summary].start}
              unit={settings.summary === "gbLaunch" ? "GB" : "IC"}
            />
          </div>
          <div className="stats-grid-item full-span">
            <StatusSummaryCard
              breakdownData={statisticsData.status.breakdown.profile}
              data={statisticsData.status.summary}
              overline="Status"
            />
          </div>
          <div className="stats-grid-item full-span">
            <ShippedSummaryCard
              breakdownData={statisticsData.shipped.breakdown.profile}
              category={settings.summary}
              data={statisticsData.shipped.summary}
              months={statisticsData.shipped.months}
              overline="Shipped"
            />
          </div>
          <div className="stats-grid-item full-span">
            <TableSummaryCard
              breakdownData={
                statisticsData.duration[settings.summary].breakdown.profile
              }
              category={settings.summary}
              data={statisticsData.duration[settings.summary].summary}
              overline="Duration"
              tab="duration"
              theme="secondary"
              unit={`Time ${
                settings.summary === "icDate" ? "(months)" : "(days)"
              }`}
            />
          </div>
          <div className="stats-grid-item full-span">
            <TableSummaryCard
              breakdownData={statisticsData.vendors.breakdown.profile}
              category={settings.summary}
              data={statisticsData.vendors.summary}
              note="Only includes sets that have completed GB."
              overline="Vendors"
              tab="vendors"
              theme="secondary"
              unit="Vendors"
            />
          </div>
        </div>
      ),
      timelines: (
        <div key={key} className="stats-tab stats-tab--padded timelines">
          {settings.timelinesGroup === "profile" ? (
            <TimelinesCard
              data={
                statisticsData.timelines[settings.timelinesCat].breakdown[
                  settings.timelinesGroup
                ]
              }
              months={statisticsData.timelines[settings.timelinesCat].months}
              singleTheme="primary"
            />
          ) : (
            <TimelinesCard
              allProfiles={
                statisticsData.timelines[settings.timelinesCat].allProfiles
              }
              data={
                statisticsData.timelines[settings.timelinesCat].breakdown[
                  settings.timelinesGroup
                ]
              }
              months={statisticsData.timelines[settings.timelinesCat].months}
            />
          )}
        </div>
      ),
      vendors: (
        <div key={key} className="stats-tab vendors">
          <VirtuosoGrid
            itemClassName="stats-grid-item full-span"
            itemContent={(index) => {
              const {
                vendors: {
                  breakdown: {
                    [settings.vendors]: { [index]: data },
                  },
                },
              } = statisticsData;
              return <TableCard data={data} tab="vendors" unit="Vendors" />;
            }}
            listClassName="stats-grid"
            overscan={1000}
            totalCount={
              statisticsData.vendors.breakdown[settings.vendors].length
            }
            useWindowScroll
          />
        </div>
      ),
    };
    return hasKey(tabs, tab) && tabs[tab] ? tabs[tab] : <div key={key} />;
  };

  const createStatistics = () => {
    const cloudFn = firebase
      .functions()
      .httpsCallable("createStatistics", { timeout: 540000 });
    cloudFn()
      .then(() => {
        firebase.storage().ref("statisticsDataTest.json").getDownloadURL();
      })
      .catch(console.log);
  };

  return (
    <>
      <TopAppBar className={classNames({ "bottom-app-bar": bottomNav })} fixed>
        {bottomNav ? tabRow : null}
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={openNav} />
            <TopAppBarTitle onClick={createStatistics}>
              {device !== "mobile" ? pageTitle.statistics : null}
            </TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {hasKey(buttons, statisticsTab) ? buttons[statisticsTab] : null}
          </TopAppBarSection>
        </TopAppBarRow>
        {bottomNav ? null : tabRow}
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="main extended-app-bar">
        {categoryDialog}
        <VirtualizeSwipeableViews
          className={statisticsTab}
          index={statsTabs.indexOf(statisticsTab)}
          onChangeIndex={handleChangeIndex}
          overscanSlideAfter={0}
          overscanSlideBefore={0}
          slideCount={statsTabs.length}
          slideRenderer={slideRenderer}
          springConfig={{
            delay: "0s",
            duration: "0.35s",
            easeFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
          }}
        />
        <Footer />
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};

export default ContentStatistics;
