import React from "react";
import { ActionType } from "@s/audit/types";
import { Dialog, DialogTitle, DialogContent, DialogActions, DialogButton } from "@rmwc/dialog";

type DialogAuditDeleteProps = {
  close: () => void;
  deleteAction: ActionType;
  deleteActionFn: (action: ActionType) => void;
  open: boolean;
};

export const DialogAuditDelete = (props: DialogAuditDeleteProps) => (
    <Dialog open={props.open}>
      <DialogTitle>Delete Action</DialogTitle>
      <DialogContent>
        Are you sure you want to delete the changelog entry with the ID {props.deleteAction.changelogId}?
      </DialogContent>
      <DialogActions>
        <DialogButton action="close" onClick={props.close} isDefaultAction>
          Cancel
        </DialogButton>
        <DialogButton
          action="accept"
          className="delete"
          onClick={() => {
            props.deleteActionFn(props.deleteAction);
          }}
        >
          Delete
        </DialogButton>
      </DialogActions>
    </Dialog>
  );
