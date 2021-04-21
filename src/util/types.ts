import { createSnackbarQueue } from "@rmwc/snackbar";
import React from "react";
import { whitelistShipped } from "./constants";

/**
 * Alias for `Record<string, T>`.
 */

export type Obj<T = unknown> = Record<string, T>;

/**
 * Alias for standard HTML props.
 */

export type HTMLProps = React.HTMLAttributes<HTMLElement>;

/**
 * Possible values for sort orders.
 */

export type SortOrderType = "ascending" | "descending";

/**
 * Sort params which are dates.
 */

export type DateSortKeys = "icDate" | "gbLaunch" | "gbEnd";

/**
 * Sort params which are arrays.
 */

export type ArraySortKeys = "designer";

export type WhitelistType = {
  /** Array of allowed profiles. */
  profiles: string[];
  /** Array of allowed shipped values. */
  shipped: typeof whitelistShipped;
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
  whitelist: WhitelistType;
};

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

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export type Sorts = "total" | "alphabetical";

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

export type QueueType = ReturnType<typeof createSnackbarQueue>;

/** SetType but with all keys set to optional, as an action can include "deleted" sets. */
export type ActionSetType = Partial<SetType>;

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

export type ImageType = {
  name: string;
  parent: string;
  fullPath: string;
  /** URL to image, for display. */
  src: string;
};

export type Settings = {
  view: string;
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
  filterPresets?: PresetType[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
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
  selectPreset: (presetName: string) => void;
  newPreset: (preset: PresetType) => void;
  editPreset: (preset: PresetType) => void;
  deletePreset: (preset: PresetType) => void;
};
