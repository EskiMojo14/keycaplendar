import firebase from "@s/firebase/firebase";
import store from "~/app/store";
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
} from "./imagesSlice";
import { alphabeticalSort, getStorageFolders } from "@s/common/functions";
import { ImageType } from "./types";
import { ImageObj } from "./constructors";
import { queue } from "~/app/snackbarQueue";

const storage = firebase.storage();

const storageRef = storage.ref();

const { dispatch } = store;

export const createSetImageList = () => {
  const {
    main: { allSets },
  } = store.getState();
  const fileNameRegex = /keysets%2F(.*)\?/;
  const setImages = alphabeticalSort(
    allSets
      .map((set) => {
        const regexMatch = set.image.match(fileNameRegex);
        if (regexMatch) {
          return decodeURIComponent(regexMatch[1]);
        }
        return "";
      })
      .filter(Boolean)
  );
  const findDuplicates = (arr: string[]) => arr.filter((item, index) => arr.indexOf(item) !== index);
  dispatch(setSetImages(setImages));
  dispatch(setDuplicateSetImages(findDuplicates(setImages)));
};

const processItems = (items: firebase.storage.Reference[], append = false) => {
  const images = items.map((itemRef) => {
    const src = `https://firebasestorage.googleapis.com/v0/b/${itemRef.bucket}/o/${encodeURIComponent(
      itemRef.fullPath
    )}?alt=media`;
    const obj: ImageType = {
      ...new ImageObj(itemRef.name, itemRef.parent ? itemRef.parent.fullPath : "", itemRef.fullPath, src),
    };
    return obj;
  });
  images.sort((a, b) => {
    const nameA = a.name.replace(".png", "").toLowerCase();
    const nameB = b.name.replace(".png", "").toLowerCase();
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
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
    const nameA = sortOrder.indexOf(a);
    const nameB = sortOrder.indexOf(b);
    if (nameA < nameB) {
      return -1;
    }
    if (nameA > nameB) {
      return 1;
    }
    return 0;
  });
  dispatch(setFolders(folders));
};

export const listAll = (path = selectCurrentFolder(store.getState())) => {
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
        queue.notify({ title: "Failed to list images: " + error });
        dispatch(setLoading(false));
      });
  };
  paginatedListAll();
};

export const setFolder = (folder: string) => {
  dispatch(setCurrentFolder(folder));
  listAll(folder);
};
