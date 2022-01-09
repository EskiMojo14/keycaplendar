import type { EntityId } from "@reduxjs/toolkit";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import firebase from "@s/firebase";
import { selectById, setLoading } from "@s/users";
import { getUsers } from "@s/users/functions";

export type DialogDeleteProps = {
  onClose: () => void;
  open: boolean;
  userId: EntityId;
};

export const DialogDelete = ({ onClose, open, userId }: DialogDeleteProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => selectById(state, userId));
  const deleteUser = () => {
    onClose();
    dispatch(setLoading(true));
    const deleteUser = firebase.functions().httpsCallable("deleteUser");
    deleteUser(user)
      .then((result) => {
        if (result.data.error) {
          queue.notify({ title: result.data.error });
          dispatch(setLoading(false));
        } else {
          queue.notify({
            title: `User ${user?.displayName} successfully deleted.`,
          });
          getUsers();
        }
      })
      .catch((error) => {
        queue.notify({ title: `Error deleting user: ${error}` });
        dispatch(setLoading(false));
      });
  };
  return (
    <Dialog open={open}>
      <DialogTitle>Delete User</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the user {user?.displayName}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" isDefaultAction onClick={onClose}>
          Cancel
        </DialogButton>
        <DialogButton
          action="accept"
          className="delete"
          onClick={() => deleteUser()}
        >
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
