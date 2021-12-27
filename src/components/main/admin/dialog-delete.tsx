import { MouseEvent } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";
import { useAppSelector } from "~/app/hooks";
import { queue } from "~/app/snackbar-queue";
import { typedFirestore } from "@s/firebase/firestore";
import { KeysetDoc, KeysetId } from "@s/firebase/types";
import { getData } from "@s/main/functions";
import { SetType } from "@s/main/types";
import { selectUser } from "@s/user";

type DialogDeleteProps = {
  close: () => void;
  open: boolean;
  openSnackbar: () => void;
  set: SetType;
};

export const DialogDelete = (props: DialogDeleteProps) => {
  const user = useAppSelector(selectUser);
  const deleteEntry = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    typedFirestore
      .collection("keysets")
      .doc(props.set.id as KeysetId)
      .set({
        latestEditor: user.id,
      } as KeysetDoc)
      .then(() => {
        props.openSnackbar();
        getData();
      })
      .catch((error) => {
        console.error("Error deleting document: ", error);
        queue.notify({ title: "Error deleting document: " + error });
      });
    props.close();
  };
  return (
    <Dialog open={props.open}>
      <DialogTitle>{`Delete ${props.set.profile} ${props.set.colorway}`}</DialogTitle>
      <DialogContent>
        {`Are you sure you want to delete the entry for ${props.set.profile} ${props.set.colorway}`}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" onClick={props.close} isDefaultAction>
          Cancel
        </DialogButton>
        <DialogButton /*action="accept"*/ className="delete" onClick={deleteEntry}>
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
};

export default DialogDelete;
