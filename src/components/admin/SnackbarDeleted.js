import React from "react";
import PropTypes from "prop-types";
import firebase from "../firebase";
import { setTypes, queueTypes } from "../util/propTypeTemplates";
import { Snackbar, SnackbarAction } from "@rmwc/snackbar";

export const SnackbarDeleted = (props) => {
  const recreateEntry = (e) => {
    e.preventDefault();
    const db = firebase.firestore();
    db.collection("keysets")
      .add({
        ...props.set,
        gbLaunch: props.set.gbMonth ? props.set.gbLaunch.slice(0, 7) : props.set.gbLaunch,
        latestEditor: props.user.id,
      })
      .then((docRef) => {
        console.log("Document recreated with ID: ", docRef.id);
        props.snackbarQueue.notify({ title: "Entry successfully recreated." });
        props.getData();
      })
      .catch((error) => {
        console.error("Error recreating document: ", error);
        props.snackbarQueue.notify({ title: "Error recreating document: " + error });
      });
    props.close();
  };
  return (
    <Snackbar
      open={props.open}
      message={`${props.set.profile} ${props.set.colorway} has been deleted.`}
      onClose={props.close}
      action={<SnackbarAction label="Undo" onClick={recreateEntry} />}
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
