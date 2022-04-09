import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type { EntityId, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { queue } from "~/app/snackbar-queue";
import type { AppThunk, RootState } from "~/app/store";
import firebase from "@s/firebase";
import { selectAllSets } from "@s/main";
import {
  alphabeticalSort,
  alphabeticalSortCurried,
  arrayIncludes,
  getStorageFolders,
} from "@s/util/functions";
import { partialImage } from "./constructors";
import type { ImageType } from "./types";

export const imageAdapter = createEntityAdapter<ImageType>({
  selectId: ({ name }) => name,
  sortComparer: ({ name: aName }, { name: bName }) => {
    const nameA = aName.replace(".png", "").toLowerCase();
    const nameB = bName.replace(".png", "").toLowerCase();
    return alphabeticalSortCurried()(nameA, nameB);
  },
});

type ImagesState = {
  currentFolder: string;
  folders: string[];
  images: EntityState<ImageType>;
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
    setFolders: (state, { payload }: PayloadAction<string[]>) => {
      state.folders = payload;
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
  actions: {
    appendImages,
    setCurrentFolder,
    setFolders,
    setImages,
    setLoading,
  },
} = imagesSlice;

export const selectLoading = (state: RootState) => state.images.loading;

export const selectCurrentFolder = (state: RootState) =>
  state.images.currentFolder;

export const selectFolders = (state: RootState) => state.images.folders;

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

export default imagesSlice.reducer;

const storage = firebase.storage();

const storageRef = storage.ref();

const processItem = (itemRef: firebase.storage.Reference) =>
  partialImage({
    fullPath: itemRef.fullPath,
    name: itemRef.name,
    src: `https://firebasestorage.googleapis.com/v0/b/${
      itemRef.bucket
    }/o/${encodeURIComponent(itemRef.fullPath)}?alt=media`,
  });

export const listAll =
  (recursive = true): AppThunk<Promise<void>> =>
  async (dispatch, getState) => {
    const path = selectCurrentFolder(getState());
    const paginatedListAll = async (nextPageToken?: string) => {
      const addItems = nextPageToken ? appendImages : setImages;
      try {
        dispatch(setLoading(true));
        const result = await storageRef
          .child(path)
          .list({ maxResults: 100, pageToken: nextPageToken });

        const processedItems = result.items.map(processItem).sort((a, b) => {
          const nameA = a.name.replace(".png", "").toLowerCase();
          const nameB = b.name.replace(".png", "").toLowerCase();
          return alphabeticalSortCurried()(nameA, nameB);
        });
        dispatch(addItems(processedItems));
        if (recursive && result.nextPageToken) {
          paginatedListAll(result.nextPageToken);
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        queue.notify({ title: `Failed to list images: ${error}` });
        dispatch(setLoading(false));
      }
    };
    paginatedListAll();
  };

export const searchImages =
  (search: string, regexSearch: boolean): AppThunk<EntityId[]> =>
  (dispatch, getState) => {
    const images = selectImages(getState());
    return images
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
      .map(imageAdapter.selectId);
  };

export const getFolders = (): AppThunk<Promise<void>> => async (dispatch) => {
  const folders = await getStorageFolders();
  const sortOrder = ["thumbs", "card", "list", "image-list"];
  folders.sort((a, b) => {
    const indexA = sortOrder.indexOf(a);
    const indexB = sortOrder.indexOf(b);
    return indexA - indexB;
  });
  dispatch(setFolders(folders));
};

export const setFolder =
  (folder: string): AppThunk<void> =>
  (dispatch) => {
    dispatch(setCurrentFolder(folder));
    dispatch(listAll());
  };
