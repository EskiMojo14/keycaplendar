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
import { deleteAction, selectActionById } from "@s/audit";

type DialogAuditDeleteProps = {
  close: () => void;
  deleteAction: EntityId;
  open: boolean;
};

export const DialogAuditDelete = ({
  close,
  deleteAction: deleteActionId,
  open,
}: DialogAuditDeleteProps) => {
  const dispatch = useAppDispatch();
  const action = useAppSelector((state) =>
    selectActionById(state, deleteActionId)
  );

  const deleteActionFn = async () => {
    try {
      await dispatch(deleteAction(deleteActionId)).unwrap();

      notify({ title: "Successfully deleted changelog entry." });
      close();
    } catch (error) {
      notify({ title: `Error deleting changelog entry: ${error}` });
      close();
    }
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
