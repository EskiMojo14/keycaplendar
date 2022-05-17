import type { StatisticsData } from "@s/statistics/types";

/** Tabs on the statistics page. */

export const statsTabs = [
  "summary",
  "timelines",
  "status",
  "shipped",
  "duration",
  "vendors",
] as const;

/** All categories. */

export const categories = ["icDate", "gbLaunch"] as const;

/** All properties. */

export const properties = ["profile", "designer", "vendor"] as const;

export const blankStatisticsData: StatisticsData = {
  duration: {
    gbLaunch: {
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      summary: {
        chartData: { labels: [], series: [] },
        mean: 0,
        median: 0,
        mode: [],
        name: "GB duration (days)",
        range: "",
        standardDev: 0,
        total: 0,
      },
    },
    icDate: {
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      summary: {
        chartData: { labels: [], series: [] },
        mean: 0,
        median: 0,
        mode: [],
        name: "IC duration (months)",
        range: "",
        standardDev: 0,
        total: 0,
      },
    },
  },
  shipped: {
    breakdown: {
      designer: [],
      profile: [],
      vendor: [],
    },
    months: [],
    summary: {
      name: "Shipped sets by GB month",
      shipped: 0,
      timeline: {
        shipped: [],
        unshipped: [],
      },
      total: 0,
      unshipped: 0,
    },
  },
  status: {
    breakdown: {
      designer: [],
      profile: [],
      vendor: [],
    },
    summary: {
      ic: 0,
      liveGb: 0,
      name: "Current keyset status",
      postGb: 0,
      preGb: 0,
      total: 0,
    },
  },
  timelines: {
    gbLaunch: {
      allProfiles: [],
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      months: [],
      summary: {
        breakdown: {
          name: "GBs per month by profile",
          timeline: {
            profiles: [],
            series: [],
          },
          total: 0,
        },
        count: {
          name: "GBs per month",
          timeline: {
            profiles: [],
            series: [],
          },
          total: 0,
        },
      },
    },
    icDate: {
      allProfiles: [],
      breakdown: {
        designer: [],
        profile: [],
        vendor: [],
      },
      months: [],
      summary: {
        breakdown: {
          name: "ICs per month by profile",
          timeline: {
            profiles: [],
            series: [],
          },
          total: 0,
        },
        count: {
          name: "ICs per month",
          timeline: {
            profiles: [],
            series: [],
          },
          total: 0,
        },
      },
    },
  },
  vendors: {
    breakdown: {
      designer: [],
      profile: [],
      vendor: [],
    },
    summary: {
      chartData: { labels: [], series: [] },
      mean: 0,
      median: 0,
      mode: [],
      name: "Vendors per set",
      range: "",
      standardDev: 0,
      total: 0,
    },
  },
};
