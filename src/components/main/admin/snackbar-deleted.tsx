import type { MouseEvent } from "react";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import firestore from "@s/firebase/firestore";
import type { KeysetId } from "@s/firebase/types";
import { getData } from "@s/main/functions";
import type { SetType } from "@s/main/types";
import { selectUser } from "@s/user";
import { batchStorageDelete, getStorageFolders } from "@s/util/functions";

type SnackbarDeletedProps = {
  close: () => void;
  open: boolean;
  set: SetType;
};

export const SnackbarDeleted = ({
  close,
  open,
  set: { id, ...set },
}: SnackbarDeletedProps) => {
  const user = useAppSelector(selectUser);
  const deleteImages = async (name: string) => {
    const folders = await getStorageFolders();
    const allImages = folders.map((folder) => `${folder}/${name}`);
    batchStorageDelete(allImages)
      .then(() => {
        queue.notify({ title: "Successfully deleted thumbnails." });
      })
      .catch((error) => {
        queue.notify({ title: "Failed to delete thumbnails: " + error });
        console.log(error);
      });
  };
  const closeBar = (recreated = false) => {
    if (!recreated) {
      const fileNameRegex = /keysets%2F(.*)\?/;
      const regexMatch = set.image.match(fileNameRegex);
      if (regexMatch) {
        const [, imageName] = regexMatch;
        deleteImages(imageName);
      }
    }
    close();
  };
  const recreateEntry = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    firestore
      .collection("keysets")
      .doc(id as KeysetId)
      .set(
        {
          ...set,
          gbLaunch: set.gbMonth ? set.gbLaunch.slice(0, 7) : set.gbLaunch,
          latestEditor: user.id,
        },
        { merge: true }
      )
      .then(() => {
        console.log("Document recreated with ID: ", id);
        queue.notify({ title: "Entry successfully recreated." });
        getData();
      })
      .catch((error) => {
        console.error("Error recreating document: ", error);
        queue.notify({ title: "Error recreating document: " + error });
      });
    closeBar(true);
  };
  return (
    <Snackbar
      action={<SnackbarAction label="Undo" onClick={recreateEntry} />}
      dismissesOnAction={false}
      message={`${set.profile} ${set.colorway} has been deleted.`}
      onClose={() => closeBar()}
      open={open}
    />
  );
};

export default SnackbarDeleted;
