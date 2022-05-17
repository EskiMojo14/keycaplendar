import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import { combineListeners } from "@mw/listener/functions";
import baseApi from "@s/api";
import { createErrorMessagesListeners } from "@s/api/functions";
import { selectAllSets } from "@s/main";
import {
  alphabeticalSort,
  alphabeticalSortCurried,
  arrayIncludes,
  getStorageFolders,
} from "@s/util/functions";
import type { ImageType } from "./types";

export const imageAdapter = createEntityAdapter<ImageType>({
  selectId: ({ name }) => name,
  sortComparer: ({ name: aName }, { name: bName }) => {
    const nameA = aName.replace(".png", "").toLowerCase();
    const nameB = bName.replace(".png", "").toLowerCase();
    return alphabeticalSortCurried()(nameA, nameB);
  },
});

export const imageApi = baseApi.injectEndpoints({
  endpoints: (build) => ({
    getStorageFolders: build.query<string[], void>({
      queryFn: async () => {
        try {
          const folders = await getStorageFolders();
          const sortOrder = ["thumbs", "card", "list", "image-list"];
          folders.sort((a, b) => {
            const indexA = sortOrder.indexOf(a);
            const indexB = sortOrder.indexOf(b);
            return indexA - indexB;
          });
          return { data: folders };
        } catch (error) {
          return { error };
        }
      },
    }),
  }),
  overrideExisting: true,
});

export const { useGetStorageFoldersQuery } = imageApi;

export const setupImageListeners = combineListeners((startListening) =>
  createErrorMessagesListeners(
    imageApi.endpoints,
    { getStorageFolders: "Failed to get storage folders" },
    startListening
  )
);

type ImagesState = {
  currentFolder: string;
  images: EntityState<ImageType>;
  loading: boolean;
};

export const initialState: ImagesState = {
  currentFolder: "thumbs",
  images: imageAdapter.getInitialState(),
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
    setImages: (state, { payload }: PayloadAction<ImageType[]>) => {
      imageAdapter.setAll(state.images, payload);
    },
    setLoading: (state, { payload }: PayloadAction<boolean>) => {
      state.loading = payload;
    },
  },
});

export const {
  actions: { appendImages, setCurrentFolder, setImages, setLoading },
} = imagesSlice;

export const selectLoading = (state: RootState) => state.images.loading;

export const selectCurrentFolder = (state: RootState) =>
  state.images.currentFolder;

const fileNameRegex = /keysets%2F(.*)\?/;
export const selectSetImages = createSelector(selectAllSets, (sets) =>
  alphabeticalSort(
    sets
      .map((set) => {
        const [, regexMatch] = set.image.match(fileNameRegex) ?? [];
        return regexMatch ? decodeURIComponent(regexMatch) : "";
      })
      .filter(Boolean)
  )
);

const findDuplicates = (arr: string[]) =>
  arr.filter((item, index) => arr.indexOf(item) !== index);

export const selectDuplicateSetImages = createSelector(
  selectSetImages,
  (setImages) => findDuplicates(setImages)
);

export const {
  selectAll: selectImages,
  selectById: selectImageById,
  selectEntities: selectImageMap,
  selectIds: selectImageIds,
  selectTotal: selectImageTotal,
} = imageAdapter.getSelectors<RootState>((state) => state.images.images);

export const selectImagesByUsage = createSelector(
  selectImages,
  selectSetImages,
  (images, keysetImages) =>
    images.reduce<{ unused: EntityId[]; used: EntityId[] }>(
      (acc, image) => {
        if (keysetImages.includes(image.name)) {
          acc.used.push(imageAdapter.selectId(image));
        } else {
          acc.unused.push(imageAdapter.selectId(image));
        }
        return acc;
      },
      { unused: [], used: [] }
    )
);
export const selectDuplicateImages = createSelector(
  selectImagesByUsage,
  selectDuplicateSetImages,
  ({ used }, duplicateSetImages) =>
    used.filter((image) => arrayIncludes(duplicateSetImages, image))
);

export const selectSearchedImages = createSelector(
  selectImages,
  (state: RootState, search: string) => search,
  (state: RootState, search: string, regexSearch: boolean) => regexSearch,
  (images, search, regexSearch) =>
    images
      .filter((image) => {
        if (regexSearch) {
          const regex = new RegExp(search);
          return regex.test(image.name) && search.length > 1;
        } else {
          return (
            image.name.toLowerCase().includes(search.toLowerCase()) &&
            search.length > 1
          );
        }
      })
      .map(imageAdapter.selectId)
);

export default imagesSlice.reducer;
