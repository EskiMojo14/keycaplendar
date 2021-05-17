import React from "react";
import { allPages, allSorts, allViews, mainPages, statsTabs } from "./constants";

/** Alias for `Record<string, T>`. */

export type Obj<T = unknown> = Record<string, T>;

/** Makes specified keys optional. */

export type Optional<T, K extends keyof T> = Pick<Partial<T>, K> & Omit<T, K>;

/** Overwrite keys with a new object. */

export type Overwrite<T1, T2> = {
  [P in Exclude<keyof T1, keyof T2>]: T1[P];
} &
  T2;

/** Alias for standard HTML props. */

export type HTMLProps = React.HTMLAttributes<HTMLElement>;

/** Possible page names */

export type Page = typeof allPages[number];

/** Possible main page names */

export type MainPage = typeof mainPages[number];

/** Possible values for view. */

export type ViewType = typeof allViews[number];

/** Possible values for sort types. */

export type SortType = typeof allSorts[number];

/** Possible values for sort orders. */

export type SortOrderType = "ascending" | "descending";

/** Sort params which are dates. */

export type DateSortKeys = "icDate" | "gbLaunch" | "gbEnd";

/** Sort params which are arrays. */

export type ArraySortKeys = "designer";

export type WhitelistType = {
  /** Array of allowed profiles. */
  profiles: string[];
  /** Array of allowed shipped values. */
  shipped: ("Shipped" | "Not shipped")[];
  /** Regions to include. */
  regions: string[];
  /** Whether to `include` or `exclude` the specified `vendors`. */
  vendorMode: "include" | "exclude";
  /** Array of vendors to either `include` or `exclude`. */
  vendors: string[];
  /** Array of all keys that have been edited. */
  edited?: string[];
  /** Whether to filter to only favourites. */
  favorites: boolean;
  /** Whether to filter to only hidden sets. */
  hidden: boolean;
};

export type PresetType = {
  name: string;
  id: string;
  global?: boolean;
  whitelist: WhitelistType;
};

export type OldPresetType = Overwrite<PresetType, { whitelist: Overwrite<WhitelistType, { regions?: string[] }> }>;

export type CurrentUserType = {
  /** URL to avatar image. */
  avatar: string;
  email: string;
  /** UID provided by Firebase Auth. */
  id: string;
  isAdmin: boolean;
  isDesigner: boolean;
  isEditor: boolean;
  name: string;
  /** Custom nickname for user, for display. */
  nickname: string;
};

export type UserType = {
  admin: boolean;
  designer: boolean;
  displayName: string;
  editor: boolean;
  email: string;
  nickname: string;
  photoURL: string;
  dateCreated: string;
  lastSignIn: string;
  lastActive: string;
};

export type VendorType = {
  id?: string;
  name: string;
  region: string;
  /** Direct URL to product. */
  storeLink?: string;
  endDate?: string;
};

export type SetType = {
  colorway: string;
  designer: string[];
  details: string;
  notes?: string;
  gbEnd: string;
  gbLaunch: string;
  gbMonth?: boolean;
  icDate: string;
  id: string;
  image: string;
  profile: string;
  sales?: {
    /** Direct URL to sales graph. */
    img: string;
    thirdParty: boolean;
  };
  shipped?: boolean;
  vendors?: VendorType[];
};

export type SetGroup = { title: string; sets: SetType[] };

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export type Sorts = "total" | "alphabetical";

export type StatsTab = typeof statsTabs[number];

export type StatisticsType = {
  summary: Categories;
  timelinesCat: Categories;
  timelinesGroup: Properties;
  status: Properties;
  shipped: Properties;
  durationCat: Categories;
  durationGroup: Properties;
  vendors: Properties;
};

export type StatisticsSortType = {
  timelines: Sorts;
  status: Sorts;
  shipped: Sorts;
  duration: Sorts | "duration";
  vendors: Sorts;
};

/** SetType but with all keys set to optional, as an action can include "deleted" sets. */
export type ActionSetType = Omit<Partial<SetType>, "id">;

export type ActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  changelogId: string;
  documentId: string;
  timestamp: string;
  user: {
    displayName: string;
    email: string;
    nickname?: string;
  };
};

export type PublicActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
  documentId: string;
  timestamp: string;
};

export type ProcessedPublicActionType = PublicActionType & {
  title: string;
};

export type RecentSet = {
  id: string;
  title: string;
  designer: string[] | null;
  deleted: boolean;
  currentSet: SetType | null;
  latestTimestamp: string;
};

export type ImageType = {
  name: string;
  parent: string;
  fullPath: string;
  /** URL to image, for display. */
  src: string;
};

export type Settings = {
  view: ViewType;
  bottomNav: boolean;
  applyTheme: string;
  lightTheme: string;
  darkTheme: string;
  manualTheme: boolean;
  fromTimeTheme: string;
  toTimeTheme: string;
  density: string;
};

export type UserPreferencesDoc = {
  favorites?: string[];
  filterPresets?: OldPresetType[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};

export type GlobalDoc = {
  filterPresets: OldPresetType[];
};

export type UpdateEntryType = {
  id: string;
  name: string;
  title: string;
  date: string;
  body: string;
  pinned: boolean;
};

export type UserContextType = {
  user: {
    email: string | null;
    name: string | null;
    avatar: string | null;
    nickname: string;
    isDesigner: boolean;
    isEditor: boolean;
    isAdmin: boolean;
    id: string | null;
  };
  setUser: (user: Partial<CurrentUserType>) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  hidden: string[];
  toggleHidden: (id: string) => void;
  syncSettings: boolean;
  setSyncSettings: (bool: boolean, write?: boolean) => void;
  preset: PresetType;
  presets: PresetType[];
  selectPreset: (id: string) => void;
  newPreset: (preset: PresetType) => void;
  editPreset: (preset: PresetType) => void;
  deletePreset: (preset: PresetType) => void;
  newGlobalPreset: (preset: PresetType) => void;
  editGlobalPreset: (preset: PresetType) => void;
  deleteGlobalPreset: (preset: PresetType) => void;
};
