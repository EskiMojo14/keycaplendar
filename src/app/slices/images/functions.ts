import { queue } from "~/app/snackbar-queue";
import store from "~/app/store";
import firebase from "@s/firebase";
import { selectAllSets } from "@s/main";
import {
  alphabeticalSort,
  alphabeticalSortCurried,
  getStorageFolders,
} from "@s/util/functions";
import {
  appendImages,
  selectCurrentFolder,
  setCheckedImages,
  setCurrentFolder,
  setDuplicateSetImages,
  setFolders,
  setImages,
  setLoading,
  setSetImages,
} from ".";
import { partialImage } from "./constructors";

const storage = firebase.storage();

const storageRef = storage.ref();

const { dispatch } = store;

export const createSetImageList = (state = store.getState()) => {
  const allSets = selectAllSets(state);

  const fileNameRegex = /keysets%2F(.*)\?/;
  const setImages = alphabeticalSort(
    allSets
      .map((set) => {
        const [, regexMatch] = set.image.match(fileNameRegex) ?? [];
        return regexMatch ? decodeURIComponent(regexMatch) : "";
      })
      .filter(Boolean)
  );
  const findDuplicates = (arr: string[]) =>
    arr.filter((item, index) => arr.indexOf(item) !== index);
  dispatch(setSetImages(setImages));
  dispatch(setDuplicateSetImages(findDuplicates(setImages)));
};

const processItems = (items: firebase.storage.Reference[], append = false) => {
  const images = items.map((itemRef) => {
    const src = `https://firebasestorage.googleapis.com/v0/b/${
      itemRef.bucket
    }/o/${encodeURIComponent(itemRef.fullPath)}?alt=media`;
    return partialImage({
      fullPath: itemRef.fullPath,
      name: itemRef.name,
      parent: itemRef.parent?.fullPath ?? "",
      src,
    });
  });
  images.sort((a, b) => {
    const nameA = a.name.replace(".png", "").toLowerCase();
    const nameB = b.name.replace(".png", "").toLowerCase();
    return alphabeticalSortCurried()(nameA, nameB);
  });
  if (append) {
    dispatch(appendImages(images));
  } else {
    dispatch(setImages(images));
  }
  dispatch(setCheckedImages([]));
  dispatch(setLoading(false));
};

export const getFolders = async () => {
  const folders = await getStorageFolders();
  const sortOrder = ["thumbs", "card", "list", "image-list"];
  folders.sort((a, b) => {
    const indexA = sortOrder.indexOf(a);
    const indexB = sortOrder.indexOf(b);
    return indexA - indexB;
  });
  dispatch(setFolders(folders));
};

export const listAll = (state = store.getState()) => {
  const path = selectCurrentFolder(state);
  const paginatedListAll = (nextPageToken?: string) => {
    dispatch(setLoading(true));
    storageRef
      .child(path)
      .list({ maxResults: 100, pageToken: nextPageToken })
      .then((res) => {
        processItems(res.items, Boolean(nextPageToken));
        if (res.nextPageToken) {
          paginatedListAll(res.nextPageToken);
        }
      })
      .catch((error) => {
        queue.notify({ title: `Failed to list images: ${error}` });
        dispatch(setLoading(false));
      });
  };
  paginatedListAll();
};

export const setFolder = (folder: string) => {
  dispatch(setCurrentFolder(folder));
  listAll();
};
