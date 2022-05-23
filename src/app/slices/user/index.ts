import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import baseApi from "@s/api";
import firestore from "@s/firebase/firestore";
import type { UserId, UserPreferencesDoc } from "@s/firebase/types";
import { selectAllRegions } from "@s/main";
import { updatePreset } from "@s/main/functions";
import type { PresetType } from "@s/main/types";
import { alphabeticalSortPropCurried } from "@s/util/functions";
import type { Overwrite } from "@s/util/types";
import type { CurrentUserType } from "./types";

export const userPresetAdapter = createEntityAdapter<PresetType>({
  sortComparer: alphabeticalSortPropCurried("name", false, "Default"),
});

export const userApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getUserDoc: build.query<
      | Overwrite<
          UserPreferencesDoc,
          { filterPresets?: EntityState<PresetType> }
        >
      | "No user",
      string | undefined
    >({
      queryFn: async (id, { getState }) => {
        if (!id) {
          throw new Error("No ID provided");
        }
        try {
          const doc = await firestore
            .collection("users")
            .doc(id as UserId)
            .get();
          const data = doc.data();
          if (!data) {
            throw new Error("No doc found");
          }

          const regions = selectAllRegions(getState() as RootState);
          return {
            data: {
              ...data,
              filterPresets:
                data.filterPresets &&
                userPresetAdapter.setMany(
                  userPresetAdapter.getInitialState(),
                  data.filterPresets.map((preset) =>
                    updatePreset(preset, { regions })
                  )
                ),
            },
          };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetUserDocQuery } = userApi;

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
    boughtChange: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.bought = payload;
    },
    favoritesChange: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.favorites = payload;
    },
    favoritesIdChange: (state, { payload }: PayloadAction<string>) => {
      state.favoritesId = payload;
    },
    hiddenChange: (state, { payload }: PayloadAction<EntityId[]>) => {
      state.hidden = payload;
    },
    shareNameChange: (state, { payload }: PayloadAction<string>) => {
      state.shareName = payload;
    },
    userLogin: (
      state,
      { payload }: PayloadAction<Partial<CurrentUserType>>
    ) => {
      state.user = { ...blankCurrentUser, ...payload };
    },
    userPresetAdded: (state, { payload }: PayloadAction<PresetType>) => {
      userPresetAdapter.setOne(state.userPresets, payload);
    },
    userPresetDeleted: (state, { payload }: PayloadAction<EntityId>) => {
      userPresetAdapter.removeOne(state.userPresets, payload);
    },
    userPresetsLoaded: (state, { payload }: PayloadAction<PresetType[]>) => {
      userPresetAdapter.setAll(state.userPresets, payload);
    },
    userPresetUpdated: (state, { payload }: PayloadAction<PresetType>) => {
      userPresetAdapter.upsertOne(state.userPresets, payload);
    },
    userReset: () => initialState,
  },
});

export const {
  actions: {
    boughtChange,
    favoritesChange,
    favoritesIdChange,
    hiddenChange,
    shareNameChange,
    userLogin,
    userPresetAdded,
    userPresetDeleted,
    userPresetsLoaded,
    userPresetUpdated,
    userReset,
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
