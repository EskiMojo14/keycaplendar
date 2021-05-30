import { userRoles } from "./constants";

export type VendorType = {
  id?: string;
  name: string;
  region: string;
  storeLink?: string;
  endDate?: string;
};

export type SetType = {
  id: string;
  alias: string;
  latestEditor: string;
  colorway: string;
  designer: string[];
  details: string;
  notes?: string;
  gbEnd: string;
  gbLaunch: string;
  gbMonth?: boolean;
  icDate: string;
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

export type StatisticsSetType = {
  colorway: string;
  designer: string[];
  gbEnd: string;
  gbLaunch: string;
  icDate: string;
  id: string;
  profile: string;
  shipped?: boolean;
  vendors?: VendorType[];
};

/** SetType but with all keys set to optional, as an action can include "deleted" sets. */
export type ActionSetType = Partial<SetType>;

export type ActionType = {
  action: "created" | "deleted" | "updated";
  after: ActionSetType;
  before: ActionSetType;
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

export type Categories = "icDate" | "gbLaunch";

export type Properties = "profile" | "designer" | "vendor";

export type UserRoles = typeof userRoles[number];

export type GuideEntryType = {
  id: string;
  /** The author of the update. */
  name: string;
  title: string;
  tags: string[];
  body: string;
  visibility: UserRoles | "all";
};
