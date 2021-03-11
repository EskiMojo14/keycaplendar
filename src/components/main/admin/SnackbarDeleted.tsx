import React, { useContext } from "react";
import firebase from "../../../firebase";
import { UserContext } from "../../../util/contexts";
import { getStorageFolders, batchStorageDelete } from "../../../util/functions";
import { QueueType, SetType } from "../../../util/types";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

type SnackbarDeletedProps = {
  close: () => void;
  getData: () => void;
  open: boolean;
  set: SetType;
  snackbarQueue: QueueType;
};

export const SnackbarDeleted = (props: SnackbarDeletedProps) => {
  const { user } = useContext(UserContext);
  const recreateEntry = (e: any) => {
    e.preventDefault();
    const { id, ...set } = props.set;
    const db = firebase.firestore();
    db.collection("keysets")
      .doc(id)
      .set(
        {
          ...set,
          gbLaunch: props.set.gbMonth ? props.set.gbLaunch.slice(0, 7) : props.set.gbLaunch,
          latestEditor: user.id,
        },
        { merge: true },
      )
      .then(() => {
        console.log("Document recreated with ID: ", id);
        props.snackbarQueue.notify({ title: "Entry successfully recreated." });
        props.getData();
      })
      .catch((error) => {
        console.error("Error recreating document: ", error);
        props.snackbarQueue.notify({ title: "Error recreating document: " + error });
      });
    close(true);
  };
  const deleteImages = async (name: string) => {
    const folders = await getStorageFolders();
    const allImages = folders.map((folder) => `${folder}/${name}`);
    batchStorageDelete(allImages)
      .then(() => {
        props.snackbarQueue.notify({ title: "Successfully deleted thumbnails." });
      })
      .catch((error) => {
        props.snackbarQueue.notify({ title: "Failed to delete thumbnails: " + error });
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
