import { UserRoles } from "../users/types";

export type GuideEntryType = {
  id: string;
  /** The author of the update. */
  name: string;
  title: string;
  tags: string[];
  body: string;
  visibility: UserRoles | "all";
};
