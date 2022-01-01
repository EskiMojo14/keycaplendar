import type { MouseEvent } from "react";
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
import type { KeysetDoc, KeysetId } from "@s/firebase/types";
import { getData } from "@s/main/functions";
import type { SetType } from "@s/main/types";
import { selectUser } from "@s/user";

type DialogDeleteProps = {
  close: () => void;
  open: boolean;
  openSnackbar: () => void;
  set: SetType;
};

export const DialogDelete = ({
  close,
  open,
  openSnackbar,
  set,
}: DialogDeleteProps) => {
  const user = useAppSelector(selectUser);
  const deleteEntry = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    firestore
      .collection("keysets")
      .doc(set.id as KeysetId)
      .set({
        latestEditor: user.id,
      } as KeysetDoc)
      .then(() => {
        openSnackbar();
        getData();
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        queue.notify({ title: "Error deleting document: " + error });
      });
    close();
  };
  return (
    <Dialog open={open}>
      <DialogTitle>{`Delete ${set.profile} ${set.colorway}`}</DialogTitle>
      <DialogContent>
        {`Are you sure you want to delete the entry for ${set.profile} ${set.colorway}`}
        ?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" isDefaultAction onClick={close}>
          Cancel
        </DialogButton>
        <DialogButton
          /*action="accept"*/ className="delete"
          onClick={deleteEntry}
        >
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;
