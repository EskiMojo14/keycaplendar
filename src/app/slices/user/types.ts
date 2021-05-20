import { OldPresetType, PresetType } from "../main/types";
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
  favorites?: string[];
  filterPresets?: OldPresetType[];
  hidden?: string[];
  settings?: Partial<Settings>;
  syncSettings?: boolean;
};

export type UserContextType = {
  setUser: (user: Partial<CurrentUserType>) => void;
  favorites: string[];
  toggleFavorite: (id: string) => void;
  hidden: string[];
  toggleHidden: (id: string) => void;
  syncSettings: boolean;
  setSyncSettings: (bool: boolean, write?: boolean) => void;
  preset: PresetType;
  selectPreset: (id: string) => void;
  newPreset: (preset: PresetType) => void;
  editPreset: (preset: PresetType) => void;
  deletePreset: (preset: PresetType) => void;
  newGlobalPreset: (preset: PresetType) => void;
  editGlobalPreset: (preset: PresetType) => void;
  deleteGlobalPreset: (preset: PresetType) => void;
};
