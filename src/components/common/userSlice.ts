import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "../../app/store";
import { CurrentUserType, PresetType } from "../../util/types";

type UserState = {
  user: CurrentUserType;
  favorites: string[];
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
  favorites: [],
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
    setUserPresets: (state, action: PayloadAction<PresetType[]>) => {
      state.userPresets = action.payload;
    },
    setFavorites: (state, action: PayloadAction<string[]>) => {
      state.favorites = action.payload;
    },
    setHidden: (state, action: PayloadAction<string[]>) => {
      state.hidden = action.payload;
    },
  },
});

export const { setUser, setUserPresets, setFavorites, setHidden } = userSlice.actions;

export const selectUser = (state: RootState) => state.user.user;

export const selectUserPresets = (state: RootState) => state.user.userPresets;

export const selectFavorites = (state: RootState) => state.user.favorites;

export const selectHidden = (state: RootState) => state.user.hidden;

export default userSlice.reducer;
