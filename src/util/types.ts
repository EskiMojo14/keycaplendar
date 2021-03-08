import React from "react";

export type HTMLProps = React.HTMLAttributes<HTMLElement>;

export type IconObjectType = {
  strategy: string;
  icon: JSX.Element;
};

export type WhitelistType = {
  favorites: boolean;
  hidden: boolean;
  profiles: string[];
  shipped: string[];
  vendorMode: string;
  vendors: string[];
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

export type SetType = {
  colorway: string;
  designer: string[];
  details: string;
  gbEnd?: string;
  gbLaunch?: string;
  gbMonth?: boolean;
  icDate: string;
  id: string;
  image: string;
  profile: string;
  sales?: string;
  shipped?: boolean;
  vendors?: {
    id?: string;
    name: string;
    region: string;
    storeLink?: string;
    endDate?: string;
  }[];
};

export type StatisticsType = {
  durationCat: string;
  durationGroup: string;
  shipped: string;
  status: string;
  timeline: string;
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

export type PresetType = {
  name: string;
  id: string;
  whitelist: WhitelistType;
};

export type ImageTypes = {
  name: string;
  parent: string;
  fullPath: string;
  src: string;
};
