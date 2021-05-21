import React from "react";
import { UserContextType } from "./types";

/* eslint-disable @typescript-eslint/no-empty-function */

export const UserContext = React.createContext<UserContextType>({
  setUser: () => {},
  toggleFavorite: () => {},
  toggleHidden: () => {},
});

UserContext.displayName = "User";
