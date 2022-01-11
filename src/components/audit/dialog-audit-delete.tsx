import type { EntityId } from "@reduxjs/toolkit";
import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { selectById } from "@s/audit";
import { getActions } from "@s/audit/functions";
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
  const action = useAppSelector((state) => selectById(state, deleteAction));

  const deleteActionFn = (action: EntityId) => {
    firestore
      .collection("changelog")
      .doc(action as ChangelogId)
      .delete()
      .then(() => {
        queue.notify({ title: "Successfully deleted changelog entry." });
        getActions();
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
          onClick={() => {
            deleteActionFn(deleteAction);
          }}
        >
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};
