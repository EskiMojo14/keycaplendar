import { notify } from "~/app/snackbar-queue";
import type { AppThunk } from "~/app/store";
import firebase from "@s/firebase";
import {
  appendImages,
  selectCurrentFolder,
  setCurrentFolder,
  setFolders,
  setImages,
  setLoading,
} from "@s/images";
import { alphabeticalSortCurried, getStorageFolders } from "@s/util/functions";
import { partialImage } from "./constructors";

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
        dispatch(
          nextPageToken
            ? appendImages(processedItems)
            : setImages(processedItems)
        );
        if (recursive && result.nextPageToken) {
          paginatedListAll(result.nextPageToken);
        } else {
          dispatch(setLoading(false));
        }
      } catch (error) {
        notify({ title: `Failed to list images: ${error}` });
        dispatch(setLoading(false));
      }
    };
    paginatedListAll();
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
