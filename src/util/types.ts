import React from "react";

export type IconObjectType = {
  strategy: string;
  icon: React.ReactNode;
};

export type WhitelistType = {
  favorites: boolean;
  hidden: boolean;
  profiles: string[];
  shipped: string[];
  vendorMode: string;
  vendors: string[];
};

export type UserType = {
  avatar: string;
  email: string;
  id: string;
  isAdmin: boolean;
  isDesigner: boolean;
  isEditor: boolean;
  name: string;
  nickname: string;
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
    id: string;
    name: string;
    region: string;
    storeLink?: string;
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
  colorway?: string;
  designer?: string[];
  details?: string;
  gbEnd?: string;
  gbLaunch?: string;
  gbMonth?: boolean;
  icDate?: string;
  id?: string;
  image?: string;
  profile?: string;
  sales?: string;
  shipped?: boolean;
  vendors?: {
    id: string;
    name: string;
    region: string;
    storeLink?: string;
  }[];
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

export type imageTypes = {
  name: string;
  parent: string;
  fullPath: string;
  src: string;
};
