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
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import firebase from "@s/firebase";
import { selectBottomNav } from "@s/settings";
import { selectData, selectLoading, selectSettings, selectSort, selectTab } from "@s/statistics";
import { statsTabs } from "@s/statistics/constants";
import { getData, setSetting, setSort, setStatisticsTab } from "@s/statistics/functions";
import type { StatisticsType } from "@s/statistics/types";
import { capitalise, hasKey, iconObject, useBoolStates } from "@s/util/functions";
import { Category, DateRange, SortAlphabeticalVariant, SortNumericVariant } from "@i";
import { CalendarCard, CalendarSummaryCard } from "./calendar-card";
import { DialogStatistics } from "./dialog-statistics";
import { StatusCard, StatusSummaryCard } from "./pie-card";
import { TableCard, TableSummaryCard } from "./table-card";
import { ShippedCard, ShippedSummaryCard, TimelinesCard, TimelinesSummaryCard } from "./timeline-card";
import "./index.scss";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentStatisticsProps = {
  navOpen: boolean;
  openNav: () => void;
};

export const ContentStatistics = (props: ContentStatisticsProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const statisticsTab = useAppSelector(selectTab);
  const loading = useAppSelector(selectLoading);
  const statisticsData = useAppSelector(selectData);
  const settings = useAppSelector(selectSettings);
  const statisticsSort = useAppSelector(selectSort);

  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [closeCategoryDialog, openCategoryDialog] = useBoolStates(setCategoryDialogOpen);

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
          selected={settings[tab] === "profile"}
          onClick={() => {
            setSetting(tab, "profile");
          }}
          label="Profile"
        />
        <SegmentedButtonSegment
          selected={settings[tab] === "designer"}
          onClick={() => {
            setSetting(tab, "designer");
          }}
          label="Designer"
        />
        <SegmentedButtonSegment
          selected={settings[tab] === "vendor"}
          onClick={() => {
            setSetting(tab, "vendor");
          }}
          label="Vendor"
        />
      </SegmentedButton>
    ) : (
      withTooltip(
        <TopAppBarActionItem
          className="category-button"
          onClick={openCategoryDialog}
          style={{ "--animation-delay": 0 }}
          icon={iconObject(<Category />)}
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
            selected={hasKey(statisticsSort, statisticsTab) && statisticsSort[statisticsTab] === "total"}
            onClick={() => {
              if (hasKey(statisticsSort, statisticsTab)) {
                setSort(statisticsTab, "total");
              }
            }}
            icon={iconObject(<SortNumericVariant />)}
          />,
          "Sort by total",
          { align: tooltipAlign }
        )}
        {withTooltip(
          <SegmentedButtonSegment
            selected={hasKey(statisticsSort, statisticsTab) && statisticsSort[statisticsTab] === "alphabetical"}
            onClick={() => {
              if (hasKey(statisticsSort, statisticsTab)) {
                setSort(statisticsTab, "alphabetical");
              }
            }}
            icon={iconObject(<SortAlphabeticalVariant />)}
          />,
          "Sort alphabetically",
          { align: tooltipAlign }
        )}
      </SegmentedButton>
      {hasKey(settings, statisticsTab) ? categoryButtons(statisticsTab) : null}
    </>
  );

  const buttons = {
    summary: (
      <>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            selected={settings.summary === "icDate"}
            onClick={() => {
              setSetting("summary", "icDate");
            }}
            label="IC"
          />
          <SegmentedButtonSegment
            selected={settings.summary === "gbLaunch"}
            onClick={() => {
              setSetting("summary", "gbLaunch");
            }}
            label="GB"
          />
        </SegmentedButton>
      </>
    ),
    timelines: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.timelines === "total"}
              onClick={() => {
                setSort("timelines", "total");
              }}
              icon={iconObject(<SortNumericVariant />)}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.timelines === "alphabetical"}
              onClick={() => {
                setSort("timelines", "alphabetical");
              }}
              icon={iconObject(<SortAlphabeticalVariant />)}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            selected={settings.timelinesCat === "icDate"}
            onClick={() => {
              setSetting("timelinesCat", "icDate");
            }}
            label="IC"
          />
          <SegmentedButtonSegment
            selected={settings.timelinesCat === "gbLaunch"}
            onClick={() => {
              setSetting("timelinesCat", "gbLaunch");
            }}
            label="GB"
          />
        </SegmentedButton>
        {categoryButtons("timelinesGroup")}
      </>
    ),
    calendar: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.calendar === "total"}
              onClick={() => {
                setSort("calendar", "total");
              }}
              icon={iconObject(<SortNumericVariant />)}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.calendar === "alphabetical"}
              onClick={() => {
                setSort("calendar", "alphabetical");
              }}
              icon={iconObject(<SortAlphabeticalVariant />)}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            selected={settings.calendarCat === "icDate"}
            onClick={() => {
              setSetting("calendarCat", "icDate");
            }}
            label="IC"
          />
          <SegmentedButtonSegment
            selected={settings.calendarCat === "gbLaunch"}
            onClick={() => {
              setSetting("calendarCat", "gbLaunch");
            }}
            label="GB"
          />
        </SegmentedButton>
        {categoryButtons("calendarGroup")}
      </>
    ),
    status: genericButtons,
    shipped: genericButtons,
    duration: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.duration === "total"}
              onClick={() => {
                setSort("duration", "total");
              }}
              icon={iconObject(<SortNumericVariant />)}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.duration === "alphabetical"}
              onClick={() => {
                setSort("duration", "alphabetical");
              }}
              icon={iconObject(<SortNumericVariant />)}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              selected={statisticsSort.duration === "duration"}
              onClick={() => {
                setSort("duration", "duration");
              }}
              icon={iconObject(<DateRange />)}
            />,
            "Sort by duration",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            selected={settings.durationCat === "icDate"}
            onClick={() => {
              setSetting("durationCat", "icDate");
            }}
            label="IC"
          />
          <SegmentedButtonSegment
            selected={settings.durationCat === "gbLaunch"}
            onClick={() => {
              setSetting("durationCat", "gbLaunch");
            }}
            label="GB"
          />
        </SegmentedButton>
        {categoryButtons("durationGroup")}
      </>
    ),
    vendors: genericButtons,
  };

  const categoryDialog =
    statisticsTab !== "summary" && device !== "desktop" ? (
      <DialogStatistics open={categoryDialogOpen} onClose={closeCategoryDialog} />
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
      summary: (
        <div className="stats-tab stats-grid summary" key={key}>
          <div className="stats-grid-item full-span">
            <TimelinesSummaryCard
              overline="Timelines"
              data={statisticsData.timelines[settings.summary].summary}
              breakdownData={statisticsData.timelines[settings.summary].breakdown.profile}
              months={statisticsData.timelines[settings.summary].months}
              chartKeys={["summary"]}
              category={settings.summary}
              singleTheme="secondary"
              note="Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are
            included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019."
            />
          </div>
          <div className="stats-grid-item full-span">
            <TimelinesSummaryCard
              overline="Timelines"
              chartKeys={statisticsData.timelines[settings.summary].allProfiles}
              months={statisticsData.timelines[settings.summary].months}
              data={statisticsData.timelines[settings.summary].summary}
              category={settings.summary}
            />
          </div>
          <div className="stats-grid-item full-span">
            <CalendarSummaryCard
              overline="Calendar"
              data={statisticsData.calendar[settings.summary].summary}
              breakdownData={statisticsData.calendar[settings.summary].breakdown.profile}
              start={statisticsData.calendar[settings.summary].start}
              end={statisticsData.calendar[settings.summary].end}
              category={settings.summary}
              unit={settings.summary === "gbLaunch" ? "GB" : "IC"}
            />
          </div>
          <div className="stats-grid-item full-span">
            <StatusSummaryCard
              overline="Status"
              data={statisticsData.status.summary}
              breakdownData={statisticsData.status.breakdown.profile}
            />
          </div>
          <div className="stats-grid-item full-span">
            <ShippedSummaryCard
              overline="Shipped"
              data={statisticsData.shipped.summary}
              months={statisticsData.shipped.months}
              breakdownData={statisticsData.shipped.breakdown.profile}
              category={settings.summary}
            />
          </div>
          <div className="stats-grid-item full-span">
            <TableSummaryCard
              overline="Duration"
              data={statisticsData.duration[settings.summary].summary}
              breakdownData={statisticsData.duration[settings.summary].breakdown.profile}
              tab="duration"
              category={settings.summary}
              unit={`Time ${settings.summary === "icDate" ? "(months)" : "(days)"}`}
              theme="secondary"
            />
          </div>
          <div className="stats-grid-item full-span">
            <TableSummaryCard
              overline="Vendors"
              data={statisticsData.vendors.summary}
              breakdownData={statisticsData.vendors.breakdown.profile}
              tab="vendors"
              category={settings.summary}
              unit="Vendors"
              note="Only includes sets that have completed GB."
              theme="secondary"
            />
          </div>
        </div>
      ),
      timelines: (
        <div className="stats-tab stats-tab--padded timelines" key={key}>
          {settings.timelinesGroup === "profile" ? (
            <TimelinesCard
              data={statisticsData.timelines[settings.timelinesCat].breakdown[settings.timelinesGroup]}
              months={statisticsData.timelines[settings.timelinesCat].months}
              singleTheme="primary"
            />
          ) : (
            <TimelinesCard
              data={statisticsData.timelines[settings.timelinesCat].breakdown[settings.timelinesGroup]}
              months={statisticsData.timelines[settings.timelinesCat].months}
              allProfiles={statisticsData.timelines[settings.timelinesCat].allProfiles}
            />
          )}
        </div>
      ),
      calendar: (
        <div className="stats-tab calendar" key={key}>
          <VirtuosoGrid
            useWindowScroll
            totalCount={statisticsData.calendar[settings.calendarCat].breakdown[settings.calendarGroup].length}
            listClassName="stats-grid"
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
                  start={statisticsData.calendar[settings.calendarCat].start}
                  end={statisticsData.calendar[settings.calendarCat].end}
                  unit={settings.calendarCat === "gbLaunch" ? "GB" : "IC"}
                />
              );
            }}
            overscan={1000}
          />
        </div>
      ),
      status: (
        <div className="stats-tab status" key={key}>
          <VirtuosoGrid
            useWindowScroll
            totalCount={statisticsData.status.breakdown[settings.status].length}
            listClassName="stats-grid"
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
            overscan={1000}
          />
        </div>
      ),
      shipped: (
        <div className="stats-tab shipped" key={key}>
          <VirtuosoGrid
            useWindowScroll
            totalCount={statisticsData.shipped.breakdown[settings.shipped].length}
            listClassName="stats-grid"
            itemClassName="stats-grid-item full-span"
            itemContent={(index) => {
              const {
                shipped: {
                  breakdown: {
                    [settings.shipped]: { [index]: data },
                  },
                },
              } = statisticsData;
              return <ShippedCard data={data} months={statisticsData.shipped.months} />;
            }}
            overscan={1000}
          />
        </div>
      ),
      duration: (
        <div className="stats-tab duration" key={key}>
          <VirtuosoGrid
            useWindowScroll
            totalCount={statisticsData.duration[settings.durationCat].breakdown[settings.durationGroup].length}
            listClassName="stats-grid"
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
                  unit={`Time ${settings.durationCat === "icDate" ? "(months)" : "(days)"}`}
                />
              );
            }}
            overscan={1000}
          />
        </div>
      ),
      vendors: (
        <div className="stats-tab vendors" key={key}>
          <VirtuosoGrid
            useWindowScroll
            totalCount={statisticsData.vendors.breakdown[settings.vendors].length}
            listClassName="stats-grid"
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
            overscan={1000}
          />
        </div>
      ),
    };
    return hasKey(tabs, tab) && tabs[tab] ? tabs[tab] : <div key={key} />;
  };

  const createStatistics = () => {
    const cloudFn = firebase.functions().httpsCallable("createStatistics", { timeout: 540000 });
    cloudFn()
      .then(() => {
        firebase.storage().ref("statisticsDataTest.json").getDownloadURL();
      })
      .catch(console.log);
  };

  return (
    <>
      <TopAppBar fixed className={classNames({ "bottom-app-bar": bottomNav })}>
        {bottomNav ? tabRow : null}
        <TopAppBarRow>
          <TopAppBarSection alignStart>
            <TopAppBarNavigationIcon icon="menu" onClick={props.openNav} />
            <TopAppBarTitle onClick={createStatistics}>
              {device !== "mobile" ? pageTitle.statistics : null}
            </TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>{hasKey(buttons, statisticsTab) ? buttons[statisticsTab] : null}</TopAppBarSection>
        </TopAppBarRow>
        {bottomNav ? null : tabRow}
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {bottomNav ? null : <TopAppBarFixedAdjust />}
      <div className="main extended-app-bar">
        {categoryDialog}
        <VirtualizeSwipeableViews
          className={statisticsTab}
          springConfig={{
            duration: "0.35s",
            easeFunction: "cubic-bezier(0.4, 0, 0.2, 1)",
            delay: "0s",
          }}
          slideCount={statsTabs.length}
          index={statsTabs.indexOf(statisticsTab)}
          onChangeIndex={handleChangeIndex}
          slideRenderer={slideRenderer}
          overscanSlideBefore={0}
          overscanSlideAfter={0}
        />
        <Footer />
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};

export default ContentStatistics;
