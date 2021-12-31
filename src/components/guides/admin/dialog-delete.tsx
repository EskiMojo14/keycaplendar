import {
  Dialog,
  DialogActions,
  DialogButton,
  DialogContent,
  DialogTitle,
} from "@rmwc/dialog";
import { queue } from "~/app/snackbar-queue";
import firestore from "@s/firebase/firestore";
import type { GuideId } from "@s/firebase/types";
import type { GuideEntryType } from "@s/guides/types";

type DialogDeleteProps = {
  open: boolean;
  onClose: () => void;
  getEntries: () => void;
  entry: GuideEntryType;
};

export const DialogDelete = ({
  open,
  onClose,
  getEntries,
  entry,
}: DialogDeleteProps) => {
  const deleteEntry = () => {
    firestore
      .collection("guides")
      .doc(entry.id as GuideId)
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
    <Dialog onClose={onClose} open={open}>
      <DialogTitle>Delete &ldquo;{entry.title}&rdquo;</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the guide entry &ldquo;{entry.title}
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
