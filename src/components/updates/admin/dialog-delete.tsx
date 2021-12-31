import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { queue } from "~/app/snackbar-queue";
import firestore from "@s/firebase/firestore";
import type { UpdateId } from "@s/firebase/types";
import type { UpdateEntryType } from "@s/updates/types";

type DialogDeleteProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
  entry: UpdateEntryType;
};

export const DialogDelete = ({
  open,
  onClose,
  getEntries,
  entry,
}: DialogDeleteProps) => {
  const deleteEntry = () => {
    firestore
      .collection("updates")
      .doc(entry.id as UpdateId)
      .delete()
      .then(() => {
        queue.notify({ title: "Successfully deleted entry." });
        onClose();
        getEntries();
      })
      .catch((error) => {
        console.log("Failed to delete entry: " + error);
        queue.notify({ title: "Failed to delete entry: " + error });
      });
  };
  return (
    <Dialog open={open} onClose={onClose}>
      <DialogTitle>Delete &ldquo;{entry.title}&rdquo;</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the update entry &ldquo;{entry.title}
        &rdquo;? This cannot be undone.
      </DialogContent>
      <DialogActions>
        <DialogButton label="Cancel" onClick={onClose} />
        <DialogButton
          label="Confirm"
          onClick={deleteEntry}
          className="delete"
        />
      </DialogActions>
    </Dialog>
  );
};
