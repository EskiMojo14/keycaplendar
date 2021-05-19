import React from "react";
import { Preset } from "./constructors";
import { UserContextType } from "./types";

/* eslint-disable @typescript-eslint/no-empty-function */

export const UserContext = React.createContext<UserContextType>({
  setUser: () => {},
  favorites: [],
  toggleFavorite: () => {},
  hidden: [],
  toggleHidden: () => {},
  syncSettings: false,
  setSyncSettings: () => {},
  preset: new Preset(),
  selectPreset: () => {},
  newPreset: () => {},
  editPreset: () => {},
  deletePreset: () => {},
  newGlobalPreset: () => {},
  editGlobalPreset: () => {},
  deleteGlobalPreset: () => {},
});

UserContext.displayName = "User";
