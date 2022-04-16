import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import type { PresetType } from "@s/main/types";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type { CurrentUserType } from "./types";

export const userPresetAdapter = createEntityAdapter<PresetType>({
  sortComparer: alphabeticalSortPropCurried("name", false, "Default"),
});

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
  bought: EntityId[];
  favorites: EntityId[];
  favoritesId: string;
  hidden: EntityId[];
  shareName: string;
  user: CurrentUserType;
  userPresets: EntityState<PresetType>;
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
  userPresets: userPresetAdapter.getInitialState(),
};

export const userSlice = createSlice({
  initialState,
  name: "user",
  reducers: {
    addUserPreset: (state, { payload }: PayloadAction<PresetType>) => {
      userPresetAdapter.setOne(state.userPresets, payload);
    },
    deleteUserPreset: (state, { payload }: PayloadAction<EntityId>) => {
      userPresetAdapter.removeOne(state.userPresets, payload);
    },
    resetUser: () => initialState,
    setBought: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.bought = payload;
    },
    setFavorites: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.favorites = payload;
    },
    setFavoritesId: (state, { payload }: PayloadAction<string>) => {
      state.favoritesId = payload;
    },
    setHidden: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.hidden = payload;
    },
    setShareName: (state, { payload }: PayloadAction<string>) => {
      state.shareName = payload;
    },
    setUser: (state, { payload }: PayloadAction<Partial<CurrentUserType>>) => {
      state.user = { ...blankCurrentUser, ...payload };
    },
    setUserPresets: (state, { payload }: PayloadAction<PresetType[]>) => {
      userPresetAdapter.setAll(state.userPresets, payload);
    },
    upsertUserPreset: (state, { payload }: PayloadAction<PresetType>) => {
      userPresetAdapter.upsertOne(state.userPresets, payload);
    },
  },
});

export const {
  actions: {
    addUserPreset,
    deleteUserPreset,
    resetUser,
    setBought,
    setFavorites,
    setFavoritesId,
    setHidden,
    setShareName,
    setUser,
    setUserPresets,
    upsertUserPreset,
  },
} = userSlice;

export const selectUser = (state: RootState) => state.user.user;

export const selectShareName = (state: RootState) => state.user.shareName;

export const selectFavorites = (state: RootState) => state.user.favorites;

export const selectFavoritesId = (state: RootState) => state.user.favoritesId;

export const selectBought = (state: RootState) => state.user.bought;

export const selectHidden = (state: RootState) => state.user.hidden;

export const {
  selectAll: selectAllUserPresets,
  selectById: selectUserPresetById,
  selectEntities: selectUserPresetMap,
  selectIds: selectUserPresetIds,
  selectTotal: selectUserPresetTotal,
} = userPresetAdapter.getSelectors(
  (state: RootState) => state.user.userPresets
);

const createSetListSelector = (selector: (state: RootState) => EntityId[]) =>
  createSelector(
    selector,
    (state: RootState, id: EntityId) => id,
    (list, id) => list.includes(id)
  );

export const createSelectSetFavorited = () =>
  createSetListSelector(selectFavorites);
export const createSelectSetBought = () => createSetListSelector(selectBought);
export const createSelectSetHidden = () => createSetListSelector(selectHidden);

export default userSlice.reducer;
