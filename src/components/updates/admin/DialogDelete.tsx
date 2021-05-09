import React from "react";
import firebase from "../../../firebase";
import { QueueType, UpdateEntryType } from "../../../util/types";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";

const db = firebase.firestore();

type DialogDeleteProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
  entry: UpdateEntryType;
  snackbarQueue: QueueType;
};

export const DialogDelete = (props: DialogDeleteProps) => {
  const deleteEntry = () => {
    db.collection("updates")
      .doc(props.entry.id)
      .delete()
      .then(() => {
        props.snackbarQueue.notify({ title: "Successfully deleted entry." });
        props.onClose();
        props.getEntries();
      })
      .catch((error) => {
        console.log("Failed to delete entry: " + error);
        props.snackbarQueue.notify({ title: "Failed to delete entry: " + error });
      });
  };
  return (
    <Dialog open={props.open} onClose={props.onClose}>
      <DialogTitle>Delete &ldquo;{props.entry.title}&rdquo;</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the update entry &ldquo;{props.entry.title}&rdquo;? This cannot be undone.
      </DialogContent>
      <DialogActions>
        <DialogButton label="Cancel" onClick={props.onClose} />
        <DialogButton label="Confirm" onClick={deleteEntry} className="delete" />
      </DialogActions>
    </Dialog>
  );
};
