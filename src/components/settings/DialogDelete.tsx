import React from "react";
import firebase from "../../firebase";
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
    const deleteFn = firebase.functions().httpsCallable("deleteOwnUser");
    deleteFn()
      .then((result) => {
        if (result.data.error) {
          const error = result.data.error;
          props.snackbarQueue.notify({ title: "Failed to delete account: " + error });
          console.log(
            `Failed to delete account: ${error}. Please contact keycaplendar@gmail.com if this issue reoccurs.`
          );
        } else if ((result.data[0] && result.data[0].error) || (result.data[1] && result.data[1].error)) {
          const error = result.data[0].error ? result.data[0].error : result.data[1].error;
          props.snackbarQueue.notify({ title: "Failed to delete account: " + error });
          console.log(
            `Failed to delete account: ${error}. Please contact keycaplendar@gmail.com if this issue reoccurs.`
          );
        } else {
          props.close();
          props.snackbarQueue.notify({ title: "Account deleted." });
          props.signOut();
        }
      })
      .catch((error) => {
        props.snackbarQueue.notify({ title: "Failed to delete account: " + error });
        console.log(
          `Failed to delete account: ${error}. Please contact keycaplendar@gmail.com if this issue reoccurs.`
        );
      });
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
