import React, { useEffect, useState } from "react";
import moment from "moment";
import classNames from "classnames";
import SwipeableViews from "react-swipeable-views";
import { virtualize } from "react-swipeable-views-utils";
import firebase from "../../firebase";
import { useAppSelector } from "../../app/hooks";
import { selectDevice } from "../../app/slices/common/commonSlice";
import { selectBottomNav } from "../../app/slices/settings/settingsSlice";
import { setStatisticsTab } from "../../app/slices/statistics/statisticsFns";
import { selectStatsTab } from "../../app/slices/statistics/statisticsSlice";
import { queue } from "../../app/snackbarQueue";
import { statsTabs } from "../../util/constants";
import { capitalise, iconObject, hasKey, useBoolStates, mergeObject } from "../../util/functions";
import { StatisticsSortType, StatisticsType, Categories, Properties } from "../../util/types";
import { LinearProgress } from "@rmwc/linear-progress";
import { TabBar, Tab } from "@rmwc/tabs";
import { Tooltip } from "@rmwc/tooltip";
import {
  TopAppBar,
  TopAppBarRow,
  TopAppBarSection,
  TopAppBarNavigationIcon,
  TopAppBarTitle,
  TopAppBarFixedAdjust,
  TopAppBarActionItem,
} from "@rmwc/top-app-bar";
import { Footer } from "../common/Footer";
import { StatusCard } from "../statistics/PieCard";
import { TableCard } from "../statistics/TableCard";
import { ShippedCard, TimelinesCard, CountCard } from "../statistics/TimelineCard";
import { DialogStatistics } from "../statistics/DialogStatistics";
import { SegmentedButton, SegmentedButtonSegment } from "../util/SegmentedButton";
import "./ContentStatistics.scss";

const storage = firebase.storage();

const VirtualizeSwipeableViews = virtualize(SwipeableViews);

type ContentStatisticsProps = {
  navOpen: boolean;
  openNav: () => void;
};

type TimelineDataObject = {
  name: string;
  total: number;
  timeline: {
    months: string[];
    profiles: string[];
    series:
      | {
          meta: string;
          value: number;
        }[][]
      | number[][];
  };
};

type CountDataObject = {
  total: number;
  months: string[];
  series: number[][];
};

type SummaryData = {
  count: Record<Categories, CountDataObject>;
  profile: Record<Categories, { profiles: string[]; data: TimelineDataObject }>;
};

type TimelinesData = Record<Categories, Record<Properties, { profiles: string[]; data: TimelineDataObject[] }>>;

type StatusDataObject = {
  ic: number;
  liveGb: number;
  name: string;
  postGb: number;
  preGb: number;
  total: number;
};

type StatusData = Record<Properties, StatusDataObject[]>;

type ShippedDataObject = {
  name: string;
  shipped: number;
  total: number;
  unshipped: number;
  timeline: {
    months: string[];
    series: {
      [key: string]: {
        meta: string;
        value: number;
      };
    }[];
  };
};

type ShippedData = Record<Properties, ShippedDataObject[]>;

type DurationDataObject = {
  chartData: number[][];
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

type DurationData = Record<Categories, Record<Properties, DurationDataObject[]>>;

type VendorDataObject = {
  chartData: number[][];
  mean: number;
  median: number;
  mode: number[];
  name: string;
  range: string;
  standardDev: number;
  total: number;
};

type VendorData = Record<Properties, VendorDataObject[]>;

export const ContentStatistics = (props: ContentStatisticsProps) => {
  const device = useAppSelector(selectDevice);
  const bottomNav = useAppSelector(selectBottomNav);

  const statisticsTab = useAppSelector(selectStatsTab);

  const [statisticsData, setStatisticsData] = useState<{
    summaryData: SummaryData;
    timelinesData: TimelinesData;
    statusData: StatusData;
    shippedData: ShippedData;
    durationData: DurationData;
    vendorsData: VendorData;
  }>({
    summaryData: {
      count: {
        icDate: { total: 0, months: [], series: [] },
        gbLaunch: { total: 0, months: [], series: [] },
      },
      profile: {
        icDate: {
          profiles: [],
          data: {
            name: "Profile breakdown",
            total: 0,
            timeline: {
              months: [],
              profiles: [],
              series: [],
            },
          },
        },
        gbLaunch: {
          profiles: [],
          data: {
            name: "Profile breakdown",
            total: 0,
            timeline: {
              months: [],
              profiles: [],
              series: [],
            },
          },
        },
      },
    },
    timelinesData: {
      icDate: {
        profile: {
          profiles: [],
          data: [],
        },
        designer: {
          profiles: [],
          data: [],
        },
        vendor: {
          profiles: [],
          data: [],
        },
      },
      gbLaunch: {
        profile: {
          profiles: [],
          data: [],
        },
        designer: {
          profiles: [],
          data: [],
        },
        vendor: {
          profiles: [],
          data: [],
        },
      },
    },
    statusData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    shippedData: {
      profile: [],
      designer: [],
      vendor: [],
    },
    durationData: {
      icDate: {
        profile: [],
        designer: [],
        vendor: [],
      },
      gbLaunch: {
        profile: [],
        designer: [],
        vendor: [],
      },
    },
    vendorsData: {
      profile: [],
      designer: [],
      vendor: [],
    },
  });
  const [dataCreated, setDataCreated] = useState<string[]>([]);
  const [settings, setSettings] = useState<StatisticsType>({
    summary: "gbLaunch",
    timelinesCat: "gbLaunch",
    timelinesGroup: "profile",
    status: "profile",
    shipped: "profile",
    durationCat: "gbLaunch",
    durationGroup: "profile",
    vendors: "profile",
  });
  const [statisticsSort, setStatisticsSort] = useState<StatisticsSortType>({
    timelines: "total",
    status: "total",
    shipped: "total",
    duration: "total",
    vendors: "total",
  });
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [closeCategoryDialog, openCategoryDialog] = useBoolStates(setCategoryDialogOpen);

  const getData = async () => {
    const fileRef = storage.ref("statisticsData.json");
    fileRef
      .getDownloadURL()
      .then((url) => {
        fetch(url)
          .then((response) => {
            response.json().then((data) => {
              const { timestamp, ...statisticsData } = data;

              const formattedTimestamp = moment.utc(timestamp, moment.ISO_8601).format("HH:mm Do MMM YYYY UTC");
              queue.notify({ title: "Last updated: " + formattedTimestamp, timeout: 4000 });

              setStatisticsData(statisticsData);
              setDataCreated(Object.keys(statisticsData));
            });
          })
          .catch((error) => {
            console.log(error);
            queue.notify({ title: "Failed to fetch statistics data: " + error });
          });
      })
      .catch((error) => {
        console.log(error);
        queue.notify({ title: "Failed to create statistics data: " + error });
      });
  };

  useEffect(() => {
    getData();
  }, []);

  const sortData = (sort = statisticsSort) => {
    const key = statisticsTab + "Data";
    if (hasKey(statisticsData, key)) {
      const stateData = statisticsData[key];
      const tab = statisticsTab;
      if (typeof stateData === "object") {
        if (tab === "duration") {
          const data = { ...stateData } as DurationData;
          Object.keys(data).forEach((property) => {
            if (hasKey(data, property)) {
              Object.keys(data[property]).forEach((prop) => {
                if (hasKey(data[property], prop)) {
                  data[property][prop].sort((a, b) => {
                    if (a.name === "All" || b.name === "All") {
                      return a.name === "all" ? -1 : 1;
                    }
                    const x =
                      sort[tab] === "alphabetical"
                        ? a.name.toLowerCase()
                        : a[sort[tab] === "duration" ? "mean" : "total"];
                    const y =
                      sort[tab] === "alphabetical"
                        ? b.name.toLowerCase()
                        : b[sort[tab] === "duration" ? "mean" : "total"];
                    const c = a.name.toLowerCase();
                    const d = b.name.toLowerCase();
                    if (x < y) {
                      return sort[tab] === "alphabetical" ? -1 : 1;
                    }
                    if (x > y) {
                      return sort[tab] === "alphabetical" ? 1 : -1;
                    }
                    if (c < d) {
                      return -1;
                    }
                    if (c > d) {
                      return 1;
                    }
                    return 0;
                  });
                }
              });
            }
          });
          setStatisticsData((statisticsData) => mergeObject(statisticsData, { [key]: data }));
        } else if (tab === "timelines") {
          const data = { ...stateData } as TimelinesData;
          Object.keys(data).forEach((property) => {
            if (hasKey(data, property)) {
              Object.keys(data[property]).forEach((prop) => {
                if (hasKey(data[property], prop)) {
                  data[property][prop].data.sort((a, b) => {
                    const x = sort[tab] === "alphabetical" ? a.name.toLowerCase() : a.total;
                    const y = sort[tab] === "alphabetical" ? b.name.toLowerCase() : b.total;
                    const c = a.name.toLowerCase();
                    const d = b.name.toLowerCase();
                    if (x < y) {
                      return sort[tab] === "alphabetical" ? -1 : 1;
                    }
                    if (x > y) {
                      return sort[tab] === "alphabetical" ? 1 : -1;
                    }
                    if (c < d) {
                      return -1;
                    }
                    if (c > d) {
                      return 1;
                    }
                    return 0;
                  });
                }
              });
            }
          });
          setStatisticsData((statisticsData) => mergeObject(statisticsData, { [key]: data }));
        } else {
          const data = { ...stateData } as StatusData | ShippedData | VendorData;
          Object.keys(data).forEach((prop) => {
            if (hasKey(data, prop)) {
              const value = data[prop];
              type DataObj = StatusDataObject | ShippedDataObject | VendorDataObject;
              value.sort((a: DataObj, b: DataObj) => {
                if (hasKey(sort, tab)) {
                  const x = sort[tab] === "total" ? a.total : a.name.toLowerCase();
                  const y = sort[tab] === "total" ? b.total : b.name.toLowerCase();
                  const c = a.name.toLowerCase();
                  const d = b.name.toLowerCase();
                  if (x < y) {
                    return sort[tab] === "total" ? 1 : -1;
                  }
                  if (x > y) {
                    return sort[tab] === "total" ? -1 : 1;
                  }
                  if (c < d) {
                    return -1;
                  }
                  if (c > d) {
                    return 1;
                  }
                  return 0;
                } else {
                  return 0;
                }
              });
            }
          });
          setStatisticsData((statisticsData) => mergeObject(statisticsData, { [key]: data }));
        }
      }
    }
  };
  const setSetting = (prop: string, query: string) => {
    setSettings((settings) => mergeObject(settings, { [prop]: query }));
  };
  const setSort = (prop: string, query: string) => {
    const sort = { ...statisticsSort, [prop]: query };
    setStatisticsSort(sort);
    sortData(sort);
  };
  const handleChangeIndex = (index: number) => {
    setStatisticsTab(statsTabs[index]);
  };
  const categoryButtons = (cat: string) => {
    return device === "desktop" ? (
      <SegmentedButton toggle>
        <SegmentedButtonSegment
          selected={hasKey(settings, cat) && settings[cat] === "profile"}
          onClick={() => {
            setSetting(cat, "profile");
          }}
          label="Profile"
        />
        <SegmentedButtonSegment
          selected={hasKey(settings, cat) && settings[cat] === "designer"}
          onClick={() => {
            setSetting(cat, "designer");
          }}
          label="Designer"
        />
        <SegmentedButtonSegment
          selected={hasKey(settings, cat) && settings[cat] === "vendor"}
          onClick={() => {
            setSetting(cat, "vendor");
          }}
          label="Vendor"
        />
      </SegmentedButton>
    ) : (
      <Tooltip enterDelay={500} content="Category" align="top">
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
        />
      </Tooltip>
    );
  };
  const genericButtons = (
    <>
      <SegmentedButton toggle>
        <Tooltip enterDelay={500} align="bottom" content="Total">
          <SegmentedButtonSegment
            selected={hasKey(statisticsSort, statisticsTab) && statisticsSort[statisticsTab] === "total"}
            onClick={() => {
              setSort(statisticsTab, "total");
            }}
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M7.78,7C9.08,7.04 10,7.53 10.57,8.46C11.13,9.4 11.41,10.56 11.39,11.95C11.4,13.5 11.09,14.73 10.5,15.62C9.88,16.5 8.95,16.97 7.71,17C6.45,16.96 5.54,16.5 4.96,15.56C4.38,14.63 4.09,13.45 4.09,12C4.09,10.55 4.39,9.36 5,8.44C5.59,7.5 6.5,7.04 7.78,7M7.75,8.63C7.31,8.63 6.96,8.9 6.7,9.46C6.44,10 6.32,10.87 6.32,12C6.31,13.15 6.44,14 6.69,14.54C6.95,15.1 7.31,15.37 7.77,15.37C8.69,15.37 9.16,14.24 9.17,12C9.17,9.77 8.7,8.65 7.75,8.63M13.33,17V15.22L13.76,15.24L14.3,15.22L15.34,15.03C15.68,14.92 16,14.78 16.26,14.58C16.59,14.35 16.86,14.08 17.07,13.76C17.29,13.45 17.44,13.12 17.53,12.78L17.5,12.77C17.05,13.19 16.38,13.4 15.47,13.41C14.62,13.4 13.91,13.15 13.34,12.65C12.77,12.15 12.5,11.43 12.46,10.5C12.47,9.5 12.81,8.69 13.47,8.03C14.14,7.37 15,7.03 16.12,7C17.37,7.04 18.29,7.45 18.88,8.24C19.47,9 19.76,10 19.76,11.19C19.75,12.15 19.61,13 19.32,13.76C19.03,14.5 18.64,15.13 18.12,15.64C17.66,16.06 17.11,16.38 16.47,16.61C15.83,16.83 15.12,16.96 14.34,17H13.33M16.06,8.63C15.65,8.64 15.32,8.8 15.06,9.11C14.81,9.42 14.68,9.84 14.68,10.36C14.68,10.8 14.8,11.16 15.03,11.46C15.27,11.77 15.63,11.92 16.11,11.93C16.43,11.93 16.7,11.86 16.92,11.74C17.14,11.61 17.3,11.46 17.41,11.28C17.5,11.17 17.53,10.97 17.53,10.71C17.54,10.16 17.43,9.69 17.2,9.28C16.97,8.87 16.59,8.65 16.06,8.63M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75Z" />
              </svg>
            )}
          />
        </Tooltip>
        <Tooltip enterDelay={500} align="bottom" content="Alphabetical">
          <SegmentedButtonSegment
            selected={hasKey(statisticsSort, statisticsTab) && statisticsSort[statisticsTab] === "alphabetical"}
            onClick={() => {
              setSort(statisticsTab, "alphabetical");
            }}
            icon={iconObject(
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24px" height="24px">
                <path d="M0 0h24v24H0V0z" fill="none" />
                <path d="M9.25,5L12.5,1.75L15.75,5H9.25M15.75,19L12.5,22.25L9.25,19H15.75M8.89,14.3H6L5.28,17H2.91L6,7H9L12.13,17H9.67L8.89,14.3M6.33,12.68H8.56L7.93,10.56L7.67,9.59L7.42,8.63H7.39L7.17,9.6L6.93,10.58L6.33,12.68M13.05,17V15.74L17.8,8.97V8.91H13.5V7H20.73V8.34L16.09,15V15.08H20.8V17H13.05Z" />
              </svg>
            )}
          />
        </Tooltip>
      </SegmentedButton>
      {categoryButtons(statisticsTab)}
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
          <Tooltip enterDelay={500} align="bottom" content="Total">
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
            />
          </Tooltip>
          <Tooltip enterDelay={500} align="bottom" content="Alphabetical">
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
            />
          </Tooltip>
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
          <Tooltip enterDelay={500} align="bottom" content="Total">
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
            />
          </Tooltip>
          <Tooltip enterDelay={500} align="bottom" content="Alphabetical">
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
            />
          </Tooltip>
          <Tooltip enterDelay={500} align="bottom" content="Duration">
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
            />
          </Tooltip>
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
      <DialogStatistics
        open={categoryDialogOpen}
        onClose={closeCategoryDialog}
        statistics={settings}
        setStatistics={setSetting}
        statisticsTab={statisticsTab}
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
  const slideRenderer = (params: any) => {
    const { index, key } = params;
    const tab = statsTabs[index];
    const tabs = {
      summary: (
        <div className="stats-tab stats-grid summary" key={key}>
          <CountCard
            title="Sets per month"
            data={statisticsData.summaryData.count[settings.summary]}
            //category={this.state.settings.summary === "icDate" ? "IC date" : "GB start"}
            disclaimer
          />
          <TimelinesCard
            allProfiles={statisticsData.summaryData.profile[settings.summary].profiles}
            data={statisticsData.summaryData.profile[settings.summary].data}
            //category={this.state.settings.summary === "icDate" ? "IC date" : "GB start"}
          />
        </div>
      ),
      timelines: (
        <div className="stats-tab stats-grid timelines" key={key}>
          {statisticsData.timelinesData[settings.timelinesCat][settings.timelinesGroup].data.map((data) => {
            return (
              <TimelinesCard
                key={data.name}
                data={data}
                profileGroups={settings.timelinesGroup === "profile"}
                allProfiles={statisticsData.timelinesData[settings.timelinesCat][settings.timelinesGroup].profiles}
                //category={this.state.settings.timelinesCat === "icDate" ? "IC date" : "GB start"}
              />
            );
          })}
        </div>
      ),
      status: (
        <div className="stats-tab stats-grid status" key={key}>
          {statisticsData.statusData[settings.status].map((data) => {
            return <StatusCard key={data.name} data={data} />;
          })}
        </div>
      ),
      shipped: (
        <div className="stats-tab stats-grid shipped" key={key}>
          {statisticsData.shippedData[settings.shipped].map((data) => {
            return <ShippedCard key={data.name} data={data} />;
          })}
        </div>
      ),
      duration: (
        <div className="stats-tab stats-grid duration" key={key}>
          {statisticsData.durationData[settings.durationCat][settings.durationGroup].map((data) => {
            return (
              <TableCard
                key={data.name}
                data={data}
                unit={`Time ${settings.durationCat === "icDate" ? "(months)" : "(days)"}`}
              />
            );
          })}
        </div>
      ),
      vendors: (
        <div className="stats-tab stats-grid vendors" key={key}>
          {statisticsData.vendorsData[settings.vendors].map((data) => {
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
            <TopAppBarTitle>{device !== "mobile" ? "Statistics" : null}</TopAppBarTitle>
          </TopAppBarSection>
          <TopAppBarSection alignEnd>{hasKey(buttons, statisticsTab) ? buttons[statisticsTab] : null}</TopAppBarSection>
        </TopAppBarRow>
        {bottomNav ? null : tabRow}
        <LinearProgress closed={dataCreated.length === statsTabs.length} />
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
