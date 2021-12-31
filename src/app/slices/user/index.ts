import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { PresetType } from "@s/main/types";
import type { CurrentUserType } from "./types";

export const blankUser: CurrentUserType = {
  email: "",
  name: "",
  avatar: "",
  nickname: "",
  isDesigner: false,
  isEditor: false,
  isAdmin: false,
  id: "",
};

type UserState = {
  user: CurrentUserType;
  shareName: string;
  favorites: string[];
  favoritesId: string;
  bought: string[];
  hidden: string[];
  userPresets: PresetType[];
};

export const initialState: UserState = {
  user: {
    email: "",
    name: "",
    avatar: "",
    isEditor: false,
    isAdmin: false,
    nickname: "",
    isDesigner: false,
    id: "",
  },
  shareName: "",
  favorites: [],
  favoritesId: "",
  bought: [],
  hidden: [],
  userPresets: [],
};

export const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, { payload }: PayloadAction<Partial<CurrentUserType>>) => {
      state.user = { ...blankUser, ...payload };
    },
    setShareName: (state, { payload }: PayloadAction<string>) => {
      state.shareName = payload;
    },
    setUserPresets: (state, { payload }: PayloadAction<PresetType[]>) => {
      state.userPresets = payload;
    },
    setFavorites: (state, { payload }: PayloadAction<string[]>) => {
      state.favorites = payload;
    },
    setFavoritesId: (state, { payload }: PayloadAction<string>) => {
      state.favoritesId = payload;
    },
    setBought: (state, { payload }: PayloadAction<string[]>) => {
      state.bought = payload;
    },
    setHidden: (state, { payload }: PayloadAction<string[]>) => {
      state.hidden = payload;
    },
  },
});

export const {
  actions: {
    setUser,
    setShareName,
    setUserPresets,
    setFavorites,
    setFavoritesId,
    setBought,
    setHidden,
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
