import React, { useContext } from "react";
import PropTypes from "prop-types";
import firebase from "../../../firebase";
import { UserContext } from "../../../util/contexts";
import { setTypes, queueTypes } from "../../../util/propTypeTemplates";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

const storage = firebase.storage();

const storageRef = storage.ref();

export const SnackbarDeleted = (props) => {
  const { user } = useContext(UserContext);
  const recreateEntry = (e) => {
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
        { merge: true }
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
  const deleteImages = async (name) => {
    const topLevel = await storageRef.listAll();
    const folders = topLevel.prefixes.map((folderRef) => {
      return folderRef.fullPath;
    });
    const allImages = folders.map((folder) => `${folder}/${name}`);
    Promise.all(
      allImages.map((path) => {
        const ref = storageRef.child(path);
        return ref
          .getMetadata()
          .then((metadata) => {
            // file exists
            return ref.delete();
          })
          .catch((error) => {
            // file doesn't exist
            console.log(error);
            return Promise.resolve();
          });
      })
    )
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
      const imageName = props.set.image.match(fileNameRegex)[1];
      deleteImages(imageName);
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

SnackbarDeleted.propTypes = {
  close: PropTypes.func,
  getData: PropTypes.func,
  open: PropTypes.bool,
  set: PropTypes.shape(setTypes()),
  snackbarQueue: PropTypes.shape(queueTypes),
};
