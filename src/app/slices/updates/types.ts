export type UpdateEntryType = {
  id: string;
  /** The author of the update. */
  name: string;
  title: string;
  date: string;
  body: string;
  pinned: boolean;
};
