import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../store";
import { CurrentUserType } from "./types";
import { PresetType } from "../main/types";

type UserState = {
  user: CurrentUserType;
  shareName: string;
  favorites: string[];
  favoritesId: string;
  bought: string[];
  hidden: string[];
  userPresets: PresetType[];
};

const initialState: UserState = {
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
    setUser: (state, action: PayloadAction<Partial<CurrentUserType>>) => {
      const blankUser: CurrentUserType = {
        email: "",
        name: "",
        avatar: "",
        nickname: "",
        isDesigner: false,
        isEditor: false,
        isAdmin: false,
        id: "",
      };
      state.user = action.payload.email ? { ...blankUser, ...action.payload } : blankUser;
    },
    setShareName: (state, action: PayloadAction<string>) => {
      state.shareName = action.payload;
    },
    setUserPresets: (state, action: PayloadAction<PresetType[]>) => {
      state.userPresets = action.payload;
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    setFavoritesId: (state, action: PayloadAction<string>) => {
      state.favoritesId = action.payload;
    },
    setBought: (state, action: PayloadAction<string[]>) => {
      state.bought = action.payload;
    },
    setHidden: (state, action: PayloadAction<string[]>) => {
      state.hidden = action.payload;
    },
  },
});

export const {
  setUser,
  setShareName,
  setUserPresets,
  setFavorites,
  setFavoritesId,
  setBought,
  setHidden,
} = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export const selectShareName = (state: RootState) => state.user.shareName;

export const selectUserPresets = (state: RootState) => state.user.userPresets;

export const selectFavorites = (state: RootState) => state.user.favorites;

export const selectFavoritesId = (state: RootState) => state.user.favoritesId;

export const selectBought = (state: RootState) => state.user.bought;

export const selectHidden = (state: RootState) => state.user.hidden;

export default userSlice.reducer;
