import React from "react";
import firebase from "../../../firebase";
import { useAppSelector } from "../../../app/hooks";
import { queue } from "../../../app/snackbarQueue";
import { SetType } from "../../../app/slices/main/types";
import { selectUser } from "../../../app/slices/user/userSlice";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";

type DialogDeleteProps = {
  close: () => void;
  getData: () => void;
  open: boolean;
  openSnackbar: () => void;
  set: SetType;
};

export const DialogDelete = (props: DialogDeleteProps) => {
  const user = useAppSelector(selectUser);
  const deleteEntry = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    const db = firebase.firestore();
    db.collection("keysets")
      .doc(props.set.id)
      .set({
        latestEditor: user.id,
      })
      .then(() => {
        props.openSnackbar();
        props.getData();
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
