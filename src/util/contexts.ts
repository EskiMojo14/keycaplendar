import React from "react";
import { Preset } from "./constructors";
import { UserContextType } from "./types";

/* eslint-disable @typescript-eslint/no-empty-function */

export const UserContext = React.createContext<UserContextType>({
  user: {
    email: null,
    name: null,
    avatar: null,
    nickname: "",
    isDesigner: false,
    isEditor: false,
    isAdmin: false,
    id: null,
  },
  setUser: () => {},
  favorites: [],
  toggleFavorite: () => {},
  hidden: [],
  toggleHidden: () => {},
  syncSettings: false,
  setSyncSettings: () => {},
  preset: new Preset(),
  presets: [],
  selectPreset: () => {},
  newPreset: () => {},
  editPreset: () => {},
  deletePreset: () => {},
  newGlobalPreset: () => {},
  editGlobalPreset: () => {},
  deleteGlobalPreset: () => {},
});

UserContext.displayName = "User";
