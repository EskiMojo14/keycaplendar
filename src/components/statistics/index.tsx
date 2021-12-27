import { useEffect, useState } from "react";
import classNames from "classnames";
import SwipeableViews from "react-swipeable-views";
import { SlideRendererCallback, virtualize } from "react-swipeable-views-utils";
import { useAppSelector } from "~/app/hooks";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { selectBottomNav } from "@s/settings";
import { selectTab, selectData, selectLoading, selectSettings, selectSort } from "@s/statistics";
import { statsTabs } from "@s/statistics/constants";
import { getData, setSetting, setSort, setStatisticsTab } from "@s/statistics/functions";
import { StatisticsType } from "@s/statistics/types";
import { capitalise, hasKey, iconObject, useBoolStates } from "@s/util/functions";
import { LinearProgress } from "@rmwc/linear-progress";
import { TabBar, Tab } from "@rmwc/tabs";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import { Footer } from "@c/common/footer";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/segmented-button";
import { withTooltip } from "@c/util/hocs";
import { StatusCard } from "./pie-card";
import { TableCard } from "./table-card";
import { ShippedCard, TimelinesCard } from "./timeline-card";
import { DialogStatistics } from "./dialog-statistics";
import { Category, DateRange, SortAlphabeticalVariant, SortNumericVariant } from "@i";
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
    if (statisticsData.timelines.icDate.summary.count.total === 0) {
      getData();
    }
  }, []);

  const handleChangeIndex = (index: number) => {
    setStatisticsTab(statsTabs[index]);
  };

  const tooltipAlign = bottomNav ? "top" : "bottom";

  const categoryButtons = (tab: keyof StatisticsType) => {
    return device === "desktop" ? (
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
  };

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
          <TimelinesCard
            months={statisticsData.timelines[settings.summary].months}
            data={statisticsData.timelines[settings.summary].summary.count}
            breakdownData={statisticsData.timelines[settings.summary].breakdown.profile}
            category={settings.summary}
            defaultType="line"
            singleTheme="secondary"
            overline="Timelines"
            note="Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are
            included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019."
            summary
          />
          <TimelinesCard
            months={statisticsData.timelines[settings.summary].months}
            allProfiles={statisticsData.timelines[settings.summary].allProfiles}
            data={statisticsData.timelines[settings.summary].summary.breakdown}
            focusable
            overline="Timelines"
            category={settings.summary}
            summary
          />
          <StatusCard
            data={statisticsData.status.summary}
            breakdownData={statisticsData.status.breakdown.profile}
            overline="Status"
            summary
          />
          <ShippedCard
            data={statisticsData.shipped.summary}
            breakdownData={statisticsData.shipped.breakdown.profile}
            months={statisticsData.shipped.months}
            overline="Shipped"
            summary
          />
          <TableCard
            data={statisticsData.duration[settings.summary].summary}
            breakdownData={statisticsData.duration[settings.summary].breakdown.profile}
            category={settings.summary}
            unit={`Time ${settings.summary === "icDate" ? "(months)" : "(days)"}`}
            overline="Duration"
            summary
          />
          <TableCard
            data={statisticsData.vendors.summary}
            breakdownData={statisticsData.vendors.breakdown.profile}
            unit="Vendors"
            overline="Vendors"
            note="Only includes sets that have completed GB."
            summary
          />
        </div>
      ),
      timelines: (
        <div className="stats-tab stats-grid timelines" key={key}>
          {statisticsData.timelines[settings.timelinesCat].breakdown[settings.timelinesGroup].map((data) => {
            return (
              <TimelinesCard
                key={data.name}
                data={data}
                focusable={!(settings.timelinesGroup === "profile")}
                category={settings.timelinesCat}
                singleTheme={settings.timelinesGroup === "profile" ? "primary" : undefined}
                allProfiles={statisticsData.timelines[settings.timelinesCat].allProfiles}
                months={statisticsData.timelines[settings.timelinesCat].months}
              />
            );
          })}
        </div>
      ),
      status: (
        <div className="stats-tab stats-grid status" key={key}>
          {statisticsData.status.breakdown[settings.status].map((data) => {
            return <StatusCard key={data.name} data={data} />;
          })}
        </div>
      ),
      shipped: (
        <div className="stats-tab stats-grid shipped" key={key}>
          {statisticsData.shipped.breakdown[settings.shipped].map((data) => {
            return <ShippedCard key={data.name} data={data} months={statisticsData.shipped.months} />;
          })}
        </div>
      ),
      duration: (
        <div className="stats-tab stats-grid duration" key={key}>
          {statisticsData.duration[settings.durationCat].breakdown[settings.durationGroup].map((data) => {
            return (
              <TableCard
                key={data.name}
                data={data}
                category={settings.durationCat}
                unit={`Time ${settings.durationCat === "icDate" ? "(months)" : "(days)"}`}
              />
            );
          })}
        </div>
      ),
      vendors: (
        <div className="stats-tab stats-grid vendors" key={key}>
          {statisticsData.vendors.breakdown[settings.vendors].map((data) => {
            return <TableCard key={data.name} data={data} unit="Vendors" />;
          })}
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
            <TopAppBarTitle>{device !== "mobile" ? pageTitle.statistics : null}</TopAppBarTitle>
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
        />
        <Footer />
      </div>
      {bottomNav ? <TopAppBarFixedAdjust /> : null}
    </>
  );
};

export default ContentStatistics;
