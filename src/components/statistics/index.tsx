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
import { Footer } from "@c/common/Footer";
import { SegmentedButton, SegmentedButtonSegment } from "@c/util/SegmentedButton";
import { withTooltip } from "@c/util/HOCs";
import { StatusCard } from "./PieCard";
import { TableCard } from "./TableCard";
import { ShippedCard, TimelinesCard } from "./TimelineCard";
import { DialogStatistics } from "./DialogStatistics";
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
          icon={iconObject(
            <div>
              <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <circle cx="17.5" cy="17.5" opacity=".3" r="2.5" />
                <path d="M5 15.5h4v4H5zm7-9.66L10.07 9h3.86z" opacity=".3" />
                <path d="M12 2l-5.5 9h11L12 2zm0 3.84L13.93 9h-3.87L12 5.84zM17.5 13c-2.49 0-4.5 2.01-4.5 4.5s2.01 4.5 4.5 4.5 4.5-2.01 4.5-4.5-2.01-4.5-4.5-4.5zm0 7c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5zM11 13.5H3v8h8v-8zm-2 6H5v-4h4v4z" />
              </svg>
            </div>
          )}
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
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
              </svg>
            )}
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
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
              </svg>
            )}
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
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                </svg>
              )}
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
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                </svg>
              )}
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
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
                </svg>
              )}
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
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
                </svg>
              )}
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
              icon={iconObject(
                <svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
                  <path d="M0 0h24v24H0V0z" fill="none" />
                  <path d="M5 8h14V6H5z" opacity=".3" />
                  <path d="M7 11h2v2H7zm12-7h-1V2h-2v2H8V2H6v2H5c-1.11 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V10h14v10zm0-12H5V6h14v2zm-4 3h2v2h-2zm-4 0h2v2h-2z" />
                </svg>
              )}
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

  const slideRenderer: SlideRendererCallback = (params) => {
    const { index, key } = params;
    const tab = statsTabs[index];
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
