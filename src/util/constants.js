export const settingsFunctions = {
  view: "setView",
  bottomNav: "setBottomNav",
  applyTheme: "setApplyTheme",
  lightTheme: "setLightTheme",
  darkTheme: "setDarkTheme",
  manualTheme: "setManualTheme",
  fromTimeTheme: "setFromTimeTheme",
  toTimeTheme: "setToTimeTheme",
  density: "setDensity",
};

export const pageTitle = {
  calendar: "Calendar",
  live: "Live GBs",
  ic: "IC Tracker",
  previous: "Previous Sets",
  account: "Account",
  timeline: "Timeline",
  archive: "Archive",
  favorites: "Favorites",
  hidden: "Hidden",
  statistics: "Statistics",
  audit: "Audit Log",
  users: "Users",
  settings: "Settings",
};

export const pageSort = {
  calendar: "gbLaunch",
  live: "gbEnd",
  ic: "profile",
  previous: "gbLaunch",
  timeline: "gbLaunch",
  archive: "profile",
  favorites: "profile",
  hidden: "profile",
};

export const sortNames = {
  profile: "Profile",
  designer: "Designer",
  vendor: "Vendor",
  icDate: "IC date",
  gbLaunch: "Start date",
  gbEnd: "End date",
};

export const sortBlacklist = {
  profile: [],
  designer: [],
  vendor: ["ic", "archive", "favorites", "hidden"],
  icDate: [],
  gbLaunch: ["ic", "archive", "favorites", "hidden"],
  gbEnd: ["ic", "timeline", "archive", "favorites", "hidden"],
};

export const whitelistShipped = ["Shipped", "Not shipped"];

export const whitelistParams = ["profile", "profiles", "shipped", "vendorMode", "vendors"];

export const statsTabs = ["timeline", "status", "shipped", "duration", "vendors"];
