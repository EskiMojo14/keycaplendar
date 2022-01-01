import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { ImageObj } from "./constructors";
import type { ImageType } from "./types";

const blankImage = { ...new ImageObj() };

type ImagesState = {
  checkedImages: ImageType[];
  currentFolder: string;
  detailImage: ImageType;
  detailMetadata: Record<string, unknown>;
  duplicateSetImages: string[];
  folders: string[];
  images: ImageType[];
  loading: boolean;
  setImages: string[];
};

export const initialState: ImagesState = {
  checkedImages: [],
  currentFolder: "thumbs",
  detailImage: blankImage,
  detailMetadata: {},
  duplicateSetImages: [],
  folders: [],
  images: [],
  loading: false,
  setImages: [],
};

export const imagesSlice = createSlice({
  initialState,
  name: "images",
  reducers: {
    appendImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      state.images = state.images.concat(payload);
    },
    setCheckedImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      state.checkedImages = payload;
    },
    setCurrentFolder: (state, { payload }: PayloadAction<string>) => {
      state.currentFolder = payload;
    },
    setDetailImage: (state, { payload }: PayloadAction<ImageType>) => {
      state.detailImage = payload;
    },
    setDetailMetadata: (
      state,
      { payload }: PayloadAction<Record<string, unknown>>
    ) => {
      state.detailMetadata = payload;
    },
    setDuplicateSetImages: (state, { payload }: PayloadAction<string[]>) => {
      state.duplicateSetImages = payload;
    },
    setFolders: (state, { payload }: PayloadAction<string[]>) => {
      state.folders = payload;
    },
    setImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      state.images = payload;
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setSetImages: (state, { payload }: PayloadAction<string[]>) => {
      state.setImages = payload;
    },
  },
});

export const {
  actions: {
    appendImages,
    setCheckedImages,
    setCurrentFolder,
    setDetailImage,
    setDetailMetadata,
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

export const selectImages = (state: RootState) => state.images.images;

export const selectCheckedImages = (state: RootState) =>
  state.images.checkedImages;

export const selectSetImages = (state: RootState) => state.images.setImages;

export const selectDuplicateSetImages = (state: RootState) =>
  state.images.duplicateSetImages;

export const selectDetailImage = (state: RootState) => state.images.detailImage;

export const selectDetailMetadata = (state: RootState) =>
  state.images.detailMetadata;

export default imagesSlice.reducer;
