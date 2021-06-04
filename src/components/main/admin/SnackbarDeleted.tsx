import React from "react";
import { typedFirestore } from "../../../app/slices/firebase/firestore";
import { KeysetId } from "../../../app/slices/firebase/types";
import { useAppSelector } from "../../../app/hooks";
import { batchStorageDelete, getStorageFolders } from "../../../app/slices/common/functions";
import { getData } from "../../../app/slices/main/functions";
import { SetType } from "../../../app/slices/main/types";
import { selectUser } from "../../../app/slices/user/userSlice";
import { queue } from "../../../app/snackbarQueue";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

type SnackbarDeletedProps = {
  close: () => void;
  open: boolean;
  set: SetType;
};

export const SnackbarDeleted = (props: SnackbarDeletedProps) => {
  const user = useAppSelector(selectUser);
  const recreateEntry = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const { id, ...set } = props.set;
    typedFirestore
      .collection("keysets")
      .doc(id as KeysetId)
      .set(
        {
          ...set,
          gbLaunch: props.set.gbMonth ? props.set.gbLaunch.slice(0, 7) : props.set.gbLaunch,
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
    close(true);
  };
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
  const close = (recreated = false) => {
    if (!recreated) {
      const fileNameRegex = /keysets%2F(.*)\?/;
      const regexMatch = props.set.image.match(fileNameRegex);
      if (regexMatch) {
        const imageName = regexMatch[1];
        deleteImages(imageName);
      }
    }
    props.close();
  };
  return (
    <Snackbar
      open={props.open}
      message={`${props.set.profile} ${props.set.colorway} has been deleted.`}
      onClose={() => close()}
      action={<SnackbarAction label="Undo" onClick={recreateEntry} />}
      dismissesOnAction={false}
    />
  );
};

export default SnackbarDeleted;
