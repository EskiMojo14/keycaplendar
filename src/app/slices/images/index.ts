import { createEntityAdapter, createSlice } from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { alphabeticalSortCurried } from "@s/util/functions";
import type { ImageType } from "./types";

export const imageAdapter = createEntityAdapter<ImageType>({
  selectId: (image) => image.name,
  sortComparer: ({ name: aName }, { name: bName }) => {
    const nameA = aName.replace(".png", "").toLowerCase();
    const nameB = bName.replace(".png", "").toLowerCase();
    return alphabeticalSortCurried()(nameA, nameB);
  },
});

type ImagesState = {
  currentFolder: string;
  folders: string[];
  images: EntityState<ImageType> & {
    duplicateSetImages: EntityId[];
    setImages: EntityId[];
  };
  loading: boolean;
};

export const initialState: ImagesState = {
  currentFolder: "thumbs",
  folders: [],
  images: imageAdapter.getInitialState({
    duplicateSetImages: [],
    setImages: [],
  }),
  loading: false,
};

export const imagesSlice = createSlice({
  initialState,
  name: "images",
  reducers: {
    appendImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      imageAdapter.addMany(state.images, payload);
    },
    setCurrentFolder: (state, { payload }: PayloadAction<string>) => {
      state.currentFolder = payload;
    },
    setDuplicateSetImages: (state, { payload }: PayloadAction<string[]>) => {
      state.images.duplicateSetImages = payload;
    },
    setFolders: (state, { payload }: PayloadAction<string[]>) => {
      state.folders = payload;
    },
    setImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      imageAdapter.setAll(state.images, payload);
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSetImages: (state, { payload }: PayloadAction<string[]>) => {
      state.images.setImages = payload;
    },
  },
});

export const {
  actions: {
    appendImages,
    setCurrentFolder,
    setDuplicateSetImages,
    setFolders,
    setImages,
    setLoading,
    setSetImages,
  },
} = imagesSlice;

export const selectLoading = (state: RootState) => state.images.loading;

export const selectCurrentFolder = (state: RootState) =>
  state.images.currentFolder;

export const selectFolders = (state: RootState) => state.images.folders;

export const selectSetImages = (state: RootState) =>
  state.images.images.setImages;

export const selectDuplicateSetImages = (state: RootState) =>
  state.images.images.duplicateSetImages;

export const {
  selectAll: selectImages,
  selectById,
  selectEntities: selectImageMap,
  selectIds,
  selectTotal,
} = imageAdapter.getSelectors<RootState>((state) => state.images.images);

export default imagesSlice.reducer;
