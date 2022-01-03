import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { PresetType } from "@s/main/types";
import type { CurrentUserType } from "./types";

export const blankCurrentUser: CurrentUserType = {
  avatar: "",
  email: "",
  id: "",
  isAdmin: false,
  isDesigner: false,
  isEditor: false,
  name: "",
  nickname: "",
};

type UserState = {
  bought: string[];
  favorites: string[];
  favoritesId: string;
  hidden: string[];
  shareName: string;
  user: CurrentUserType;
  userPresets: PresetType[];
};

export const initialState: UserState = {
  bought: [],
  favorites: [],
  favoritesId: "",
  hidden: [],
  shareName: "",
  user: {
    avatar: "",
    email: "",
    id: "",
    isAdmin: false,
    isDesigner: false,
    isEditor: false,
    name: "",
    nickname: "",
  },
  userPresets: [],
};

export const userSlice = createSlice({
  initialState,
  name: "user",
  reducers: {
    setBought: (state, { payload }: PayloadAction<string[]>) => {
      state.bought = payload;
    },
    setFavorites: (state, { payload }: PayloadAction<string[]>) => {
      state.favorites = payload;
    },
    setFavoritesId: (state, { payload }: PayloadAction<string>) => {
      state.favoritesId = payload;
    },
    setHidden: (state, { payload }: PayloadAction<string[]>) => {
      state.hidden = payload;
    },
    setShareName: (state, { payload }: PayloadAction<string>) => {
      state.shareName = payload;
    },
    setUser: (state, { payload }: PayloadAction<Partial<CurrentUserType>>) => {
      state.user = { ...blankCurrentUser, ...payload };
    },
    setUserPresets: (state, { payload }: PayloadAction<PresetType[]>) => {
      state.userPresets = payload;
    },
  },
});

export const {
  actions: {
    setBought,
    setFavorites,
    setFavoritesId,
    setHidden,
    setShareName,
    setUser,
    setUserPresets,
  },
} = userSlice;

export const selectUser = (state: RootState) => state.user.user;

export const selectShareName = (state: RootState) => state.user.shareName;

export const selectUserPresets = (state: RootState) => state.user.userPresets;

export const selectFavorites = (state: RootState) => state.user.favorites;

export const selectFavoritesId = (state: RootState) => state.user.favoritesId;

export const selectBought = (state: RootState) => state.user.bought;

export const selectHidden = (state: RootState) => state.user.hidden;

export default userSlice.reducer;
