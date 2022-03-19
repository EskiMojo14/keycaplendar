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
import {
  deleteAction as deleteActionCreator,
  selectActionById,
} from "@s/audit";
import firestore from "@s/firebase/firestore";
import type { ChangelogId } from "@s/firebase/types";

type DialogAuditDeleteProps = {
  close: () => void;
  deleteAction: EntityId;
  open: boolean;
};

export const DialogAuditDelete = ({
  close,
  deleteAction,
  open,
}: DialogAuditDeleteProps) => {
  const dispatch = useAppDispatch();
  const action = useAppSelector((state) =>
    selectActionById(state, deleteAction)
  );

  const deleteActionFn = () => {
    firestore
      .collection("changelog")
      .doc(deleteAction as ChangelogId)
      .delete()
      .then(() => {
        queue.notify({ title: "Successfully deleted changelog entry." });
        dispatch(deleteActionCreator(deleteAction));
        close();
      })
      .catch((error) => {
        queue.notify({ title: `Error deleting changelog entry: ${error}` });
        close();
      });
  };

  return (
    <Dialog onClose={close} open={open}>
      <DialogTitle>Delete Action</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the changelog entry with the ID{" "}
        {action?.changelogId}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" isDefaultAction onClick={close}>
          Cancel
        </DialogButton>
        <DialogButton
          action="accept"
          className="delete"
          onClick={() => deleteActionFn()}
        >
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
