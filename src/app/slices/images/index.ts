import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { ImageObj } from "./constructors";
import { ImageType } from "./types";

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
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setCurrentFolder: (state, action: PayloadAction<string>) => {
      state.currentFolder = action.payload;
    },
    setFolders: (state, action: PayloadAction<string[]>) => {
      state.folders = action.payload;
    },
    setImages: (state, action: PayloadAction<ImageType[]>) => {
      state.images = action.payload;
    },
    appendImages: (state, action: PayloadAction<ImageType[]>) => {
      state.images = state.images.concat(action.payload);
    },
    setCheckedImages: (state, action: PayloadAction<ImageType[]>) => {
      state.checkedImages = action.payload;
    },
    setSetImages: (state, action: PayloadAction<string[]>) => {
      state.setImages = action.payload;
    },
    setDuplicateSetImages: (state, action: PayloadAction<string[]>) => {
      state.duplicateSetImages = action.payload;
    },
    setDetailImage: (state, action: PayloadAction<ImageType>) => {
      state.detailImage = action.payload;
    },
    setDetailMetadata: (state, action: PayloadAction<Record<string, unknown>>) => {
      state.detailMetadata = action.payload;
    },
  },
});

export const {
  setLoading,
  setCurrentFolder,
  setFolders,
  setImages,
  appendImages,
  setCheckedImages,
  setSetImages,
  setDuplicateSetImages,
  setDetailImage,
  setDetailMetadata,
} = imagesSlice.actions;

export const selectLoading = (state: RootState) => state.images.loading;

export const selectCurrentFolder = (state: RootState) => state.images.currentFolder;

export const selectFolders = (state: RootState) => state.images.folders;

export const selectImages = (state: RootState) => state.images.images;

export const selectCheckedImages = (state: RootState) => state.images.checkedImages;

export const selectSetImages = (state: RootState) => state.images.setImages;

export const selectDuplicateSetImages = (state: RootState) => state.images.duplicateSetImages;

export const selectDetailImage = (state: RootState) => state.images.detailImage;

export const selectDetailMetadata = (state: RootState) => state.images.detailMetadata;

export default imagesSlice.reducer;
