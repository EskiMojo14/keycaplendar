import React from "react";
import { QueueType } from "../../util/types";
import { Dialog, DialogActions, DialogButton, DialogContent, DialogTitle } from "@rmwc/dialog";

type DialogDeleteProps = {
  open: boolean;
  close: () => void;
  snackbarQueue: QueueType;
  signOut: () => void;
};

export const DialogDelete = (props: DialogDeleteProps) => {
  const deleteAccount = () => {
    props.close();
    props.snackbarQueue.notify({ title: "Account deleted." });
  };
  return (
    <Dialog open={props.open} onClose={props.close}>
      <DialogTitle>Delete account</DialogTitle>
      <DialogContent>
        Are you sure you want to delete your account and all associated information? You will lose all information
        stored in the database, such as presets and favourites. This cannot be undone.
      </DialogContent>
      <DialogActions>
        <DialogButton onClick={props.close}>Cancel</DialogButton>
        <DialogButton className="delete" onClick={deleteAccount}>
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
