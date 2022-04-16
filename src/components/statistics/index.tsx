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
import { virtualize } from "react-swipeable-views-utils";
import type { SlideRendererCallback } from "react-swipeable-views-utils";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { Footer } from "@c/common/footer";
import { withTooltip } from "@c/util/hocs";
import {
  SegmentedButton,
  SegmentedButtonSegment,
} from "@c/util/segmented-button";
import { selectDevice } from "@s/common";
import { pageTitle } from "@s/common/constants";
import { selectBottomNav } from "@s/settings";
import {
  selectData,
  selectLoading,
  selectSettings,
  selectSort,
  selectTab,
  setStatisticsSetting,
  setStatisticsSort,
} from "@s/statistics";
import { statsTabs } from "@s/statistics/constants";
import { getData, setStatisticsTab } from "@s/statistics/thunks";
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
import { DialogStatistics } from "./dialog-statistics";
import { StatusCard } from "./pie-card";
import { TableCard } from "./table-card";
import { ShippedCard, TimelinesCard } from "./timeline-card";
import "./index.scss";

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentStatisticsProps = {
  openNav: () => void;
};

export const ContentStatistics = ({ openNav }: ContentStatisticsProps) => {
  const dispatch = useAppDispatch();
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
    if (statisticsData.timelines.icDate.summary.count.total === 0) {
      dispatch(getData());
    }
  }, []);

  const handleChangeIndex = (index: number) =>
    dispatch(setStatisticsTab(statsTabs[index]));
  const tooltipAlign = bottomNav ? "top" : "bottom";

  const categoryButtons = (tab: keyof StatisticsType) =>
    device === "desktop" ? (
      <SegmentedButton toggle>
        <SegmentedButtonSegment
          label="Profile"
          onClick={() => dispatch(setStatisticsSetting(tab, "profile"))}
          selected={settings[tab] === "profile"}
        />
        <SegmentedButtonSegment
          label="Designer"
          onClick={() => dispatch(setStatisticsSetting(tab, "designer"))}
          selected={settings[tab] === "designer"}
        />
        <SegmentedButtonSegment
          label="Vendor"
          onClick={() => dispatch(setStatisticsSetting(tab, "vendor"))}
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
                dispatch(setStatisticsSort(statisticsTab, "total"));
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
                dispatch(setStatisticsSort(statisticsTab, "alphabetical"));
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
      {hasKey(settings, statisticsTab) && categoryButtons(statisticsTab)}
    </>
  );

  const buttons = {
    duration: (
      <>
        <SegmentedButton toggle>
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortNumericVariant />)}
              onClick={() => dispatch(setStatisticsSort("duration", "total"))}
              selected={statisticsSort.duration === "total"}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortNumericVariant />)}
              onClick={() =>
                dispatch(setStatisticsSort("duration", "alphabetical"))
              }
              selected={statisticsSort.duration === "alphabetical"}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<DateRange />)}
              onClick={() =>
                dispatch(setStatisticsSort("duration", "duration"))
              }
              selected={statisticsSort.duration === "duration"}
            />,
            "Sort by duration",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            label="IC"
            onClick={() =>
              dispatch(setStatisticsSetting("durationCat", "icDate"))
            }
            selected={settings.durationCat === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() =>
              dispatch(setStatisticsSetting("durationCat", "gbLaunch"))
            }
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
            onClick={() => dispatch(setStatisticsSetting("summary", "icDate"))}
            selected={settings.summary === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() =>
              dispatch(setStatisticsSetting("summary", "gbLaunch"))
            }
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
              onClick={() => dispatch(setStatisticsSort("timelines", "total"))}
              selected={statisticsSort.timelines === "total"}
            />,
            "Sort by total",
            { align: tooltipAlign }
          )}
          {withTooltip(
            <SegmentedButtonSegment
              icon={iconObject(<SortAlphabeticalVariant />)}
              onClick={() =>
                dispatch(setStatisticsSort("timelines", "alphabetical"))
              }
              selected={statisticsSort.timelines === "alphabetical"}
            />,
            "Sort alphabetically",
            { align: tooltipAlign }
          )}
        </SegmentedButton>
        <SegmentedButton toggle>
          <SegmentedButtonSegment
            label="IC"
            onClick={() =>
              dispatch(setStatisticsSetting("timelinesCat", "icDate"))
            }
            selected={settings.timelinesCat === "icDate"}
          />
          <SegmentedButtonSegment
            label="GB"
            onClick={() =>
              dispatch(setStatisticsSetting("timelinesCat", "gbLaunch"))
            }
            selected={settings.timelinesCat === "gbLaunch"}
          />
        </SegmentedButton>
        {categoryButtons("timelinesGroup")}
      </>
    ),
    vendors: genericButtons,
  };

  const categoryDialog = statisticsTab !== "summary" &&
    device !== "desktop" && (
      <DialogStatistics
        onClose={closeCategoryDialog}
        open={categoryDialogOpen}
      />
    );

  const tabRow = (
    <TopAppBarRow className="tab-row">
      <TopAppBarSection alignStart>
        <TabBar
          activeTabIndex={statsTabs.indexOf(statisticsTab)}
          onActivate={(e) =>
            dispatch(setStatisticsTab(statsTabs[e.detail.index]))
          }
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
      duration: (
        <div key={key} className="stats-tab stats-grid duration">
          {statisticsData.duration[settings.durationCat].breakdown[
            settings.durationGroup
          ].map((data) => (
            <TableCard
              key={data.name}
              category={settings.durationCat}
              data={data}
              unit={`Time ${
                settings.durationCat === "icDate" ? "(months)" : "(days)"
              }`}
            />
          ))}
        </div>
      ),
      shipped: (
        <div key={key} className="stats-tab stats-grid shipped">
          {statisticsData.shipped.breakdown[settings.shipped].map((data) => (
            <ShippedCard
              key={data.name}
              data={data}
              months={statisticsData.shipped.months}
            />
          ))}
        </div>
      ),
      status: (
        <div key={key} className="stats-tab stats-grid status">
          {statisticsData.status.breakdown[settings.status].map((data) => (
            <StatusCard key={data.name} data={data} />
          ))}
        </div>
      ),
      summary: (
        <div key={key} className="stats-tab stats-grid summary">
          <TimelinesCard
            breakdownData={
              statisticsData.timelines[settings.summary].breakdown.profile
            }
            category={settings.summary}
            data={statisticsData.timelines[settings.summary].summary.count}
            defaultType="line"
            months={statisticsData.timelines[settings.summary].months}
            note="Based on the data included in KeycapLendar. Earlier data will be less representative, as not all sets are
            included. KeycapLendar began tracking GBs in June 2019, and began tracking ICs in December 2019."
            overline="Timelines"
            singleTheme="secondary"
            summary
          />
          <TimelinesCard
            allProfiles={statisticsData.timelines[settings.summary].allProfiles}
            category={settings.summary}
            data={statisticsData.timelines[settings.summary].summary.breakdown}
            focusable
            months={statisticsData.timelines[settings.summary].months}
            overline="Timelines"
            summary
          />
          <StatusCard
            breakdownData={statisticsData.status.breakdown.profile}
            data={statisticsData.status.summary}
            overline="Status"
            summary
          />
          <ShippedCard
            breakdownData={statisticsData.shipped.breakdown.profile}
            data={statisticsData.shipped.summary}
            months={statisticsData.shipped.months}
            overline="Shipped"
            summary
          />
          <TableCard
            breakdownData={
              statisticsData.duration[settings.summary].breakdown.profile
            }
            category={settings.summary}
            data={statisticsData.duration[settings.summary].summary}
            overline="Duration"
            summary
            unit={`Time ${
              settings.summary === "icDate" ? "(months)" : "(days)"
            }`}
          />
          <TableCard
            breakdownData={statisticsData.vendors.breakdown.profile}
            data={statisticsData.vendors.summary}
            note="Only includes sets that have completed GB."
            overline="Vendors"
            summary
            unit="Vendors"
          />
        </div>
      ),
      timelines: (
        <div key={key} className="stats-tab stats-grid timelines">
          {statisticsData.timelines[settings.timelinesCat].breakdown[
            settings.timelinesGroup
          ].map((data) => (
            <TimelinesCard
              key={data.name}
              allProfiles={
                statisticsData.timelines[settings.timelinesCat].allProfiles
              }
              category={settings.timelinesCat}
              data={data}
              focusable={!(settings.timelinesGroup === "profile")}
              months={statisticsData.timelines[settings.timelinesCat].months}
              singleTheme={
                settings.timelinesGroup === "profile" ? "primary" : undefined
              }
            />
          ))}
        </div>
      ),
      vendors: (
        <div key={key} className="stats-tab stats-grid vendors">
          {statisticsData.vendors.breakdown[settings.vendors].map((data) => (
            <TableCard key={data.name} data={data} unit="Vendors" />
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
            <TopAppBarTitle>
              {device !== "mobile" && pageTitle.statistics}
            </TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>
            {hasKey(buttons, statisticsTab) && buttons[statisticsTab]}
          </TopAppBarSection>
        </TopAppBarRow>
        {!bottomNav && tabRow}
        <LinearProgress closed={!loading} />
      </TopAppBar>
      {!bottomNav && <TopAppBarFixedAdjust />}
      <div className="main extended-app-bar">
        {categoryDialog}
        <VirtualizeSwipeableViews
          className={statisticsTab}
          index={statsTabs.indexOf(statisticsTab)}
          onChangeIndex={handleChangeIndex}
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
      {bottomNav && <TopAppBarFixedAdjust />}
    </>
  );
};

export default ContentStatistics;
