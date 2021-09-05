import React from "react";
import { typedFirestore } from "@s/firebase/firestore";
import { queue } from "~/app/snackbar-queue";
import { UpdateId } from "@s/firebase/types";
import { UpdateEntryType } from "@s/updates/types";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";

type DialogDeleteProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
  entry: UpdateEntryType;
};

export const DialogDelete = (props: DialogDeleteProps) => {
  const deleteEntry = () => {
    typedFirestore
      .collection("updates")
      .doc(props.entry.id as UpdateId)
      .delete()
      .then(() => {
        queue.notify({ title: "Successfully deleted entry." });
        props.onClose();
        props.getEntries();
      })
      .catch((error) => {
        console.log("Failed to delete entry: " + error);
        queue.notify({ title: "Failed to delete entry: " + error });
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
