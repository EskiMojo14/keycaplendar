import { createSlice } from "@reduxjs/toolkit";
import type { PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { ImageObj } from "./constructors";
import type { ImageType } from "./types";

const blankImage = { ...new ImageObj() };

type ImagesState = {
  loading: boolean;

  currentFolder: string;
  folders: string[];

  images: ImageType[];
  checkedImages: ImageType[];
  setImages: string[];
  duplicateSetImages: string[];

  detailImage: ImageType;
  detailMetadata: Record<string, unknown>;
};

export const initialState: ImagesState = {
  loading: false,
  // folders
  currentFolder: "thumbs",
  folders: [],
  // images
  images: [],
  checkedImages: [],
  setImages: [],
  duplicateSetImages: [],
  // details
  detailImage: blankImage,
  detailMetadata: {},
};

export const imagesSlice = createSlice({
  name: "images",
  initialState,
  reducers: {
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
    setCurrentFolder: (state, { payload }: PayloadAction<string>) => {
      state.currentFolder = payload;
    },
    setFolders: (state, { payload }: PayloadAction<string[]>) => {
      state.folders = payload;
    },
    setImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      state.images = payload;
    },
    appendImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      state.images = state.images.concat(payload);
    },
    setCheckedImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      state.checkedImages = payload;
    },
    setSetImages: (state, { payload }: PayloadAction<string[]>) => {
      state.setImages = payload;
    },
    setDuplicateSetImages: (state, { payload }: PayloadAction<string[]>) => {
      state.duplicateSetImages = payload;
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
