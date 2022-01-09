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
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import { selectById } from "@s/updates";

type DialogDeleteProps = {
  entryId: EntityId;
  getEntries: () => void;
  onClose: () => void;
  open: boolean;
};

export const DialogDelete = ({
  entryId,
  getEntries,
  onClose,
  open,
}: DialogDeleteProps) => {
  const entry = useAppSelector((state) => selectById(state, entryId));
  const deleteEntry = () => {
    firestore
      .collection("updates")
      .doc(entryId as UpdateId)
      .delete()
      .then(() => {
        queue.notify({ title: "Successfully deleted entry." });
        onClose();
        getEntries();
      })
      .catch((error) => {
        console.log(`Failed to delete entry: ${error}`);
        queue.notify({ title: `Failed to delete entry: ${error}` });
      });
  };
  return (
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Delete &ldquo;{entry?.title}&rdquo;</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the update entry &ldquo;{entry?.title}
        &rdquo;? This cannot be undone.
      </DialogContent>
      <DialogActions>
        <DialogButton label="Cancel" onClick={onClose} />
        <DialogButton
          className="delete"
          label="Confirm"
          onClick={deleteEntry}
        />
      </DialogActions>
    </Dialog>
  );
};
