import { OldPresetType } from "../main/types";
import { Settings } from "../settings/types";

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

export type UserPreferencesDoc = {
  filterPresets?: OldPresetType[];
  favorites?: string[];
  bought?: string[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};
