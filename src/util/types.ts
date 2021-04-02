import React from "react";
import { whitelistShipped } from "./constants";

export type Obj<T = unknown> = Record<string, T>;

export type HTMLProps = React.HTMLAttributes<HTMLElement>;

export type SortOrderType = "ascending" | "descending";

export type DateSortKeys = "icDate" | "gbLaunch" | "gbEnd";

export type ArraySortKeys = "designer";

export type WhitelistType = {
  profiles: string[];
  shipped: typeof whitelistShipped;
  vendorMode: "include" | "exclude";
  vendors: string[];
  edited?: string[];
};

export type MainWhitelistType = WhitelistType & {
  favorites: boolean;
  hidden: boolean;
};

export type PresetType = {
  name: string;
  id: string;
  whitelist: MainWhitelistType;
};

export type CurrentUserType = {
  avatar: string;
  email: string;
  id: string;
  isAdmin: boolean;
  isDesigner: boolean;
  isEditor: boolean;
  name: string;
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
  sales?: { img: string; thirdParty: boolean };
  shipped?: boolean;
  vendors?: VendorType[];
};

export type StatisticsType = {
  summary: string;
  timelinesCat: string;
  timelinesGroup: string;
  status: string;
  shipped: string;
  durationCat: string;
  durationGroup: string;
  vendors: string;
};

export type StatisticsSortType = {
  duration: string;
  shipped: string;
  status: string;
};

export type QueueType = {
  notify: (info: { [key: string]: any }) => void;
};

export type ActionSetType = {
  [S in keyof SetType]?: SetType[S];
};

export type ActionType = {
  action: string;
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
  src: string;
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
