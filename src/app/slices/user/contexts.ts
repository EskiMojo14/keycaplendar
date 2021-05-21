import React from "react";
import { UserContextType } from "./types";

/* eslint-disable @typescript-eslint/no-empty-function */

export const UserContext = React.createContext<UserContextType>({
  setUser: () => {},
  toggleFavorite: () => {},
  toggleHidden: () => {},
  setSyncSettings: () => {},
  selectPreset: () => {},
  newPreset: () => {},
  editPreset: () => {},
  deletePreset: () => {},
  newGlobalPreset: () => {},
  editGlobalPreset: () => {},
  deleteGlobalPreset: () => {},
});

UserContext.displayName = "User";
