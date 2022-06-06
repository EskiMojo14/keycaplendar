import {
  createEntityAdapter,
  createSelector,
  createSlice,
} from "@reduxjs/toolkit";
import type {
  Dictionary,
  EntityId,
  EntityState,
  PayloadAction,
} from "@reduxjs/toolkit";
import type { RootState } from "~/app/store";
import baseApi, { selectAllCachedArgsByQuery } from "@s/api";
import { addErrorMessages } from "@s/api/functions";
import firebase from "@s/firebase";
import { selectAllSets } from "@s/main";
import {
  alphabeticalSortCurried,
  batchStorageDelete,
  getStorageFolders,
  groupBy,
} from "@s/util/functions";
import { partialImage } from "./constructors";
import type { ImageType } from "./types";

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
    deleteImages: build.mutation<
      "Success",
      { images: ImageType[]; all?: boolean }
    >({
      onQueryStarted: async (
        { all, images },
        { dispatch, getState, queryFulfilled }
      ) => {
        try {
          await queryFulfilled;
          const folders: string[] = [];
          if (all) {
            folders.push(
              ...selectAllCachedArgsByQuery(
                getState() as RootState,
                "getAllImages"
              )
            );
          } else {
            // eslint-disable-next-line no-use-before-define
            const currentFolder = selectCurrentFolder(getState() as RootState);
            folders.push(currentFolder);
          }
          for (const folder of folders) {
            dispatch(
              imageApi.util.updateQueryData(
                "getAllImages",
                folder,
                (entityState) => {
                  imageAdapter.removeMany(
                    entityState,
                    images.map(imageAdapter.selectId)
                  );
                }
              )
            );
          }
        } catch {}
      },
      queryFn: async ({ all, images }, { dispatch, getState }) => {
        try {
          const { data: folders = [] } =
            imageApi.endpoints.getStorageFolders.select()(
              getState() as RootState
            );
          const paths = all
            ? images.flatMap((image) =>
                folders.map((folder) => `${folder}/${image.name}`)
              )
            : images.map((image) => image.fullPath);
          await batchStorageDelete(paths);
          return { data: "Success" };
        } catch (error) {
          if (all) {
            // we don't know where we went wrong, refetch them all to be safe
            const cachedFolders = selectAllCachedArgsByQuery(
              getState() as RootState,
              "getAllImages"
            );
            for (const folder of cachedFolders) {
              dispatch(
                imageApi.util.prefetch("getAllImages", folder, { force: true })
              );
            }
          }
          return { error };
        }
      },
    }),
    getAllImages: build.query<EntityState<ImageType>, string>({
      queryFn: async (path: string) => {
        try {
          let images: ImageType[] = [];
          const recursiveListAll = async (nextPageToken?: string) =>
            await storageRef
              .child(path)
              .list({ maxResults: 100, pageToken: nextPageToken });
          let result = await recursiveListAll();
          images = result.items.map(processItem);
          while (result.nextPageToken) {
            result = await recursiveListAll(result.nextPageToken);
            images = images.concat(result.items.map(processItem));
          }
          return {
            data: imageAdapter.setAll(imageAdapter.getInitialState(), images),
          };
        } catch (error) {
          return { error };
        }
      },
    }),
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

export const {
  useDeleteImagesMutation,
  useGetAllImagesQuery,
  useGetStorageFoldersQuery,
} = imageApi;

addErrorMessages<typeof imageApi.endpoints>({
  deleteImages: "Failed to delete images",
  getAllImages: "Failed to get images",
  getStorageFolders: "Failed to get storage folders",
});

type ImagesState = {
  currentFolder: string;
};

export const initialState: ImagesState = {
  currentFolder: "thumbs",
};

export const imagesSlice = createSlice({
  initialState,
  name: "images",
  reducers: {
    folderChange: (state, { payload }: PayloadAction<string>) => {
      state.currentFolder = payload;
    },
  },
});

export const {
  actions: { folderChange },
} = imagesSlice;

export const selectCurrentFolder = (state: RootState) =>
  state.images.currentFolder;

const fileNameRegex = /keysets%2F(.*)\?/;

export const selectSetImages = createSelector(
  selectAllSets,
  (sets): Dictionary<EntityId[]> =>
    groupBy(
      sets,
      (set) => {
        const [, regexMatch] = set.image.match(fileNameRegex) ?? [];
        return regexMatch ? decodeURIComponent(regexMatch) : "";
      },
      { createVal: ({ id }) => id }
    )
);

export const {
  selectAll: selectImages,
  selectById: selectImageById,
  selectEntities: selectImageMap,
  selectIds: selectImageIds,
  selectTotal: selectImageTotal,
} = imageAdapter.getSelectors();

export const selectImagesByUsage = createSelector(
  selectImages,
  (_: unknown, setImages: Dictionary<EntityId[]>) => setImages,
  (images, setImages) =>
    images.reduce<{ unused: EntityId[]; used: EntityId[] }>(
      (acc, image) => {
        if (setImages[image.name]) {
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
  (_: unknown, setImages: Dictionary<EntityId[]>) => setImages,
  ({ used }, setImages) => {
    const duplicates = Object.fromEntries(
      Object.entries(setImages).filter(([, ids]) => ids && ids.length > 1)
    );
    return used.filter((image) => duplicates[image]);
  }
);

export const selectSearchedImages = createSelector(
  selectImages,
  (_: unknown, search: string) => search,
  (_: unknown, __: unknown, regexSearch: boolean) => regexSearch,
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
