import type { EntityId } from "@reduxjs/toolkit";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { useAppDispatch, useAppSelector } from "~/app/hooks";
import { notify } from "~/app/snackbar-queue";
import firebase from "@s/firebase";
import { selectUserById, setLoading } from "@s/users";
import { getUsers } from "@s/users/thunks";

export type DialogDeleteProps = {
  onClose: () => void;
  open: boolean;
  userId: EntityId;
};

export const DialogDelete = ({ onClose, open, userId }: DialogDeleteProps) => {
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => selectUserById(state, userId));
  const deleteUser = async () => {
    onClose();
    dispatch(setLoading(true));
    const deleteUser = firebase.functions().httpsCallable("deleteUser");
    try {
      const result = await deleteUser(user);

      if (result.data.error) {
        notify({ title: result.data.error });
        dispatch(setLoading(false));
      } else {
        notify({
          title: `User ${user?.displayName} successfully deleted.`,
        });
        dispatch(getUsers());
      }
    } catch (error) {
      notify({ title: `Error deleting user: ${error}` });
      dispatch(setLoading(false));
    }
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
