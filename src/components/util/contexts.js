import React from "react";

export const UserContext = React.createContext({
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
  syncSettings: false,
  setSyncSettings: () => {},
});

UserContext.displayName = "User";

export const DeviceContext = React.createContext("desktop");

DeviceContext.displayName = "Device";
