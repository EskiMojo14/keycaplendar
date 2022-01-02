import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { queue } from "~/app/snackbar-queue";
import firebase from "@s/firebase";

type DialogDeleteProps = {
  close: () => void;
  open: boolean;
  signOut: () => void;
};

export const DialogDelete = ({ close, open, signOut }: DialogDeleteProps) => {
  const deleteAccount = () => {
    const deleteFn = firebase.functions().httpsCallable("deleteOwnUser");
    deleteFn()
      .then((result) => {
        if (result.data.error) {
          const {
            data: { error },
          } = result;
          queue.notify({ title: "Failed to delete account: " + error });
          console.log(
            `Failed to delete account: ${error}. Please contact keycaplendar@gmail.com if this issue reoccurs.`
          );
        } else if (result.data[0]?.error || result.data[1]?.error) {
          const error = result.data[0]?.error || result.data[1]?.error;
          queue.notify({ title: "Failed to delete account: " + error });
          console.log(
            `Failed to delete account: ${error}. Please contact keycaplendar@gmail.com if this issue reoccurs.`
          );
        } else {
          close();
          queue.notify({ title: "Account deleted." });
          signOut();
        }
      })
      .catch((error) => {
        queue.notify({ title: "Failed to delete account: " + error });
        console.log(
          `Failed to delete account: ${error}. Please contact keycaplendar@gmail.com if this issue reoccurs.`
        );
      });
  };
  return (
    <Dialog onClose={close} open={open}>
      <DialogTitle>Delete account</DialogTitle>
      <DialogContent>
        Are you sure you want to delete your account and all associated
        information? You will lose all information stored in the database, such
        as presets and favorites. This cannot be undone.
      </DialogContent>
      <DialogActions>
        <DialogButton onClick={close}>Cancel</DialogButton>
        <DialogButton className="delete" onClick={deleteAccount}>
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
